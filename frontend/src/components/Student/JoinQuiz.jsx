import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import './Student.css';

function JoinQuiz() {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();
  const { get, loading, error } = useApi();

  const [sessionCode, setSessionCode] = useState(urlCode || '');
  const [studentName, setStudentName] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    // Load saved name from localStorage
    const savedName = localStorage.getItem('studentName');
    if (savedName) {
      setStudentName(savedName);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!sessionCode.trim()) {
      setValidationError('Please enter a session code');
      return;
    }

    if (!studentName.trim()) {
      setValidationError('Please enter your name');
      return;
    }

    try {
      // Validate session exists
      const session = await get(`/api/sessions/code/${sessionCode.toUpperCase()}`);
      
      if (session.status === 'ended') {
        setValidationError('This quiz session has already ended');
        return;
      }

      // Save name for future use
      localStorage.setItem('studentName', studentName.trim());

      // Navigate to quiz room with state
      navigate(`/quiz/${sessionCode.toUpperCase()}`, {
        state: { studentName: studentName.trim() }
      });
    } catch (err) {
      setValidationError('Session not found. Please check the code.');
    }
  };

  return (
    <div className="student-page">
      <div className="join-container">
        <div className="card join-card">
          <h1>Join Quiz</h1>
          <p className="join-subtitle">Enter the session code to join</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Session Code</label>
              <input
                type="text"
                className="input code-input"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="Enter code (e.g., ABC123)"
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                className="input"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name"
                maxLength={30}
              />
            </div>

            {(validationError || error) && (
              <p className="error-message">{validationError || error}</p>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join Quiz'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JoinQuiz;
