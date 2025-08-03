import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PricingModalContextType {
  isOpen: boolean;
  openPricingModal: (options?: {
    highlightPlan?: 'pass' | 'pass_plus';
    requiredFeature?: 'daily_mode' | 'bootcamp';
  }) => void;
  closePricingModal: () => void;
  highlightPlan?: 'pass' | 'pass_plus';
  requiredFeature?: 'daily_mode' | 'bootcamp';
}

const PricingModalContext = createContext<PricingModalContextType | undefined>(undefined);

export const usePricingModal = () => {
  const context = useContext(PricingModalContext);
  if (context === undefined) {
    throw new Error('usePricingModal must be used within a PricingModalProvider');
  }
  return context;
};

interface PricingModalProviderProps {
  children: ReactNode;
}

export const PricingModalProvider: React.FC<PricingModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightPlan, setHighlightPlan] = useState<'pass' | 'pass_plus' | undefined>();
  const [requiredFeature, setRequiredFeature] = useState<'daily_mode' | 'bootcamp' | undefined>();

  const openPricingModal = (options?: {
    highlightPlan?: 'pass' | 'pass_plus';
    requiredFeature?: 'daily_mode' | 'bootcamp';
  }) => {
    setHighlightPlan(options?.highlightPlan);
    setRequiredFeature(options?.requiredFeature);
    setIsOpen(true);
  };

  const closePricingModal = () => {
    setIsOpen(false);
    setHighlightPlan(undefined);
    setRequiredFeature(undefined);
  };

  return (
    <PricingModalContext.Provider value={{
      isOpen,
      openPricingModal,
      closePricingModal,
      highlightPlan,
      requiredFeature
    }}>
      {children}
    </PricingModalContext.Provider>
  );
};