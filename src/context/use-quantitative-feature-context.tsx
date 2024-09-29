// context/QuantitativeFeatureContext.tsx
'use client';

import React, { createContext, useContext } from 'react';
import { usePlanAddOn } from './use-plan-addon-context';
import { checkFeatureUsageLimit, incrementUsage } from '@/lib/queries'; // Your DB queries

interface QuantitativeFeatureContextType {
  checkLimitExceeded: (planFeatureId: string, type: 'account' | 'chatbot', id: string) => Promise<boolean>;
  incrementFeatureUsage: (planFeatureId: string, type: 'account' | 'chatbot', id: string) => Promise<void>;
}

const QuantitativeFeatureContext = createContext<QuantitativeFeatureContextType | undefined>(undefined);

export const QuantitativeFeatureProvider: React.FC = ({ children }) => {
  const { plan } = usePlanAddOn();

  const findFeatureInPlan = (planFeatureId: string) => {
    if (!plan || !plan.features) {
      console.warn('Plan or features not available');
      return null;
    }

    // Find the plan feature by its ID in the current plan
    return plan.features.find((f: any) => f.planFeatureId === planFeatureId);
  };

  const checkLimitExceeded = async (planFeatureId: string, type: 'account' | 'chatbot', id: string) => {
    const feature = findFeatureInPlan(planFeatureId);
    
    if (!feature) {
      console.warn(`Feature with planFeatureId "${planFeatureId}" not found in the current plan`);
      return false;
    }

    if (feature.value === null || feature.value === 'Unlimited') {
      return false; // Unlimited usage allowed
    }

    // Check usage limit via database
    const usageExceeded = await checkFeatureUsageLimit(planFeatureId, type, id);
    return usageExceeded >= feature.value;
  };

  const incrementFeatureUsage = async (planFeatureId: string, type: 'account' | 'chatbot', id: string) => {
    const feature = findFeatureInPlan(planFeatureId);

    if (!feature) {
      throw new Error(`Cannot increment usage for unsupported feature planFeatureId: ${planFeatureId}`);
    }

    await incrementUsage(planFeatureId, type, id); // Proceed to increment usage in DB
  };

  return (
    <QuantitativeFeatureContext.Provider value={{ checkLimitExceeded, incrementFeatureUsage }}>
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
