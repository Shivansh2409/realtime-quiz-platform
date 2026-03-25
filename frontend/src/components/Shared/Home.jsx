import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="home-content fade-in-up">
        <h1 className="home-title">Real-Time Quiz Platform</h1>
        <p className="home-subtitle">
          Host live quizzes with synchronized timing and instant results
        </p>

        <div className="home-actions fade-in-up delay-1">
          <Link to="/admin" className="btn btn-primary home-btn">
            <span className="btn-icon">🎯</span>
            Host a Quiz
          </Link>
          <Link to="/join" className="btn btn-secondary home-btn">
            <span className="btn-icon">📝</span>
            Join a Quiz
          </Link>
        </div>

        <div className="home-features">
          <div className="feature fade-in-up delay-2">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">⚡</span>
            </div>
            <h3>Real-Time Sync</h3>
            <p>All participants see questions simultaneously</p>
          </div>
          <div className="feature fade-in-up delay-3">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">⏱️</span>
            </div>
            <h3>Timed Questions</h3>
            <p>Configurable timers (20s, 30s, 60s)</p>
          </div>
          <div className="feature fade-in-up delay-4">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">📊</span>
            </div>
            <h3>Live Leaderboard</h3>
            <p>Instant results and rankings</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
