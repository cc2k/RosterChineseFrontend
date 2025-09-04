import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Navbar.css';

function NavbarVertical() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();

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

      {/* Navbar */}
      <nav className={`navbar-vertical ${isMenuOpen ? 'open' : ''}`}>
        <ul className="nav-vertical-links">
          <li>
            {isLoggedIn ? (
              <span style={{ cursor: 'pointer' }} onClick={() => { logout(); toggleMenu(); }}>Logout</span>
            ) : (
              <Link to="/" onClick={toggleMenu}>Login</Link>
            )}
          </li>
          <li>
          </li>
          <li>
            <Link to="/roster" onClick={toggleMenu}>Roster</Link>
          </li>
              <li>
                <Link to="/profile" onClick={toggleMenu}>Profile</Link>
              </li>
            <li>
              <Link to="/users" onClick={toggleMenu}>UserPage</Link>
            </li>
        </ul>
      </nav>
    </>
  );
}

export default NavbarVertical;