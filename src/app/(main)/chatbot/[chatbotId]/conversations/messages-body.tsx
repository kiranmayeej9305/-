// components/messages-body.tsx
'use client';

import React from 'react';
import { useChatContext } from '@/context/use-chat-context';
import MessagesHeader from './messages-header';
import MessagesChat from './messages-chat';
import MessagesFooter from './messages-footer';

export default function MessagesBody() {
  const { chatRoom } = useChatContext();

  return (
    <div className="flex flex-col flex-grow h-full md:translate-x-0 transition-transform duration-300 ease-in-out">
      {/* Added background color to check visibility */}
      <MessagesHeader />
      {chatRoom ? (
        <>
          <div className="flex-grow overflow-auto">
            <MessagesChat />
          </div>
          <MessagesFooter />
        </>
      ) : (
        <div className="flex items-center justify-center flex-grow">
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Please select a conversation to view messages.
          </p>
        </div>
      )}
    </div>
  );
}
