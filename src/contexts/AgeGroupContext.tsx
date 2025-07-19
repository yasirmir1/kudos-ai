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

export const AgeGroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>('year 4-5');

  const ageGroups = [
    { label: 'Year 2-3 (Ages 7-8)', value: 'year 2-3' as AgeGroup },
    { label: 'Year 4-5 (Ages 9-10)', value: 'year 4-5' as AgeGroup },
    { label: '11+ Preparation', value: '11+' as AgeGroup },
  ];

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selectedAgeGroup');
    if (stored && ageGroups.some(group => group.value === stored)) {
      setSelectedAgeGroup(stored as AgeGroup);
    }
  }, []);

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