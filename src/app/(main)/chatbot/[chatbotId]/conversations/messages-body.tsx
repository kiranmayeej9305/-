'use client';

import React from 'react';
import { useChatContext } from '@/context/use-chat-context';
import MessagesHeader from './messages-header';
import MessagesChat from './messages-chat';
import MessagesFooter from './messages-footer';

interface MessagesBodyProps {
  onSendMessage: (message: string) => Promise<void>;
  settings: any;
  isLiveAgent: boolean;
  onToggleLiveAgent: () => Promise<void>;
}

export default function MessagesBody({ onSendMessage, settings, isLiveAgent, onToggleLiveAgent }: MessagesBodyProps) {
  const { chatRoom } = useChatContext();

  return (
    <div className="flex flex-col flex-grow h-full pt-4"> 
      {chatRoom ? (
        <>
          <MessagesHeader 
            settings={settings} 
            onToggleLiveAgent={onToggleLiveAgent} 
            isLive={isLiveAgent} 
          /> 
          <div className="flex-grow overflow-auto">
            <MessagesChat settings={settings} />
          </div>
          <MessagesFooter 
            onSendMessage={onSendMessage} 
            settings={settings} 
            isLiveAgent={isLiveAgent}  // Pass the isLiveAgent state down to the MessagesFooter
          />
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
