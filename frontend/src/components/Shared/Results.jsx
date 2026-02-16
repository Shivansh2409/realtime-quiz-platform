import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import './Results.css';

function Results() {
  const { sessionId } = useParams();
  const { get, loading } = useApi();
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await get(`/api/sessions/${sessionId}/results`);
        setResults(data);
      } catch (error) {
        console.error('Failed to fetch results:', error);
      }
    };

    if (sessionId) {
      fetchResults();
    }
  }, [sessionId, get]);

  if (loading) {
    return (
      <div className="results-page">
        <div className="card text-center">
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="results-page">
        <div className="card text-center">
          <p>Results not found</p>
          <Link to="/" className="btn btn-primary mt-4">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="results-container">
        <h1 className="results-title">🏆 Final Results</h1>
        <h2 className="quiz-title">{results.session?.quiz?.title}</h2>

        <div className="leaderboard card">
          <h3>Leaderboard</h3>
          <div className="leaderboard-list">
            {results.leaderboard.map((player, index) => (
              <div 
                key={player.id} 
                className={`leaderboard-item ${index < 3 ? `top-${index + 1}` : ''}`}
              >
                <div className="rank">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </div>
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                  <span className="player-score">
                    {player.score}/{player.totalQuestions} correct
                  </span>
                </div>
                <div className="player-time">
                  {(player.totalTime / 1000).toFixed(1)}s
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link to="/" className="btn btn-primary mt-4">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Results;
