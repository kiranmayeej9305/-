'use client';

import React, { createContext, useContext } from 'react';
import { usePlanAddOn } from './use-plan-addon-context';

interface QuantitativeFeatureContextType {
  checkLimitExceeded: (featureName: string, usageCount: number) => boolean;
}

const QuantitativeFeatureContext = createContext<QuantitativeFeatureContextType | undefined>(undefined);

export const QuantitativeFeatureProvider: React.FC = ({ children }) => {
  const { plan } = usePlanAddOn();

  const checkLimitExceeded = (featureName: string, usageCount: number) => {
    console.log(plan);

    if (!plan || !plan.features) {
      console.warn("Plan or features not available");
      return false; // If the plan or features aren't available, assume no limit is exceeded
    }

    console.log("Plan features: ", plan.features); // Log features

    // Find the feature based on the feature identifier (not nested under 'feature')
    const feature = plan.features.find((f: any) => f.identifier === featureName);

    if (!feature) {
      console.warn(`Feature "${featureName}" not found`);
      return false; // Feature not found
    }

    // Check if the feature allows unlimited usage
    if (feature.value === null || feature.value === 'Unlimited') {
      return false; // Unlimited usage allowed
    }

    // Return whether the usage count exceeds the feature's value
    return feature.value !== undefined && usageCount >= feature.value;
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
