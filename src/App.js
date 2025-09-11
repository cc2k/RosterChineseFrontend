import React from 'react';
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

function App() {
  const location = useLocation();
  const { isLoggedIn, roles } = useAuth();

  // Define routes where the Navbar should be visible
  const showNavbarVertical = location.pathname !== '/' && location.pathname !== '/login';



  return (
    <>
      <NavbarHorizontal />
      {showNavbarVertical && <NavbarVertical />}
      <Routes>
        <Route path="/" element={<WelcomePage/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roster" element={<RosterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/users" element={
          <AdminRoute>
            <UserPage />
          </AdminRoute>
        } />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </>
  );
}

export default App;