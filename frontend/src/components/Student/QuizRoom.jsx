import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { v4 as uuidv4 } from '../../utils/uuid';
import './Student.css';

function QuizRoom() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const [sessionState, setSessionState] = useState('waiting'); // waiting, active, ended
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timer, setTimer] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [quizInfo, setQuizInfo] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const questionStartTime = useRef(null);
  const visitorId = useRef(getOrCreateVisitorId());

  function getOrCreateVisitorId() {
    let id = localStorage.getItem('visitorId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('visitorId', id);
    }
    return id;
  }

  const studentName = location.state?.studentName || localStorage.getItem('studentName') || 'Anonymous';

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the session
    socket.emit('student-join', {
      sessionCode: code,
      studentName,
      visitorId: visitorId.current
    });

    // Listen for session state
    socket.on('session-state', ({ status, currentQuestionIndex, quiz }) => {
      setSessionState(status);
      setQuizInfo(quiz);
    });

    // Listen for quiz start
    socket.on('quiz-started', ({ totalQuestions }) => {
      setSessionState('active');
      setQuizInfo(prev => ({ ...prev, totalQuestions }));
    });

    // Listen for new questions
    socket.on('question', ({ questionIndex, question, timerDuration, remainingTime }) => {
      setCurrentQuestion({ index: questionIndex, ...question });
      setTimer(remainingTime || timerDuration);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      questionStartTime.current = Date.now();
    });

    // Listen for timer sync
    socket.on('timer-sync', ({ remaining }) => {
      setTimer(remaining);
    });

    // Listen for answer confirmation
    socket.on('answer-received', ({ received }) => {
      if (received) {
        setAnswerSubmitted(true);
      }
    });

    // Listen for quiz end
    socket.on('quiz-ended', ({ leaderboard, sessionId }) => {
      setSessionState('ended');
      setLeaderboard(leaderboard);
      setSessionId(sessionId);
    });

    // Listen for errors
    socket.on('error', ({ message }) => {
      console.error('Socket error:', message);
    });

    return () => {
      socket.off('session-state');
      socket.off('quiz-started');
      socket.off('question');
      socket.off('timer-sync');
      socket.off('answer-received');
      socket.off('quiz-ended');
      socket.off('error');
    };
  }, [socket, isConnected, code, studentName]);

  const handleSelectAnswer = (answerIndex) => {
    if (answerSubmitted || timer <= 0) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || answerSubmitted || !socket) return;

    const timeSpent = Date.now() - questionStartTime.current;

    socket.emit('submit-answer', {
      sessionCode: code,
      visitorId: visitorId.current,
      questionIndex: currentQuestion.index,
      answer: selectedAnswer,
      timeSpent
    });
  };

  // Render waiting screen
  if (sessionState === 'waiting') {
    return (
      <div className="student-page">
        <div className="quiz-container">
          <div className="card waiting-card text-center">
            <div className="waiting-icon">⏳</div>
            <h2>Waiting for Quiz to Start</h2>
            <p>Session Code: <strong>{code}</strong></p>
            <p>Welcome, <strong>{studentName}</strong>!</p>
            <p className="waiting-message">
              The host will start the quiz shortly...
            </p>
            <div className="connection-indicator">
              {isConnected ? (
                <span className="connected">● Connected</span>
              ) : (
                <span className="disconnected">● Connecting...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render quiz ended screen
  if (sessionState === 'ended') {
    const myResult = leaderboard?.find(p => p.visitorId === visitorId.current);
    const myRank = leaderboard?.findIndex(p => p.visitorId === visitorId.current) + 1;

    return (
      <div className="student-page">
        <div className="quiz-container">
          <div className="card results-card text-center">
            <h2>🎉 Quiz Complete!</h2>
            
            {myResult && (
              <div className="my-result">
                <div className="rank-badge">#{myRank}</div>
                <p className="result-score">
                  {myResult.score}/{myResult.totalQuestions} correct
                </p>
                <p className="result-time">
                  Total time: {(myResult.totalTime / 1000).toFixed(1)}s
                </p>
              </div>
            )}

            <button 
              className="btn btn-primary mt-4"
              onClick={() => navigate(`/results/${sessionId}`)}
            >
              View Full Leaderboard
            </button>

            <button 
              className="btn btn-secondary mt-4"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render active quiz
  return (
    <div className="student-page">
      <div className="quiz-container">
        {/* Timer */}
        <div className={`timer-bar ${timer <= 5 ? 'warning' : ''}`}>
          <div className="timer-value">{timer}s</div>
          <div className="timer-label">
            Question {currentQuestion?.index + 1} of {quizInfo?.totalQuestions}
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className="card question-card">
            <h2 className="question-text">{currentQuestion.text}</h2>

            <div className="options-grid">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${selectedAnswer === index ? 'selected' : ''} ${answerSubmitted ? 'disabled' : ''}`}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={answerSubmitted || timer <= 0}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>

            {selectedAnswer !== null && !answerSubmitted && timer > 0 && (
              <button 
                className="btn btn-success btn-block submit-btn"
                onClick={handleSubmitAnswer}
              >
                Submit Answer
              </button>
            )}

            {answerSubmitted && (
              <div className="submitted-message">
                ✓ Answer submitted! Waiting for next question...
              </div>
            )}

            {timer <= 0 && !answerSubmitted && (
              <div className="timeout-message">
                ⏰ Time's up!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizRoom;
