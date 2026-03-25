const Session = require("../models/Session");
const Quiz = require("../models/Quiz");

// Store active timers
const activeTimers = new Map();

const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Admin joins session room
    socket.on("admin-join", async ({ sessionId, token }) => {
      try {
        if (!token) {
          return socket.emit("error", {
            message: "Authorization token required",
          });
        }

        const jwt = require("jsonwebtoken");
        const JWT_SECRET =
          process.env.JWT_SECRET ||
          "quizplatform-super-secret-key-change-in-production";
        const decoded = jwt.verify(token, JWT_SECRET);

        const session = await Session.findById(sessionId).populate("quiz");
        if (session) {
          socket.join(session.code);
          socket.sessionCode = session.code;
          socket.isAdmin = true;
          socket.userId = decoded.userId;
          console.log(
            `Admin ${decoded.username} joined session: ${session.code}`,
          );
        }
      } catch (error) {
        console.error("Admin join auth error:", error);
        socket.emit("error", { message: "Unauthorized or invalid token" });
      }
    });

    // Student joins session
    socket.on(
      "student-join",
      async ({ sessionCode, studentName, visitorId }) => {
        try {
          const session = await Session.findOne({
            code: sessionCode.toUpperCase(),
          }).populate("quiz");

          if (!session) {
            return socket.emit("error", { message: "Session not found" });
          }

          if (session.status === "ended") {
            return socket.emit("error", {
              message: "This quiz session has ended",
            });
          }

          // Check if student already exists (reconnection)
          let participant = session.participants.find(
            (p) => p.visitorId === visitorId,
          );

          if (participant) {
            // Update socket ID for reconnection
            participant.socketId = socket.id;
            participant.isConnected = true;
          } else {
            // Add new participant
            participant = {
              visitorId,
              name: studentName,
              socketId: socket.id,
              responses: [],
              isConnected: true,
            };
            session.participants.push(participant);
          }

          await session.save();

          socket.join(sessionCode);
          socket.sessionCode = sessionCode;
          socket.visitorId = visitorId;
          socket.isAdmin = false;

          // Notify admin of new participant
          io.to(sessionCode).emit("participant-joined", {
            participant: { visitorId, name: studentName },
            totalParticipants: session.participants.length,
          });

          // Send current state to student
          socket.emit("session-state", {
            status: session.status,
            currentQuestionIndex: session.currentQuestionIndex,
            quiz: {
              title: session.quiz.title,
              totalQuestions: session.quiz.questions.length,
            },
          });

          // If quiz is active, send current question
          if (
            session.status === "active" &&
            session.currentQuestionIndex >= 0
          ) {
            const question =
              session.quiz.questions[session.currentQuestionIndex];
            const elapsed =
              Date.now() - new Date(session.questionStartTime).getTime();
            const remainingTime = Math.max(
              0,
              question.timerDuration * 1000 - elapsed,
            );

            socket.emit("question", {
              questionIndex: session.currentQuestionIndex,
              question: {
                text: question.text,
                options: question.options,
              },
              timerDuration: question.timerDuration,
              remainingTime: Math.ceil(remainingTime / 1000),
            });
          }

          console.log(`Student ${studentName} joined session: ${sessionCode}`);
        } catch (error) {
          console.error("Error in student-join:", error);
          socket.emit("error", { message: "Failed to join session" });
        }
      },
    );

    // Admin starts the quiz
    socket.on("start-quiz", async ({ sessionId }) => {
      try {
        const session = await Session.findById(sessionId).populate("quiz");

        if (!session || session.status !== "waiting") {
          return socket.emit("error", { message: "Cannot start quiz" });
        }

        session.status = "active";
        session.startedAt = new Date();
        session.currentQuestionIndex = 0;
        session.questionStartTime = new Date();
        await session.save();

        const question = session.quiz.questions[0];

        // Emit to all participants
        io.to(session.code).emit("quiz-started", {
          totalQuestions: session.quiz.questions.length,
        });

        io.to(session.code).emit("question", {
          questionIndex: 0,
          question: {
            text: question.text,
            options: question.options,
          },
          timerDuration: question.timerDuration,
          remainingTime: question.timerDuration,
        });

        // Start timer
        startQuestionTimer(io, session.code, sessionId, question.timerDuration);

        console.log(`Quiz started for session: ${session.code}`);
      } catch (error) {
        console.error("Error in start-quiz:", error);
        socket.emit("error", { message: "Failed to start quiz" });
      }
    });

    // Admin moves to next question
    socket.on("next-question", async ({ sessionId }) => {
      try {
        await moveToNextQuestion(io, sessionId);
      } catch (error) {
        console.error("Error in next-question:", error);
        socket.emit("error", { message: "Failed to move to next question" });
      }
    });

    // Student submits answer
    socket.on(
      "submit-answer",
      async ({ sessionCode, visitorId, questionIndex, answer, timeSpent }) => {
        try {
          const session = await Session.findOne({ code: sessionCode }).populate(
            "quiz",
          );

          if (!session || session.status !== "active") {
            return socket.emit("error", { message: "Quiz is not active" });
          }

          if (questionIndex !== session.currentQuestionIndex) {
            return socket.emit("error", { message: "Invalid question" });
          }

          const participant = session.participants.find(
            (p) => p.visitorId === visitorId,
          );
          if (!participant) {
            return socket.emit("error", { message: "Participant not found" });
          }

          // Check if already answered
          const existingResponse = participant.responses.find(
            (r) => r.questionIndex === questionIndex,
          );
          if (existingResponse) {
            return socket.emit("error", {
              message: "Already answered this question",
            });
          }

          // Validate answer wasn't submitted after timer expired
          const elapsed =
            Date.now() - new Date(session.questionStartTime).getTime();
          const question = session.quiz.questions[questionIndex];
          const maxTime = question.timerDuration * 1000 + 1000; // 1 second grace period

          if (elapsed > maxTime) {
            return socket.emit("error", { message: "Time expired" });
          }

          // Record the response
          const isCorrect = answer === question.correctAnswer;
          participant.responses.push({
            questionIndex,
            answer,
            isCorrect,
            timeSpent,
            submittedAt: new Date(),
          });

          await session.save();

          // Acknowledge submission
          socket.emit("answer-received", { questionIndex, received: true });

          // Count submissions for this question
          const submissionCount = session.participants.filter((p) =>
            p.responses.some((r) => r.questionIndex === questionIndex),
          ).length;

          // Notify admin of submission count
          io.to(sessionCode).emit("submission-update", {
            questionIndex,
            submissionCount,
            totalParticipants: session.participants.length,
          });

          console.log(
            `Answer submitted by ${participant.name} for question ${questionIndex}`,
          );
        } catch (error) {
          console.error("Error in submit-answer:", error);
          socket.emit("error", { message: "Failed to submit answer" });
        }
      },
    );

    // Admin ends quiz
    socket.on("end-quiz", async ({ sessionId }) => {
      try {
        const session = await Session.findById(sessionId).populate("quiz");

        if (!session) {
          return socket.emit("error", { message: "Session not found" });
        }

        // Clear any active timer
        const timerKey = `${session.code}`;
        if (activeTimers.has(timerKey)) {
          clearTimeout(activeTimers.get(timerKey));
          activeTimers.delete(timerKey);
        }

        session.status = "ended";
        session.endedAt = new Date();
        await session.save();

        // Calculate and send results
        const leaderboard = calculateLeaderboard(session);

        io.to(session.code).emit("quiz-ended", {
          leaderboard,
          sessionId: session._id,
        });

        console.log(`Quiz ended for session: ${session.code}`);
      } catch (error) {
        console.error("Error in end-quiz:", error);
        socket.emit("error", { message: "Failed to end quiz" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);

      if (socket.sessionCode && socket.visitorId && !socket.isAdmin) {
        try {
          const session = await Session.findOne({ code: socket.sessionCode });
          if (session) {
            const participant = session.participants.find(
              (p) => p.visitorId === socket.visitorId,
            );
            if (participant) {
              participant.isConnected = false;
              await session.save();

              io.to(socket.sessionCode).emit("participant-disconnected", {
                visitorId: socket.visitorId,
                name: participant.name,
              });
            }
          }
        } catch (error) {
          console.error("Error handling disconnect:", error);
        }
      }
    });
  });
};

// Helper function to start question timer
const startQuestionTimer = (io, sessionCode, sessionId, duration) => {
  const timerKey = sessionCode;

  // Clear existing timer if any
  if (activeTimers.has(timerKey)) {
    clearTimeout(activeTimers.get(timerKey));
  }

  // Emit timer sync every second
  let remaining = duration;
  const interval = setInterval(() => {
    remaining--;
    io.to(sessionCode).emit("timer-sync", { remaining });

    if (remaining <= 0) {
      clearInterval(interval);
    }
  }, 1000);

  // Auto-advance after timer expires
  const timeout = setTimeout(async () => {
    clearInterval(interval);
    await moveToNextQuestion(io, sessionId);
  }, duration * 1000);

  activeTimers.set(timerKey, timeout);
  activeTimers.set(`${timerKey}-interval`, interval);
};

// Helper function to move to next question
const moveToNextQuestion = async (io, sessionId) => {
  const session = await Session.findById(sessionId).populate("quiz");

  if (!session || session.status !== "active") return;

  // Clear existing timer
  const timerKey = session.code;
  if (activeTimers.has(timerKey)) {
    clearTimeout(activeTimers.get(timerKey));
    activeTimers.delete(timerKey);
  }
  if (activeTimers.has(`${timerKey}-interval`)) {
    clearInterval(activeTimers.get(`${timerKey}-interval`));
    activeTimers.delete(`${timerKey}-interval`);
  }

  const nextIndex = session.currentQuestionIndex + 1;

  // Check if quiz is complete
  if (nextIndex >= session.quiz.questions.length) {
    session.status = "ended";
    session.endedAt = new Date();
    await session.save();

    const leaderboard = calculateLeaderboard(session);
    io.to(session.code).emit("quiz-ended", {
      leaderboard,
      sessionId: session._id,
    });
    return;
  }

  // Move to next question
  session.currentQuestionIndex = nextIndex;
  session.questionStartTime = new Date();
  await session.save();

  const question = session.quiz.questions[nextIndex];

  io.to(session.code).emit("question", {
    questionIndex: nextIndex,
    question: {
      text: question.text,
      options: question.options,
    },
    timerDuration: question.timerDuration,
    remainingTime: question.timerDuration,
  });

  // Start new timer
  startQuestionTimer(io, session.code, sessionId, question.timerDuration);
};

// Helper function to calculate leaderboard
const calculateLeaderboard = (session) => {
  return session.participants
    .map((participant) => {
      const correctAnswers = participant.responses.filter(
        (r) => r.isCorrect,
      ).length;
      const totalTime = participant.responses.reduce(
        (sum, r) => sum + (r.timeSpent || 0),
        0,
      );

      return {
        visitorId: participant.visitorId,
        name: participant.name,
        score: correctAnswers,
        totalQuestions: session.quiz.questions.length,
        totalTime,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.totalTime - b.totalTime;
    });
};

module.exports = setupSocketHandlers;
