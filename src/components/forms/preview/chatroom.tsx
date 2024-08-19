'use client';

import React from 'react';
import MessagesHeader from './message-header';
import MessagesBody from './message-body';

type ChatRoomProps = {
  chatbotId: string;
};

const ChatRoom: React.FC<ChatRoomProps> = ({ chatbotId }) => {

  return (
    <div className="flex flex-col h-full">
      <MessagesHeader botDisplayName="Chatbot" chatIcon="/images/bot.png" isLiveAgentEnabled={isLiveAgentEnabled} />
      <MessagesBody onSendMessage={() => {}} />
    </div>
  );
};

export default ChatRoom;
