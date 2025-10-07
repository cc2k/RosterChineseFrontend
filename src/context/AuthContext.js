import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Provide the AuthContext to the app
export const AuthProvider = ({ children }) => {
  // Load initial state from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [roles, setRoles] = useState(() => {
    const stored = localStorage.getItem('roles');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    localStorage.setItem('user', user ? JSON.stringify(user) : '');
    localStorage.setItem('roles', JSON.stringify(roles));
  }, [isLoggedIn, user, roles]);

  const logWithDate = (...args) => {
    const now = new Date().toISOString();
    console.log(`[AuthContext][${now}]`, ...args);
  };

  const login = async (userObj) => {
    setIsLoggedIn(true);
    setUser(userObj);
    setRoles(userObj.roles || []);
    logWithDate('Login user:', userObj);
    logWithDate('Login roles:', userObj.roles);
    // Immediately refetch roles from backend after login
    await refetchUser();
  };
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setRoles([]);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
  };

  // Add a function to refetch user info/roles from backend
  const refetchUser = async () => {
    const currentUser = user || {};
    logWithDate('RefetchUser called for:', currentUser);
    if (!currentUser.user_id) return;
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const res = await fetch(`${API_URL}/api/users/${currentUser.user_id}`);
      const data = await res.json();
      logWithDate('RefetchUser response:', data);
      if (data && data.user_id) {
        setUser(data);
        setRoles(data.roles || []);
        logWithDate('Refetch roles:', data.roles);
      }
    } catch (err) {
      logWithDate('RefetchUser error:', err);
    }
  };

  // Call refetchUser after any role change
  useEffect(() => {
    refetchUser();
    // eslint-disable-next-line
  }, [roles.length]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, roles, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}