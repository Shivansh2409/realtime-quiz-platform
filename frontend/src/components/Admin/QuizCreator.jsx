import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import './Admin.css';

function QuizCreator() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { get, post, put, loading } = useApi();

  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    defaultTimerDuration: 30,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    timerDuration: 30
  });

  useEffect(() => {
    if (editId) {
      fetchQuiz(editId);
    }
  }, [editId]);

  const fetchQuiz = async (id) => {
    try {
      const data = await get(`/api/quizzes/${id}`);
      setQuiz(data);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    }
  };

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({
      ...prev,
      [name]: name === 'defaultTimerDuration' ? Number(value) : value
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: name === 'correctAnswer' || name === 'timerDuration' ? Number(value) : value
    }));
  };

  const handleOptionChange = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.text || currentQuestion.options.some(o => !o)) {
      alert('Please fill in all fields');
      return;
    }

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      timerDuration: quiz.defaultTimerDuration
    });
  };

  const removeQuestion = (index) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quiz.title || quiz.questions.length === 0) {
      alert('Please add a title and at least one question');
      return;
    }

    try {
      if (editId) {
        await put(`/api/quizzes/${editId}`, quiz);
      } else {
        await post('/api/quizzes', quiz);
      }
      navigate('/admin');
    } catch (error) {
      console.error('Failed to save quiz:', error);
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <h1>{editId ? 'Edit Quiz' : 'Create New Quiz'}</h1>

        <form onSubmit={handleSubmit} className="quiz-form">
          <div className="card mb-4">
            <h2>Quiz Details</h2>
            
            <div className="form-group">
              <label>Quiz Title</label>
              <input
                type="text"
                name="title"
                className="input"
                value={quiz.title}
                onChange={handleQuizChange}
                placeholder="Enter quiz title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                className="input"
                value={quiz.description}
                onChange={handleQuizChange}
                placeholder="Enter quiz description (optional)"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Default Timer Duration</label>
              <select
                name="defaultTimerDuration"
                className="input"
                value={quiz.defaultTimerDuration}
                onChange={handleQuizChange}
              >
                <option value={20}>20 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>
          </div>

          <div className="card mb-4">
            <h2>Add Question</h2>
            
            <div className="form-group">
              <label>Question Text</label>
              <input
                type="text"
                name="text"
                className="input"
                value={currentQuestion.text}
                onChange={handleQuestionChange}
                placeholder="Enter your question"
              />
            </div>

            <div className="form-group">
              <label>Options</label>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="option-input">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={index}
                    checked={currentQuestion.correctAnswer === index}
                    onChange={handleQuestionChange}
                  />
                  <input
                    type="text"
                    className="input"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
              ))}
              <small>Select the radio button next to the correct answer</small>
            </div>

            <div className="form-group">
              <label>Timer Duration (for this question)</label>
              <select
                name="timerDuration"
                className="input"
                value={currentQuestion.timerDuration}
                onChange={handleQuestionChange}
              >
                <option value={20}>20 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>

            <button type="button" className="btn btn-secondary" onClick={addQuestion}>
              + Add Question
            </button>
          </div>

          {quiz.questions.length > 0 && (
            <div className="card mb-4">
              <h2>Questions ({quiz.questions.length})</h2>
              <div className="questions-list">
                {quiz.questions.map((q, index) => (
                  <div key={index} className="question-item">
                    <div className="question-header">
                      <strong>Q{index + 1}:</strong> {q.text}
                      <button 
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeQuestion(index)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="question-options">
                      {q.options.map((opt, i) => (
                        <span 
                          key={i} 
                          className={`option-tag ${i === q.correctAnswer ? 'correct' : ''}`}
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                    <small>Timer: {q.timerDuration}s</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {editId ? 'Update Quiz' : 'Create Quiz'}
            </button>
            <Link to="/admin" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuizCreator;
