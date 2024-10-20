'use client';

import React, { createContext, useContext } from 'react';
import { usePlanAddOn } from './use-plan-addon-context';

interface FeatureContextType {
  hasFeature: (featureIdentifier: string) => boolean;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { plan } = usePlanAddOn();

  const hasFeature = (featureIdentifier: string) => {
    if (!plan || !plan.features) {
      console.warn('Plan or features not available');
      return false;
    }

    // Check if the feature with the given identifier exists in the plan
    return plan.features.some((f: any) => f.identifier === featureIdentifier);
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
