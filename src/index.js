import React from 'react';
import ReactDOM from 'react-dom/client'; // Use 'react-dom/client' for React 18
import App from './App';
import { ToastProvider } from './components/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { UserSettingsProvider } from './context/UserSettingsContext';
import { BrowserRouter as Router } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AppWrapperWithUserSettings />
    </AuthProvider>
  </React.StrictMode>
);

// Helper to wrap App in Router and UserSettingsProvider in the correct order
function AppWrapperWithUserSettings() {
  return (
    <ToastProvider>
      <Router>
        <UserSettingsProvider>
          <App />
        </UserSettingsProvider>
      </Router>
    </ToastProvider>
  );
}