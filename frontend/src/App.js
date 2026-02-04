import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Discover from './pages/Discover';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <div className="app">
        {token && (
          <nav className="navbar">
            <div className="nav-container">
              <a href="/" className="nav-logo">⛵ Sailors</a>
              <ul className="nav-menu">
                <li><a href="/discover">Discover</a></li>
                <li><a href="/matches">Matches</a></li>
                <li><a href="/profile">Profile</a></li>
                <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
              </ul>
            </div>
          </nav>
        )}
        
        <Routes>
          <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/discover" />} />
          <Route path="/register" element={!token ? <Register onLogin={handleLogin} /> : <Navigate to="/discover" />} />
          <Route path="/discover" element={token ? <Discover token={token} /> : <Navigate to="/login" />} />
          <Route path="/matches" element={token ? <Matches token={token} /> : <Navigate to="/login" />} />
          <Route path="/chat/:matchId" element={token ? <Chat token={token} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={token ? <Profile token={token} /> : <Navigate to="/login" />} />
          <Route path="/" element={token ? <Navigate to="/discover" /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
