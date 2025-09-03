import React, { createContext, useState, useContext } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Provide the AuthContext to the app
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const login = (userObj) => {
    setIsLoggedIn(true);
    setUser(userObj);
    setRole(userObj.role || null);
  };
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export function useAuth() {
    return useContext(AuthContext);
  }