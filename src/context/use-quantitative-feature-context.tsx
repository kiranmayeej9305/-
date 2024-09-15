// context/QuantitativeFeatureContext.tsx
import React, { createContext, useContext } from 'react';
import { usePlanAddOn } from './use-plan-addon-context';

interface QuantitativeFeatureContextType {
  checkLimitExceeded: (featureName: string, usageCount: number) => boolean;
}

const QuantitativeFeatureContext = createContext<QuantitativeFeatureContextType | undefined>(undefined);

export const QuantitativeFeatureProvider: React.FC = ({ children }) => {
  const { plan } = usePlanAddOn();

  const checkLimitExceeded = (featureName: string, usageCount: number) => {
    const feature = plan?.features.find((f: any) => f.feature.name === featureName);
    if (feature?.value === null) return false; // Unlimited
    return feature?.value !== undefined && usageCount >= feature.value;
  };

  return (
    <QuantitativeFeatureContext.Provider value={{ checkLimitExceeded }}>
      {children}
    </QuantitativeFeatureContext.Provider>
  );
};

export const useQuantitativeFeature = () => {
  const context = useContext(QuantitativeFeatureContext);
  if (!context) {
    throw new Error('useQuantitativeFeature must be used within a QuantitativeFeatureProvider');
  }
  return context;
};
