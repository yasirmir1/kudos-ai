import React, { createContext, useContext, useState, useEffect } from 'react';

export type AgeGroup = 'year 2-3' | 'year 4-5' | '11+';

interface AgeGroupContextType {
  selectedAgeGroup: AgeGroup;
  setSelectedAgeGroup: (ageGroup: AgeGroup) => void;
  ageGroups: { label: string; value: AgeGroup }[];
}

const AgeGroupContext = createContext<AgeGroupContextType | undefined>(undefined);

export const useAgeGroup = () => {
  const context = useContext(AgeGroupContext);
  if (!context) {
    throw new Error('useAgeGroup must be used within an AgeGroupProvider');
  }
  return context;
};

// Function to update age group from outside the context (e.g., from profile updates)
export const updateAgeGroupFromProfile = (ageGroup: AgeGroup) => {
  localStorage.setItem('selectedAgeGroup', ageGroup);
  // Dispatch custom event to notify context
  window.dispatchEvent(new CustomEvent('ageGroupUpdated', { detail: ageGroup }));
};

export const AgeGroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>('11+');

  const ageGroups = [
    { label: '11+ Preparation', value: '11+' as AgeGroup },
  ];

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selectedAgeGroup');
    if (stored && ageGroups.some(group => group.value === stored)) {
      setSelectedAgeGroup(stored as AgeGroup);
    } else {
      // If no stored value or stored value is not in available options, default to '11+'
      setSelectedAgeGroup('11+');
      localStorage.setItem('selectedAgeGroup', '11+');
    }
  }, []);

  // Listen for age group updates from profile changes
  useEffect(() => {
    const handleAgeGroupUpdate = (event: CustomEvent<AgeGroup>) => {
      const newAgeGroup = event.detail;
      if (ageGroups.some(group => group.value === newAgeGroup)) {
        setSelectedAgeGroup(newAgeGroup);
      }
    };

    window.addEventListener('ageGroupUpdated', handleAgeGroupUpdate as EventListener);
    
    return () => {
      window.removeEventListener('ageGroupUpdated', handleAgeGroupUpdate as EventListener);
    };
  }, [ageGroups]);

  // Save to localStorage whenever it changes
  const handleSetSelectedAgeGroup = (ageGroup: AgeGroup) => {
    setSelectedAgeGroup(ageGroup);
    localStorage.setItem('selectedAgeGroup', ageGroup);
  };

  return (
    <AgeGroupContext.Provider 
      value={{ 
        selectedAgeGroup, 
        setSelectedAgeGroup: handleSetSelectedAgeGroup, 
        ageGroups 
      }}
    >
      {children}
    </AgeGroupContext.Provider>
  );
};