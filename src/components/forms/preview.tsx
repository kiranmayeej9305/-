'use client';

import React from 'react';
import MessagesHeader from './messages-header';
import MessagesBody from './messages-body';
import { InterfaceForm } from './interface-settings'; // Assuming InterfaceForm is imported from the form

type PreviewProps = {
  settings: InterfaceForm;
};

const Preview: React.FC<PreviewProps> = ({ settings }) => {
  return (
    <div
      className="preview w-full h-[400px] flex flex-col justify-between rounded-lg shadow-lg overflow-hidden border transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: settings.background || 'var(--bg-color, #f0f0f0)',
        borderColor: 'var(--border-color, #ccc)',
      }}
    >
      <MessagesHeader
        botDisplayName={settings.botDisplayName || 'Chatbot'}
        chatIcon={settings.chatIcon || '/images/bot.png'}
        isLiveAgentEnabled={settings.isLiveAgentEnabled || false}
        helpdeskLiveAgentColor={settings.helpdeskLiveAgentColor}
      />
      <MessagesBody onSendMessage={() => {}} />
    </div>
  );
};

export default Preview;
