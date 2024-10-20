'use client';

import SubscriptionFormWrapperWithProvider from '@/components/forms/subscription-form/subscription-form-wrapper';
import CustomModal from '@/components/global/custom-modal';
import { useModal } from '@/providers/modal-provider';
import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { usePlanAddOn } from '@/context/use-plan-addon-context';

// Define the props type for the component
interface SubscriptionHelperProps {
  customerId: string;   // customerId is a string
  planExists: boolean;  // planExists is a boolean
}

const SubscriptionHelper: React.FC<SubscriptionHelperProps> = ({ customerId, planExists }) => {
  const { setOpen } = useModal();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const { planData, loading } = usePlanAddOn();

  useEffect(() => {
    if (loading) return;

    if (plan && planData) {
      setOpen(
        <CustomModal title="Upgrade Plan!" subheading="Get access to premium features">
          <SubscriptionFormWrapperWithProvider planExists={planExists} customerId={customerId} />
        </CustomModal>,
        async () => ({
          plans: {
            defaultPriceId: plan || '',
            regularPlans: planData?.plan || {}, // Regular plans for upgrade
            addOns: planData?.addons || [],     // Add-ons for selection
            frontendFeatures: planData?.frontendFeatures || [], // UI display frontend features
          },
        })
      );
    }
  }, [plan, planData, loading]);

  return null;
};

export default SubscriptionHelper;
