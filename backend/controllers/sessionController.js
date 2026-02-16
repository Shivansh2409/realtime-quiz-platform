const Session = require("../models/Session");
const Quiz = require("../models/Quiz");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

// Generate unique session code
const generateSessionCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create a new session
exports.createSession = async (req, res) => {
  try {
    const { quizId } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const session = new Session({
      quiz: quizId,
      code: generateSessionCode(),
      status: "waiting",
      participants: [],
      currentQuestionIndex: -1,
    });

    await session.save();
    await session.populate("quiz");

    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get session by code
exports.getSessionByCode = async (req, res) => {
  try {
    const session = await Session.findOne({
      code: req.params.code.toUpperCase(),
    }).populate("quiz");

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get session by ID
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate("quiz");
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get session results/leaderboard
exports.getSessionResults = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate("quiz");
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Calculate scores for each participant
    const leaderboard = session.participants.map((participant) => {
      const correctAnswers = participant.responses.filter(
        (r) => r.isCorrect,
      ).length;
      const totalTime = participant.responses.reduce(
        (sum, r) => sum + (r.timeSpent || 0),
        0,
      );

      return {
        id: participant.visitorId,
        name: participant.name,
        score: correctAnswers,
        totalQuestions: session.quiz.questions.length,
        totalTime,
        responses: participant.responses,
      };
    });

    // Sort by score (desc), then by time (asc)
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.totalTime - b.totalTime;
    });

    res.json({ session, leaderboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// End a session
exports.endSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status: "ended", endedAt: new Date() },
      { new: true },
    ).populate("quiz");

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Emit end event to all participants
    const io = req.app.get("io");
    io.to(session.code).emit("quiz-ended", { sessionId: session._id });

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate QR code for session
exports.generateQRCode = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const joinUrl = `${clientUrl}/join/${session.code}`;

    const qrCode = await QRCode.toDataURL(joinUrl);

    res.json({ qrCode, joinUrl, code: session.code });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
