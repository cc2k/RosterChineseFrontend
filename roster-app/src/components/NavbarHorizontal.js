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
        <div className="navbar-horizontal-content">
          <h1 className="navbar-horizontal-title">Tong ah
          </h1>
          <button className="navbar-horizontal-link" onClick={handleButtonClick}>
            {isLoggedIn ? 'Logout' : 'Login'}
          </button>
        </div>
      </header>
    );
}

export default NavbarHorizontal;