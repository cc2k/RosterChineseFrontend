import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RosterPage from './pages/RosterPage';
import WelcomePage from './pages/WelcomePage'; 
import ProfilePage from './pages/ProfilePage';
import UserPage from './pages/UserPage';
import { useAuth } from './context/AuthContext';
import AccessDenied from './components/AccessDenied';
import AdminRoute from './components/AdminRoute';
import FeedbackPage from './pages/FeedbackPage';
import SettingsPage from './pages/SettingsPage';
import NavbarVertical from './components/NavbarVertical';
import NavbarHorizontal from './components/NavbarHorizontal';

import ShiftsPage from './pages/ShiftsPage';
import LogPage from './pages/LogPage';


function App() {
  const location = useLocation();
  const { isLoggedIn, roles } = useAuth();
  const showNavbarVertical = location.pathname !== '/' && location.pathname !== '/login';

  // Detect dark mode from localStorage
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    const handler = () => setDarkMode(localStorage.getItem('theme') === 'dark');
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    setDarkMode(localStorage.getItem('theme') === 'dark');
  });

  return (
    <div className="App">
      <NavbarHorizontal />
      {showNavbarVertical && <NavbarVertical />}
      <Routes>
        <Route path="/" element={<WelcomePage/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roster" element={<RosterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/shifts" element={
          <AdminRoute>
            <ShiftsPage />
          </AdminRoute>
        } />
        <Route path="/users" element={
          <AdminRoute>
            <UserPage />
          </AdminRoute>
        } />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/log" element={
          <AdminRoute>
            <LogPage />
          </AdminRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;