import React, { createContext, useState, useContext } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Provide the AuthContext to the app
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);

  const login = (userObj) => {
    setIsLoggedIn(true);
    setUser(userObj);
    setRoles(userObj.roles || []);
  };
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, roles, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export function useAuth() {
    return useContext(AuthContext);
  }