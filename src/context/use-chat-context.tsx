'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type ChatMessage = {
  id: string;
  message: string;
  sender: string | null;
  createdAt: Date;
  seen: boolean;
};

type ChatContextProps = {
  chatRoom: string | undefined;
  setChatRoom: React.Dispatch<React.SetStateAction<string | undefined>>;
  chats: ChatMessage[];
  setChats: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isIframe: boolean;
  setIsIframe: React.Dispatch<React.SetStateAction<boolean>>;
};

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({ children, isIframe }: { children: ReactNode, isIframe: boolean }) => {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatRoom, setChatRoom] = useState<string | undefined>(undefined);
  const [iframeMode, setIsIframe] = useState(isIframe);

  const value = {
    chats,
    setChats,
    loading,
    setLoading,
    chatRoom,
    setChatRoom,
    isIframe: iframeMode,
    setIsIframe,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
