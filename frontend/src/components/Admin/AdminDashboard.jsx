import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import './Admin.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const { get, post, del, loading } = useApi();
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const data = await get('/api/quizzes');
      setQuizzes(data);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    }
  };

  const handleStartSession = async (quizId) => {
    try {
      const session = await post('/api/sessions', { quizId });
      navigate(`/admin/session/${session._id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      await del(`/api/quizzes/${quizId}`);
      setQuizzes(quizzes.filter(q => q._id !== quizId));
    } catch (error) {
      console.error('Failed to delete quiz:', error);
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <Link to="/admin/create" className="btn btn-primary">
            + Create New Quiz
          </Link>
        </div>

        <div className="quizzes-grid">
          {quizzes.length === 0 ? (
            <div className="card text-center">
              <p>No quizzes yet. Create your first quiz!</p>
            </div>
          ) : (
            quizzes.map(quiz => (
              <div key={quiz._id} className="quiz-card card">
                <h3>{quiz.title}</h3>
                <p className="quiz-description">{quiz.description || 'No description'}</p>
                <p className="quiz-meta">
                  {quiz.questions?.length || 0} questions • {quiz.defaultTimerDuration}s default timer
                </p>
                <div className="quiz-actions">
                  <button 
                    className="btn btn-success"
                    onClick={() => handleStartSession(quiz._id)}
                    disabled={loading}
                  >
                    Host Live
                  </button>
                  <Link to={`/admin/create?edit=${quiz._id}`} className="btn btn-secondary">
                    Edit
                  </Link>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <Link to="/" className="btn btn-secondary mt-4">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
