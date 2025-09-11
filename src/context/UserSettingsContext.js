import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router';

const UserSettingsContext = createContext();

export function UserSettingsProvider({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refetch settings when user or route changes
  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }
    const API_URL = process.env.REACT_APP_API_URL;
    setLoading(true);
    fetch(`${API_URL}/api/user-settings/${user.user_id}`)
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setSettings(null);
        setLoading(false);
      });
  }, [user, location]);

  const updateSetting = async (key, value) => {
    if (!user) return;
    const API_URL = process.env.REACT_APP_API_URL;
    await fetch(`${API_URL}/api/user-settings/${user.user_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value })
    });
    // Re-fetch settings from backend to ensure sync
    const res = await fetch(`${API_URL}/api/user-settings/${user.user_id}`);
    const data = await res.json();
    setSettings(data);
  };

  return (
    <UserSettingsContext.Provider value={{ settings, loading, updateSetting }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  return useContext(UserSettingsContext);
}
