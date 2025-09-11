import React from 'react';
import '../css/SettingsPage.css';

export default function UserSettings({ user, settings, onSettingChange }) {
  const [shiftColors, setShiftColors] = React.useState(settings?.shiftColors || 'off');

  React.useEffect(() => {
    setShiftColors(settings?.shiftColors || 'off');
  }, [settings]);

  const handleChange = async (val) => {
    setShiftColors(val);
    if (onSettingChange) onSettingChange('shiftColors', val);
    // Save to backend
    const API_URL = process.env.REACT_APP_API_URL;
    await fetch(`${API_URL}/api/user-settings/${user.user_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftColors: val })
    });
  };

  if (!user) return <div>Please log in to view settings.</div>;
  if (!settings) return <div>No settings found.</div>;

  return (
    <div className="settings-section">
      <div><strong>Username:</strong> {user.username}</div>
      {/* Render more settings fields here as needed */}
      {Object.entries(settings)
        .filter(([key]) => key !== 'shiftColors')
        .map(([key, value]) => (
          <div key={key}><strong>{key}:</strong> {String(value)}</div>
        ))}

      <div style={{ marginTop: 24 }}>
        <label style={{ fontWeight: 'bold' }}>Shift Color Options:</label>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <label>
            <input
              type="radio"
              name="shiftColors"
              value="off"
              checked={shiftColors === 'off'}
              onChange={() => handleChange('off')}
            />
            Off (default)
          </label>
          <label>
            <input
              type="radio"
              name="shiftColors"
              value="on"
              checked={shiftColors === 'on'}
              onChange={() => handleChange('on')}
            />
            On (Colors)
          </label>
        </div>
      </div>
    </div>
  );
}
