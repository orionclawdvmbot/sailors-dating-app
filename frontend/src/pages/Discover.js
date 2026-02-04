import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Discover.css';

function Discover({ token }) {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matched, setMatched] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/profile/discover/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfiles(response.data);
    } catch (err) {
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= profiles.length) return;

    const targetProfile = profiles[currentIndex];

    try {
      const response = await axios.post(
        '/api/swipes',
        {
          targetUserId: targetProfile.id,
          direction
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.matched) {
        setMatched(targetProfile);
        setTimeout(() => setMatched(null), 3000);
      }

      setCurrentIndex(currentIndex + 1);
    } catch (err) {
      setError('Failed to process swipe');
    }
  };

  if (loading) return <div className="loading">Loading profiles...</div>;
  if (error) return <div className="loading error">{error}</div>;
  if (profiles.length === 0) return <div className="loading">No more profiles to discover</div>;
  if (currentIndex >= profiles.length) return <div className="loading">You've reviewed all profiles!</div>;

  const currentProfile = profiles[currentIndex];
  const photoUrl = currentProfile.photos?.[0] || 'https://via.placeholder.com/400';

  return (
    <div className="discover-container">
      <div className="card-stack">
        <div className="profile-card">
          {matched && (
            <div className="match-overlay">
              <div className="match-popup">
                <h2>🎉 It's a Match!</h2>
                <p>You and {currentProfile.first_name || currentProfile.username} matched!</p>
                <p className="match-message">Start chatting now!</p>
              </div>
            </div>
          )}
          
          <img 
            src={photoUrl} 
            alt={currentProfile.username}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }}
            className="profile-image"
          />
          
          <div className="profile-info">
            <h2>{currentProfile.first_name || currentProfile.username}</h2>
            <p className="location">📍 {currentProfile.location || 'Unknown'}</p>
            
            {currentProfile.age && <p className="detail">Age: {currentProfile.age}</p>}
            {currentProfile.sailing_level && <p className="detail">Level: {currentProfile.sailing_level}</p>}
            {currentProfile.boat_type && <p className="detail">Boat: {currentProfile.boat_type}</p>}
            
            {currentProfile.bio && <p className="bio">{currentProfile.bio}</p>}
          </div>
        </div>

        <div className="swipe-buttons">
          <button 
            className="btn-swipe btn-pass"
            onClick={() => handleSwipe('left')}
            title="Pass"
          >
            ✕
          </button>
          <div className="swipe-info">
            {currentIndex + 1} / {profiles.length}
          </div>
          <button 
            className="btn-swipe btn-like"
            onClick={() => handleSwipe('right')}
            title="Like"
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  );
}

export default Discover;
