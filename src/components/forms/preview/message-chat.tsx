'use client';

import React from 'react';
import Bubble from './bubble';

type MessagesChatProps = {
  suggestedMessage?: string;
  userMsgBackgroundColour?: string;
  chatbotMsgBackgroundColour?: string;
  userTextColor?: string;
  chatbotTextColor?: string;
  userAvatar?: string;
  chatbotAvatar?: string;
};

const MessagesChat: React.FC<MessagesChatProps> = ({
  suggestedMessage,
  userMsgBackgroundColour,
  chatbotMsgBackgroundColour,
  userTextColor,
  chatbotTextColor,
  userAvatar,
  chatbotAvatar,
}) => {
  return (
    <div className="grow px-4 sm:px-6 md:px-5 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
      <Bubble
        message={suggestedMessage || 'Hello! How can I assist you today?'}
        createdAt={new Date()}
        sender="chatbot"
        style={{
          backgroundColor: chatbotMsgBackgroundColour || '#e5e7eb',
          color: chatbotTextColor || '#333',
        }}
        avatar={chatbotAvatar}
      />
      <div className="my-2"></div> {/* This is the gap between bubbles */}
      <Bubble
        message="I need a custom chatbot for my website"
        createdAt={new Date()}
        sender="user"
        style={{
          backgroundColor: userMsgBackgroundColour || '#f3f4f6',
          color: userTextColor || '#333',
        }}
        avatar={userAvatar}
      />
    </div>
  );
};

export default MessagesChat;
