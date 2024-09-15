'use client';

import SubscriptionFormWrapperWithProvider from '@/components/forms/subscription-form/subscription-form-wrapper';
import CustomModal from '@/components/global/custom-modal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useModal } from '@/providers/modal-provider';
import React from 'react';

type PricingCardProps = {
  features: Array<{ name: string; description: string; value: string | number }>;
  buttonCta: string;
  title: string;
  description: string;
  amt: string;
  duration: string;
  highlightTitle: string;
  highlightDescription: string;
  customerId: string;
  prices: any[]; // You may want to update the type based on your actual prices type
  planExists: boolean;
};

const PricingCard = ({
  amt,
  buttonCta,
  customerId,
  description,
  duration,
  features,
  highlightDescription,
  highlightTitle,
  planExists,
  title,
  prices,
}: PricingCardProps) => {
  const { setOpen } = useModal();

  const handleManagePlan = async () => {
    // Open the modal with the SubscriptionFormWrapper for managing the plan or add-on
    setOpen(
      <CustomModal
        title="Manage Your Plan"
        subheading="You can change your plan at any time from the billing settings."
      >
        <SubscriptionFormWrapperWithProvider customerId={customerId} planExists={planExists} />
      </CustomModal>,
      async () => ({
        plans: {
          defaultPriceId: '', // You can pass the default price if necessary
          plans: prices, // The plans data from the PricingCard props
        },
      })
    );
  };

  return (
    <Card className="flex flex-col justify-between lg:w-1/2">
      <div>
        <CardHeader className="flex flex-col md:!flex-row justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p>{description}</p>
          </div>
          <p className="text-6xl font-bold">
            {amt}
            <small className="text-xs font-light text-muted-foreground">
              {duration}
            </small>
          </p>
        </CardHeader>
        <CardContent>
          <ul>
            {features.map((feature) => (
              <li key={feature.name} className="list-disc ml-4 text-muted-foreground">
                <strong>{feature.name}</strong>: {feature.description}
              </li>
            ))}
          </ul>
        </CardContent>
      </div>
      <CardFooter>
        <Card className="w-full">
          <div className="flex flex-col md:!flex-row items-center justify-between rounded-lg border gap-4 p-4">
            <div>
              <p>{highlightTitle}</p>
              <p className="text-sm text-muted-foreground">{highlightDescription}</p>
            </div>

            <Button className="md:w-fit w-full" onClick={handleManagePlan}>
              {buttonCta}
            </Button>
          </div>
        </Card>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
