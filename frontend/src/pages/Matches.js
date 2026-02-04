import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Matches.css';

function Matches({ token }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/matches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(response.data);
    } catch (err) {
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading your matches...</div>;

  return (
    <div className="matches-container">
      <div className="page-header">
        <h1>Your Matches 💕</h1>
      </div>

      {error && <div className="error">{error}</div>}

      {matches.length === 0 ? (
        <div className="no-matches">
          <p>No matches yet. Start swiping to find your match!</p>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => (
            <div key={match.match_id} className="match-card">
              <img 
                src={match.photos?.[0] || 'https://via.placeholder.com/200'}
                alt={match.username}
                className="match-photo"
              />
              <div className="match-details">
                <h3>{match.first_name || match.username}</h3>
                <p className="match-date">
                  Matched {new Date(match.created_at).toLocaleDateString()}
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate(`/chat/${match.match_id}`)}
                >
                  Send Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Matches;
