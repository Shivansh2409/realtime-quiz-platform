import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="home-content">
        <h1 className="home-title">Real-Time Quiz Platform</h1>
        <p className="home-subtitle">
          Host live quizzes with synchronized timing and instant results
        </p>
        
        <div className="home-actions">
          <Link to="/admin" className="btn btn-primary home-btn">
            Host a Quiz
          </Link>
          <Link to="/join" className="btn btn-secondary home-btn">
            Join a Quiz
          </Link>
        </div>

        <div className="home-features">
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <h3>Real-Time Sync</h3>
            <p>All participants see questions simultaneously</p>
          </div>
          <div className="feature">
            <span className="feature-icon">⏱️</span>
            <h3>Timed Questions</h3>
            <p>Configurable timers (20s, 30s, 60s)</p>
          </div>
          <div className="feature">
            <span className="feature-icon">📊</span>
            <h3>Live Leaderboard</h3>
            <p>Instant results and rankings</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
