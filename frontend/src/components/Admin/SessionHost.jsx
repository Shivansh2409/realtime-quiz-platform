import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useSocket } from "../../context/SocketContext";
import { useApi } from "../../hooks/useApi";
import "./Admin.css";

function SessionHost() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { get } = useApi();

  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timer, setTimer] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (!socket || !session) return;

    socket.emit("admin-join", {
      sessionId,
      token: localStorage.getItem("adminToken"),
    });

    socket.on("participant-joined", ({ participant, totalParticipants }) => {
      setParticipants((prev) => {
        const exists = prev.find((p) => p.visitorId === participant.visitorId);
        if (exists) return prev;
        return [...prev, participant];
      });
    });

    socket.on("participant-disconnected", ({ visitorId }) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.visitorId === visitorId ? { ...p, isConnected: false } : p,
        ),
      );
    });

    socket.on("question", ({ questionIndex, question, timerDuration }) => {
      setCurrentQuestion({ index: questionIndex, ...question });
      setTimer(timerDuration);
      setSubmissionCount(0);
    });

    socket.on("timer-sync", ({ remaining }) => {
      setTimer(remaining);
    });

    socket.on("submission-update", ({ submissionCount }) => {
      setSubmissionCount(submissionCount);
    });

    socket.on("quiz-ended", ({ leaderboard }) => {
      setQuizEnded(true);
    });

    return () => {
      socket.off("participant-joined");
      socket.off("participant-disconnected");
      socket.off("question");
      socket.off("timer-sync");
      socket.off("submission-update");
      socket.off("quiz-ended");
    };
  }, [socket, session]);

  const fetchSession = async () => {
    try {
      const data = await get(`/api/sessions/${sessionId}`);
      setSession(data);
      setParticipants(data.participants || []);
      if (data.status === "ended") {
        setQuizEnded(true);
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
    }
  };

  const handleStartQuiz = () => {
    socket.emit("start-quiz", { sessionId });
  };

  const handleNextQuestion = () => {
    socket.emit("next-question", { sessionId });
  };

  const handleEndQuiz = () => {
    if (confirm("Are you sure you want to end the quiz?")) {
      socket.emit("end-quiz", { sessionId });
    }
  };

  const getJoinUrl = () => {
    return `${window.location.origin}/join/${session?.code}`;
  };

  if (!session) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="card text-center">
            <p>Loading session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (quizEnded) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="card text-center">
            <h2>Quiz Ended!</h2>
            <p>The quiz has been completed.</p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => navigate(`/results/${sessionId}`)}
            >
              View Results
            </button>
            <button
              className="btn btn-secondary mt-4"
              onClick={() => navigate("/admin")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="session-header">
          <h1>{session.quiz?.title}</h1>
          <div className="connection-status">
            {isConnected ? (
              <span className="status-connected">● Connected</span>
            ) : (
              <span className="status-disconnected">● Disconnected</span>
            )}
          </div>
        </div>

        <div className="session-grid">
          {/* QR Code and Join Info */}
          {session.status === "waiting" && (
            <div className="card qr-card">
              <h2>Join Code: {session.code}</h2>
              <div className="qr-container">
                <QRCodeSVG value={getJoinUrl()} size={200} />
              </div>
              <p className="join-url">{getJoinUrl()}</p>
              <button
                className="btn btn-primary"
                onClick={handleStartQuiz}
                disabled={participants.length === 0}
              >
                Start Quiz ({participants.length} participants)
              </button>
            </div>
          )}

          {/* Current Question */}
          {session.status === "active" && currentQuestion && (
            <div className="card question-card">
              <div className="timer-display">
                <div className={`timer ${timer <= 5 ? "timer-warning" : ""}`}>
                  {timer}s
                </div>
              </div>
              <h2>Question {currentQuestion.index + 1}</h2>
              <p className="question-text">{currentQuestion.text}</p>
              <div className="options-preview">
                {currentQuestion.options.map((opt, i) => (
                  <div key={i} className="option-preview">
                    {String.fromCharCode(65 + i)}. {opt}
                  </div>
                ))}
              </div>
              <div className="submission-status">
                {submissionCount}/{participants.length} submitted
              </div>
              <div className="question-controls">
                <button
                  className="btn btn-primary"
                  onClick={handleNextQuestion}
                >
                  Next Question
                </button>
                <button className="btn btn-danger" onClick={handleEndQuiz}>
                  End Quiz
                </button>
              </div>
            </div>
          )}

          {/* Participants List */}
          <div className="card participants-card">
            <h2>Participants ({participants.length})</h2>
            <div className="participants-list">
              {participants.length === 0 ? (
                <p className="no-participants">Waiting for participants...</p>
              ) : (
                participants.map((p, i) => (
                  <div key={p.visitorId || i} className="participant-item">
                    <span className="participant-name">{p.name}</span>
                    <span
                      className={`participant-status ${p.isConnected !== false ? "online" : "offline"}`}
                    >
                      {p.isConnected !== false ? "●" : "○"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionHost;
