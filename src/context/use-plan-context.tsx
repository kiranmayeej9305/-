// context/PlanContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getPlanDetailsForUser } from './@lib/queries';

interface PlanContextType {
  plan: any;  // Contains the full plan details with features
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ userId: string }> = ({ userId, children }) => {
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    async function fetchPlan() {
      const planDetails = await getPlanDetailsForUser(userId);
      setPlan(planDetails);
    }
    fetchPlan();
  }, [userId]);

  return (
    <PlanContext.Provider value={{ plan }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
