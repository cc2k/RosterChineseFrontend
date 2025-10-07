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
      {/* Hamburger Icon - only show when menu is closed */}
      {!isMenuOpen && (
        <div className="hamburger-vertical" onClick={toggleMenu}>
          ☰
        </div>
      )}

      {/* Overlay to close navbar when clicking outside */}
      {isMenuOpen && (
        <div
          className="navbar-vertical-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Navbar */}
  <nav className={`navbar-vertical ${isMenuOpen ? 'open' : ''}`}>
        {/* Hamburger Icon inside navbar when open */}
        {isMenuOpen && (
          <div className="hamburger-vertical navbar-vertical-hamburger" onClick={toggleMenu}>
            ☰
          </div>
        )}
        <ul className="nav-vertical-links">
          <li>
            {isLoggedIn ? (
              <span className="navbar-vertical-logout" onClick={() => { logout(); toggleMenu(); }}>Logout</span>
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
          {roles && (roles.includes('admin') || roles.includes('superadmin')) && (
            <>
              <li>
                <Link to="/users" onClick={toggleMenu}>Users</Link>
              </li>
              <li>
                <Link to="/shifts" onClick={toggleMenu}>Shifts</Link>
              </li>
              <li>
                <Link to="/log" onClick={toggleMenu}>Audit Log</Link>
              </li>
            </>
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