'use client';

import React from 'react';
import { useChatContext } from '@/context/use-chat-context';
import MessagesHeader from './messages-header';
import MessagesChat from './messages-chat';
import MessagesFooter from './messages-footer';

export default function MessagesBody() {
  const { chatRoom } = useChatContext();

  return (
    <div className="flex flex-col flex-grow h-full bg-gray-50 dark:bg-gray-800">
      <MessagesHeader />
      {chatRoom ? (
        <div className="flex flex-col flex-grow">
          <MessagesChat />
          <MessagesFooter />
        </div>
      ) : (
        <div className="flex items-center justify-center flex-grow">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Please select a conversation to view messages.
          </p>
        </div>
      )}
    </div>
  );
}
