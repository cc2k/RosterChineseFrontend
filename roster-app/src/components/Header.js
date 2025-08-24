import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Header.css';

function Header() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (isLoggedIn) {
      logout();
    }
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Tong ah
        </h1>
        <button className="header-link" onClick={handleButtonClick}>
          {isLoggedIn ? 'Logout' : 'Login'}
        </button>
      </div>
    </header>
  );
}

export default Header;