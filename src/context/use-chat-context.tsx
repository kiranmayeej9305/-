'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';

type ChatRoom = {
  id: string;
  live: boolean;
  mailed: boolean;
  createdAt: Date;
  updatedAt: Date;
  customerId: string;
  chatbotId: string;
  agentId: string | null;
};

type ChatContextType = {
  chats: any[];
  setChats: React.Dispatch<React.SetStateAction<any[]>>;
  chatRoom: ChatRoom | null;
  setChatRoom: React.Dispatch<React.SetStateAction<ChatRoom | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<any[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const value = useMemo(
    () => ({
      chats,
      setChats,
      chatRoom,
      setChatRoom,
      loading,
      setLoading,
    }),
    [chats, chatRoom, loading]
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
