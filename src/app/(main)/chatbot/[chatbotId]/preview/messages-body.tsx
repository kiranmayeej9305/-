'use client';

import React from 'react';
import { useChatContext } from '@/context/use-chat-context';
import MessagesHeader from './messages-header';
import MessagesChat from './messages-chat';
import MessagesFooter from './messages-footer';

interface MessagesBodyProps {
  onSendMessage: (message: string) => void;
  isPublic: boolean;
}

export default function MessagesBody({ onSendMessage, isPublic }: MessagesBodyProps) {
  const { chatRoom } = useChatContext();

  return (
    <div className="flex flex-col items-center h-full md:translate-x-0 transition-transform duration-300 ease-in-out bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-md">
      {!isPublic && <MessagesHeader />}
      {chatRoom ? (
        <>
          <div className="flex-grow w-full max-w-lg overflow-y-auto mb-4 h-[calc(100vh-200px)]">
            <MessagesChat />
          </div>
          <div className="w-full max-w-lg">
            <MessagesFooter onSendMessage={onSendMessage} />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center flex-grow">
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading...</p>
        </div>
      )}
    </div>
  );
}
