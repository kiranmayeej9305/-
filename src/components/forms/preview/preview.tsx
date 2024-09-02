'use client';

import React from 'react';
import MessagesHeader from './message-header';
import MessagesBody from './message-body';
import { InterfaceForm } from '@/components/forms/interface-settings';

type PreviewProps = {
  settings: InterfaceForm;
};

const Preview: React.FC<PreviewProps> = ({ settings }) => {
  return (
    <div
      className="preview w-full min-h-[500px] flex flex-col justify-between rounded-lg shadow-lg overflow-hidden border transition-all duration-300 ease-in-out"
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
        themeColor={settings.themeColor}
        botDisplayNameColor={settings.botDisplayNameColor}  // Pass the botDisplayNameColor prop
      />
      <MessagesBody
        suggestedMessage={settings.suggestedMessage}
        userMsgBackgroundColour={settings.userMsgBackgroundColour}
        chatbotMsgBackgroundColour={settings.chatbotMsgBackgroundColour}
        userTextColor={settings.userTextColor}
        chatbotTextColor={settings.chatbotTextColor}
        userAvatar={settings.userAvatar}
        chatbotAvatar={settings.chatbotAvatar}
        footerText={settings.footerText}
        copyRightMessage={settings.copyRightMessage}
        messagePlaceholder={settings.messagePlaceholder}
        themeColor={settings.themeColor}
        botDisplayNameColor={settings.botDisplayNameColor}
      />
    </div>
  );
};

export default Preview;
