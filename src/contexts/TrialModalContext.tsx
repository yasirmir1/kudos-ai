import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TrialModalContextType {
  isOpen: boolean;
  openTrialModal: (options?: {
    planId?: 'pass' | 'pass_plus';
    requiredFeature?: 'daily_mode' | 'bootcamp';
    mode?: 'signup' | 'upgrade';
  }) => void;
  closeTrialModal: () => void;
  planId?: 'pass' | 'pass_plus';
  requiredFeature?: 'daily_mode' | 'bootcamp';
  mode?: 'signup' | 'upgrade';
}

const TrialModalContext = createContext<TrialModalContextType | undefined>(undefined);

export const useTrialModal = () => {
  const context = useContext(TrialModalContext);
  if (context === undefined) {
    throw new Error('useTrialModal must be used within a TrialModalProvider');
  }
  return context;
};

interface TrialModalProviderProps {
  children: ReactNode;
}

export const TrialModalProvider: React.FC<TrialModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [planId, setPlanId] = useState<'pass' | 'pass_plus' | undefined>();
  const [requiredFeature, setRequiredFeature] = useState<'daily_mode' | 'bootcamp' | undefined>();
  const [mode, setMode] = useState<'signup' | 'upgrade' | undefined>();

  const openTrialModal = (options?: {
    planId?: 'pass' | 'pass_plus';
    requiredFeature?: 'daily_mode' | 'bootcamp';
    mode?: 'signup' | 'upgrade';
  }) => {
    setPlanId(options?.planId);
    setRequiredFeature(options?.requiredFeature);
    setMode(options?.mode || 'signup');
    setIsOpen(true);
  };

  const closeTrialModal = () => {
    setIsOpen(false);
    setPlanId(undefined);
    setRequiredFeature(undefined);
    setMode(undefined);
  };

  return (
    <TrialModalContext.Provider value={{
      isOpen,
      openTrialModal,
      closeTrialModal,
      planId,
      requiredFeature,
      mode
    }}>
      {children}
    </TrialModalContext.Provider>
  );
};