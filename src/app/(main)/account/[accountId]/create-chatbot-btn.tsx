'use client';

import ChatbotCreate from '@/components/forms/chatbot-create';
import CustomModal from '@/components/global/custom-modal';
import { Button } from '@/components/ui/button';
import { useModal } from '@/providers/modal-provider';
import { Account, AccountSidebarOption, Chatbot, User } from '@prisma/client';
import { PlusCircleIcon } from 'lucide-react';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { useQuantitativeFeature } from '@/context/use-quantitative-feature-context'; // Import Quantitative Feature Context
import { useToast } from '@/components/ui/use-toast'; // Toast for error message

type Props = {
  user: User & {
    Account: Account & {
      Chatbot: Chatbot[];
      SideBarOption: AccountSidebarOption[];
    };
  };
  id: string;
  className: string;
};

const CreateChatbotButton = ({ className, id, user }: Props) => {
  const { setOpen } = useModal();
  const { checkLimitExceeded } = useQuantitativeFeature(); // Get the function to check feature limits
  const { toast } = useToast(); // Get the toast function
  const accountDetails = user.Account;

  if (!accountDetails) return null;

  // Check if the chatbot creation limit is exceeded
  const isChatbotLimitExceeded = checkLimitExceeded('chatbots', accountDetails.Chatbot.length);

  const handleCreateChatbotClick = () => {
    // Log the chatbot count and the result of limit check
    console.log('Chatbot Count:', accountDetails.Chatbot.length); // Log number of chatbots
    console.log('Limit Exceeded:', isChatbotLimitExceeded); // Log the limit exceeded status

    if (isChatbotLimitExceeded) {
      // Show a toast if the limit is exceeded
      toast({
        variant: 'destructive',
        title: 'Upgrade Required',
        description: 'You have reached the limit for creating chatbots. Please upgrade your plan to create more.',
      });
      return;
    }

    // Open the modal to create a new chatbot
    setOpen(
      <CustomModal title="Create a Chatbot" subheading="You can always customize your chatbot anytime in settings.">
        <ChatbotCreate accountId={accountDetails.id} userId={user.id} userName={user.name} />
      </CustomModal>
    );
  };

  return (
    <Button
      className={twMerge('w-full flex gap-4', className)}
      onClick={handleCreateChatbotClick}
    >
      <PlusCircleIcon size={15} />
      Create Chatbot
    </Button>
  );
};

export default CreateChatbotButton;
