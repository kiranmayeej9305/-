'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getPlanDetailsForUser } from '@/lib/queries';

const PlanAddOnContext = createContext<any | undefined>(undefined);

export const PlanAddOnProvider = ({ userId, children }: { userId: string, children: React.ReactNode }) => {
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanAndAddOnDetails = async () => {
      if (!userId) {
        console.error("userId is missing");
        return;
      }
      
      try {
        const data = await getPlanDetailsForUser(userId);
        console.log("Fetched Plan Data: ", data);  // Log to check what data is being fetched
        setPlanData(data.plan);  // Assuming data.plan contains the actual plan details
      } catch (error) {
        console.error('Error fetching plan and add-on details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanAndAddOnDetails();
  }, [userId]);

  return (
    <PlanAddOnContext.Provider value={{ plan: planData, loading }}>
      {children}
    </PlanAddOnContext.Provider>
  );
};

export const usePlanAddOn = () => {
  const context = useContext(PlanAddOnContext);
  if (!context) {
    throw new Error('usePlanAddOn must be used within a PlanAddOnProvider');
  }
  return context;
};
