'use client';
import ChatbotCreate from '@/components/forms/chatbot-create';
import CustomModal from '@/components/global/custom-modal';
import { Button } from '@/components/ui/button';
import { useModal } from '@/providers/modal-provider';
import { Account, AccountSidebarOption, Chatbot, User } from '@prisma/client';
import { PlusCircleIcon } from 'lucide-react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

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
  const accountDetails = user.Account;

  if (!accountDetails) return null;

  return (
    <Button
      className={twMerge('w-full flex gap-4', className)}
      onClick={() => {
        setOpen(
          <CustomModal title="Create a Chatbot" subheading="You can switch between">
            <ChatbotCreate accountId={accountDetails.id} userId={user.id} userName={user.name} />
          </CustomModal>
        );
      }}
    >
      <PlusCircleIcon size={15} />
      Create Chatbot
    </Button>
  );
};

export default CreateChatbotButton;
