import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import '../css/LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
    const { login, roles, isLoggedIn } = useAuth();
 const navigate = useNavigate();
  const location = useLocation();
  // Removed unused loading state

  // Redirect if already logged in
  React.useEffect(() => {
    if (isLoggedIn) {
      const redirectTo = location.state?.from || '/roster';
      navigate(redirectTo, { replace: true });
    }
  }, [isLoggedIn, location.state, navigate]);
 

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }
  // setLoading(true); (removed)
    try {
  const API_URL = process.env.REACT_APP_API_URL;
  const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        login(result.user); // Store user object and role in context
        // Redirect to intended page or default to /roster
        const redirectTo = location.state?.from || '/roster';
        navigate(redirectTo);
      } else {
        setError(result.error || 'Invalid username or password.');
      }
    } catch (err) {
      setError('Error connecting to server.');
    }
  // setLoading(false); (removed)
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
          {roles && roles.length > 0 && <p className="role-message">Logged in as: <strong>{roles.join(', ')}</strong></p>}
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="button" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

export default LoginPage;