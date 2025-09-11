import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Navbar.css';


function NavbarVertical() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, logout, roles } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Only render the navbar if the user is logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* Hamburger Icon */}
      <div className="hamburger-vertical" onClick={toggleMenu}>
        ☰
      </div>

      {/* Overlay to close navbar when clicking outside */}
      {isMenuOpen && (
        <div
          className="navbar-vertical-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0)',
            zIndex: 998
          }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Navbar */}
      <nav className={`navbar-vertical ${isMenuOpen ? 'open' : ''}`} style={{ zIndex: 999 }}>
        <ul className="nav-vertical-links">
          <li>
            {isLoggedIn ? (
              <span style={{ cursor: 'pointer' }} onClick={() => { logout(); toggleMenu(); }}>Logout</span>
            ) : (
              <Link to="/" onClick={toggleMenu}>Login</Link>
            )}
          </li>
          <li></li>
          <li>
            <Link to="/roster" onClick={toggleMenu}>Roster</Link>
          </li>
          <li>
            <Link to="/profile" onClick={toggleMenu}>Profile</Link>
          </li>
          {roles && roles.includes('admin') && (
            <li>
              <Link to="/users" onClick={toggleMenu}>Users</Link>
            </li>
          )}
          <li>
            <Link to="/settings" onClick={toggleMenu}>Settings</Link>
          </li>
          <li style={{ marginTop: 'auto' }}>
            <Link to="/feedback" onClick={toggleMenu}>Feedback</Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default NavbarVertical;