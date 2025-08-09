// src/context/TreasuryContext.jsx
import React, { createContext, useContext, useState } from 'react';

// Create the context
const TreasuryContext = createContext();

// Create a provider component
export function TreasuryProvider({ children }) {
  const [lastTransactionUpdate, setLastTransactionUpdate] = useState(Date.now());
  
  // Function to trigger dashboard refresh
  const refreshDashboard = () => {
    console.log('refreshDashboard called with timestamp:', Date.now());
    setLastTransactionUpdate(Date.now());
  };
  
  // Provide the context value to children
  return (
    <TreasuryContext.Provider value={{ lastTransactionUpdate, refreshDashboard }}>
      {children}
    </TreasuryContext.Provider>
  );
}

// Custom hook to use the context
export function useTreasury() {
  const context = useContext(TreasuryContext);
  if (context === undefined) {
    throw new Error('useTreasury must be used within a TreasuryProvider');
  }
  return context;
}