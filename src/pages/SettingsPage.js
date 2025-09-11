import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

import UserSettings from '../components/UserSettings';
import '../css/SettingsPage.css';

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    const API_URL = process.env.REACT_APP_API_URL;
    fetch(`${API_URL}/api/user-settings/${user.user_id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
      })
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

  if (!user) return <div>Please log in to view settings.</div>;
  if (loading) return <div>Loading settings...</div>;
  if (error) return <div>Error: {error}</div>;

  // Update settings in state when changed in UserSettings
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  return (
    <div className="settings-page-container">
      <h2>User Settings</h2>
      <UserSettings user={user} settings={settings} onSettingChange={handleSettingChange} />
    </div>
  );
}
