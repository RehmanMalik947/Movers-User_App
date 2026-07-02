import React, { createContext, useContext, useState } from 'react';

const DriverOnlineContext = createContext({
  isOnline: false,
  setIsOnline: () => {},
});

export function DriverOnlineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(false);
  return (
    <DriverOnlineContext.Provider value={{ isOnline, setIsOnline }}>
      {children}
    </DriverOnlineContext.Provider>
  );
}

export function useDriverOnline() {
  return useContext(DriverOnlineContext);
}
