import React from 'react';
import { useAuth } from '../context/AuthContext';
import { hasRequiredRole } from '../utils/roleUtils';
import '../css/SettingsPage.css';

export default function UserSettings({ user, settings, onSettingChange }) {
  const [shiftColors, setShiftColors] = React.useState(settings?.shiftColors || 'off');
  const [darkMode, setDarkMode] = React.useState(settings?.darkMode === 'on');
  const { roles: userRoles } = useAuth();

  React.useEffect(() => {
    setShiftColors(settings?.shiftColors || 'off');
    setDarkMode(settings?.darkMode === 'on');
  }, [settings]);

  // Only send PUT when user interacts with the form, not when state changes externally
  const handleChange = async (key, val) => {
    if (key === 'shiftColors') setShiftColors(val);
    if (key === 'darkMode') setDarkMode(val === 'on');
    if (onSettingChange) onSettingChange(key, val);
    // Only update backend if value actually changed AND this is a direct user action
    if (settings && settings[key] === val) return;
    // Use a flag to prevent double PUT if triggered by external state
    if (typeof window !== 'undefined') {
      if (!window.__userSettingsDirectChange) window.__userSettingsDirectChange = {};
      if (window.__userSettingsDirectChange[key]) {
        window.__userSettingsDirectChange[key] = false;
        const API_URL = process.env.REACT_APP_API_URL;
        // Apply dark mode immediately if changed from settings
        if (key === 'darkMode') {
          if (val === 'on') {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
          } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
          }
          console.log(`[DarkMode PUT] SettingsPage: Sending PUT for user ${user.user_id} with value:`, val);
        }
        // Send only the changed key and source as top-level properties
        await fetch(`${API_URL}/api/user-settings/${user.user_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [key]: val, source: 'settingspage', editor_user_id: user.user_id })
        });
      }
    }
  };

  // Set flag before calling handleChange from input
  const handleInputChange = (key, val) => {
    if (typeof window !== 'undefined') {
      if (!window.__userSettingsDirectChange) window.__userSettingsDirectChange = {};
      window.__userSettingsDirectChange[key] = true;
    }
    handleChange(key, val);
  };

  if (!user) return <div>Please log in to view settings.</div>;
  if (!settings) return <div>No settings found.</div>;
  if (!hasRequiredRole(userRoles, 'admin')) {
    return (
      <div className="settings-note">
        You do not have permission to change settings.
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div><strong>Username:</strong> {user.username}</div>
      {/* Render more settings fields here as needed */}
      {Object.entries(settings)
        .filter(([key]) => key !== 'shiftColors' && key !== 'darkMode' && key !== 'source')
        .map(([key, value]) => (
          <div key={key}><strong>{key}:</strong> {String(value)}</div>
        ))}

      <div className="settings-section">
        <label className="settings-label">Shift Color Options:</label>
        <div className="settings-flex">
          <label>
            <input
              type="radio"
              name="shiftColors"
              value="off"
              checked={shiftColors === 'off'}
              onChange={() => handleInputChange('shiftColors', 'off')}
            />
            Off (default)
          </label>
          <label>
            <input
              type="radio"
              name="shiftColors"
              value="on"
              checked={shiftColors === 'on'}
              onChange={() => handleInputChange('shiftColors', 'on')}
            />
            On (Colors)
          </label>
        </div>
      </div>

      <div className="settings-section">
        <label className="settings-label">Dark Mode:</label>
        <div className="settings-flex">
          <label>
            <input
              type="radio"
              name="darkMode"
              value="off"
              checked={!darkMode}
              onChange={() => handleInputChange('darkMode', 'off')}
            />
            Off
          </label>
          <label>
            <input
              type="radio"
              name="darkMode"
              value="on"
              checked={darkMode}
              onChange={() => handleInputChange('darkMode', 'on')}
            />
            On
          </label>
        </div>
      </div>
    </div>
  );
}
