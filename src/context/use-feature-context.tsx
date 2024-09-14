// context/FeatureContext.tsx
import React, { createContext, useContext } from 'react';
import { usePlan } from './use-plan-context';

interface FeatureContextType {
  hasFeature: (featureName: string) => boolean;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const FeatureProvider: React.FC = ({ children }) => {
  const { plan } = usePlan();

  const hasFeature = (featureName: string) => {
    if (!plan) return false;
    return plan.features.some((f: any) => f.feature.name === featureName);
  };

  return (
    <FeatureContext.Provider value={{ hasFeature }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeature = () => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeature must be used within a FeatureProvider');
  }
  return context;
};
