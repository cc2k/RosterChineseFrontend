import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RosterPage from './pages/RosterPage';
import WelcomePage from './pages/WelcomePage'; 
import ProfilePage from './pages/ProfilePage';
import UserPage from './pages/UserPage';
import NavbarVertical from './components/NavbarVertical';
import NavbarHorizontal from './components/NavbarHorizontal';

function App() {
  const location = useLocation();

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
        <Route path="/users" element={<UserPage />} />
      </Routes>
    </>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}