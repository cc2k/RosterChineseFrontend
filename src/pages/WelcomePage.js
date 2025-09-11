
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function WelcomePage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/roster', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="welcome-container">
      <h1>Welcome to Tong ah</h1>
      <p>This is the home page of your application.</p>
    </div>
  );
}

export default WelcomePage;