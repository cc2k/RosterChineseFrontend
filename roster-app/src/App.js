import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RosterPage from './pages/RosterPage';
import WelcomePage from './pages/WelcomePage'; 
import Header from './components/Header';
import Navbar from './components/Navbar';

function App() {
  const location = useLocation();

  // Define routes where the Navbar should be visible
  const showNavbar = location.pathname !== '/' && location.pathname !== '/login';

  return (
    <>
    <Header />
    {showNavbar && <Navbar />}
    
      <Routes>
        <Route path="/" element={<WelcomePage/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roster" element={<RosterPage />} />
        <Route path="/login" element={<LoginPage />} />
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