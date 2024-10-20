'use client';

import React from 'react';
import MessagesHeader from './messages-header';
import MessagesChat from './messages-chat';
import MessagesFooter from './messages-footer';
import { InterfaceSettings } from '@/context/use-interface-settings-context';

interface MessagesBodyProps {
  onSendMessage: (message: string) => void;
  settings: InterfaceSettings;
}

export default function MessagesBody({ onSendMessage, settings }: MessagesBodyProps) {
  return (
    <div className="flex flex-col h-full p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md">
      <div className="flex-shrink-0">
        <MessagesHeader settings={settings} />
      </div>
      <div className="flex-grow overflow-y-auto mb-4">
        <MessagesChat settings={settings} />
      </div>
      <div className="flex-shrink-0">
        <MessagesFooter onSendMessage={(message) => Promise.resolve(onSendMessage(message))} settings={settings} />
      </div>
    </div>
  );
}
