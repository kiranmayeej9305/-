'use client';

import React, { useEffect, useRef } from 'react';
import { useChatContext } from '@/context/use-chat-context';
import { useInterfaceSettings } from '@/context/use-interface-settings-context';
import MessagesHeader from './messages-header';
import MessagesChat from './messages-chat';
import MessagesFooter from './messages-footer';
import { toggleLiveAgentMode, fetchChatRoomById, createMessageInChatRoom } from '@/lib/queries';
import { pusherClient } from '@/lib/pusher';

interface ChatRoomProps {
  chatRoomId: string;
}

export default function ChatRoom({ chatRoomId }: ChatRoomProps) {
  const { chatRoom, setChatRoom, setChats, setLoading } = useChatContext();
  const { settings, loading } = useInterfaceSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChatRoom = async () => {
      if (!chatRoomId) return;

      setLoading(true);
      try {
        const existingChatRoom = await fetchChatRoomById(chatRoomId);
        if (existingChatRoom) {
          setChatRoom(existingChatRoom);
          setChats(existingChatRoom.ChatMessages || []);
        } else {
          console.error('Chat room not found.');
        }
      } catch (error) {
        console.error("Error initializing chat room:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeChatRoom();
  }, [chatRoomId, setChatRoom, setChats, setLoading]);

  useEffect(() => {
    if (!chatRoom) return;

    const channel = pusherClient.subscribe(`chatroom-${chatRoom.id}`);

    const handleMessage = (data: any) => {
      setChats((prevChats) => [...prevChats, data]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    channel.bind('new-message', handleMessage);

    return () => {
      channel.unbind('new-message', handleMessage);
      pusherClient.unsubscribe(`chatroom-${chatRoom.id}`);
    };
  }, [chatRoom, setChats]);

  const handleToggleLiveAgent = async () => {
    if (!chatRoom) return;

    const isLiveAgent = chatRoom.agentId !== null;
    const result = await toggleLiveAgentMode(chatRoom.id, !isLiveAgent);
    
    if (result.success) {
      setChatRoom(result.chatRoom);
    }
  };

  const handleSendMessage = async (newMessage: string) => {
    setLoading(true);

    try {
      if (chatRoom) {
        await createMessageInChatRoom(chatRoom.id, newMessage, 'customer');
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !settings) return <div>Loading...</div>;

  return (
    <div className="chat-room flex flex-col h-full">
      <MessagesHeader 
        settings={settings} 
        onToggleLiveAgent={handleToggleLiveAgent} 
        isLive={chatRoom?.live || false} 
      /> 
      <div className="flex-grow overflow-auto">
        <MessagesChat settings={settings} />
      </div>
      <MessagesFooter onSendMessage={handleSendMessage} settings={settings} />
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}
