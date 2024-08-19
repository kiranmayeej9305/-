'use client';

import React from 'react';
import MessagesHeader from './message-header';
import MessagesBody from './message-body';
import { InterfaceForm } from './../interface-settings';

type PreviewProps = {
  settings: InterfaceForm;
};

const Preview: React.FC<PreviewProps> = ({ settings }) => {
  const parseTextWithLink = (text: string | undefined) => {
    if (!text) return null;
    const parts = text.split('|').map((part) => part.trim());
    if (parts.length !== 3) return text; // If not correctly formatted, return as plain text

    return (
      <>
        {parts[0]}{' '}
        <a href={parts[2]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          {parts[1]}
        </a>
      </>
    );
  };

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
      <MessagesBody
        suggestedMessage={settings.suggestedMessage}
        userMsgBackgroundColour={settings.userMsgBackgroundColour}
        chatbotMsgBackgroundColour={settings.chatbotMsgBackgroundColour}
        userTextColor={settings.userTextColor}
        chatbotTextColor={settings.chatbotTextColor}
        userAvatar={settings.userAvatar}
        chatbotAvatar={settings.chatbotAvatar}
        footerText={parseTextWithLink(settings.footerText)}
        copyRightMessage={parseTextWithLink(settings.copyRightMessage)}
      />
    </div>
  );
};

export default Preview;
