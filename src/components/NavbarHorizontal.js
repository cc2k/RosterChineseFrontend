import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the AuthContext
import '../css/Navbar.css';

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
        <div className="navbar-horizontal-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1 className="navbar-horizontal-title">Tong ah</h1>
          <div className="navbar-horizontal-actions" style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'center', marginLeft: 'auto' }}>
            {isLoggedIn && (
              <>
                <button
                  className="navbar-horizontal-link"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
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
                <button
                  className="navbar-horizontal-link"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
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