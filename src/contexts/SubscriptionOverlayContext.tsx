import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SubscriptionOverlayContextType {
  isOverlayActive: boolean;
  setIsOverlayActive: (active: boolean) => void;
}

const SubscriptionOverlayContext = createContext<SubscriptionOverlayContextType | undefined>(undefined);

export const useSubscriptionOverlay = () => {
  const context = useContext(SubscriptionOverlayContext);
  if (context === undefined) {
    throw new Error('useSubscriptionOverlay must be used within a SubscriptionOverlayProvider');
  }
  return context;
};

interface SubscriptionOverlayProviderProps {
  children: ReactNode;
}

export const SubscriptionOverlayProvider: React.FC<SubscriptionOverlayProviderProps> = ({ children }) => {
  const [isOverlayActive, setIsOverlayActive] = useState(false);

  return (
    <SubscriptionOverlayContext.Provider value={{
      isOverlayActive,
      setIsOverlayActive
    }}>
      {children}
    </SubscriptionOverlayContext.Provider>
  );
};