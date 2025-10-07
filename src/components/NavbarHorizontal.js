
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Navbar.css';

// Light/Dark mode toggle button component
function LightDarkToggle() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const { user } = require('../context/AuthContext').useAuth();

  // Only update DOM and localStorage when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Only send PUT once per user click
  const handleToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (user && user.user_id) {
      const API_URL = process.env.REACT_APP_API_URL;
      console.log(`[DarkMode PUT] Navbar: Sending PUT for user ${user.user_id} with value:`, newMode ? 'on' : 'off');
      fetch(`${API_URL}/api/user-settings/${user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ darkMode: newMode ? 'on' : 'off', source: 'navbar', editor_user_id: user.user_id })
      });
    }
  };

  return (
    <button
      className="navbar-horizontal-link navbar-horizontal-btn"
      onClick={handleToggle}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Sun/Moon icon */}
      {darkMode ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="6" fill="#f1c40f" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#f1c40f" strokeWidth="2" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" fill="#2c3e50" />
        </svg>
      )}
    </button>
  );
}

function NavbarHorizontal() {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
  
    const handleButtonClick = () => {
      if (isLoggedIn) {
        logout();
      }
      navigate('/login');
    };
  
    return (
      <header className="navbar-horizontal">
  <div className="navbar-horizontal-content">
          <h1 className="navbar-horizontal-title">Tong ah</h1>
          <div className="navbar-horizontal-actions">
            {isLoggedIn && (
              <>
                <button
                  className="navbar-horizontal-link navbar-horizontal-btn"
                  onClick={() => navigate('/feedback')}
                  title="Feedback"
                >
                  {/* Feedback icon SVG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4h16v12H5.17L4 17.17V4z" stroke="#2c3e50" strokeWidth="2" fill="#fff" />
                    <circle cx="8" cy="10" r="1" fill="#2c3e50" />
                    <circle cx="12" cy="10" r="1" fill="#2c3e50" />
                    <circle cx="16" cy="10" r="1" fill="#2c3e50" />
                  </svg>
                </button>
                  {/* Light/Dark mode toggle button */}
                  <LightDarkToggle />
                <button
                  className="navbar-horizontal-link navbar-horizontal-btn"
                  onClick={() => navigate('/profile')}
                  title="Profile"
                >
                  {/* Simple user icon SVG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="#2c3e50" strokeWidth="2" fill="#fff" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#2c3e50" strokeWidth="2" fill="none" />
                  </svg>
                </button>
              </>
            )}
            <button className="navbar-horizontal-link" onClick={handleButtonClick}>
              {isLoggedIn ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>
      </header>
    );
}

export default NavbarHorizontal;