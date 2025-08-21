import React, { createContext, useState } from 'react';

export const RosterContext = createContext();

export const RosterProvider = ({ children }) => {
  const [roster, setRoster] = useState([]);

  const addDate = (date) => setRoster([...roster, date]);

  return (
    <RosterContext.Provider value={{ roster, addDate }}>
      {children}
    </RosterContext.Provider>
  );
};