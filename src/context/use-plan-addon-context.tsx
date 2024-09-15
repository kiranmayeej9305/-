// src/context/use-plan-addon-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getPlanDetailsForUser } from '@/lib/queries';

// Define the shape of the context
const PlanAddOnContext = createContext(null);

// Provider component
export const PlanAddOnProvider = ({ userId, children }) => {
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanAndAddOnDetails = async () => {
      try {
        const data = await getPlanDetailsForUser(userId);
        setPlanData(data);
      } catch (error) {
        console.error('Error fetching plan and add-on details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanAndAddOnDetails();
  }, [userId]);

  return (
    <PlanAddOnContext.Provider value={{ planData, loading }}>
      {children}
    </PlanAddOnContext.Provider>
  );
};

// Custom hook for using the PlanAddOnContext
export const usePlanAddOn = () => {
  const context = useContext(PlanAddOnContext);
  if (!context) {
    throw new Error('usePlanAddOn must be used within a PlanAddOnProvider');
  }
  return context;
};
