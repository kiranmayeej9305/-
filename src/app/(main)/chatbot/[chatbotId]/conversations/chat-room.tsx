'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChatContext } from '@/context/use-chat-context';
import { useInterfaceSettings } from '@/context/use-interface-settings-context';
import MessagesBody from './messages-body';
import { toggleLiveAgentMode, fetchChatRoomById, createMessageInChatRoom } from '@/lib/queries';
import { pusherClient } from '@/lib/pusher';

interface ChatRoomProps {
  chatRoomId: string;
}

export default function ChatRoom({ chatRoomId }: ChatRoomProps) {
  const { chatRoom, setChatRoom, setChats, setLoading } = useChatContext();
  const { settings, loading } = useInterfaceSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLiveAgent, setIsLiveAgent] = useState(false); // Track if the live agent is active

  useEffect(() => {
    const initializeChatRoom = async () => {
      if (!chatRoomId) return;

      setLoading(true);
      try {
        const existingChatRoom = await fetchChatRoomById(chatRoomId);
        if (existingChatRoom) {
          setChatRoom(existingChatRoom);
          setChats(existingChatRoom.ChatMessages || []);
          setIsLiveAgent(existingChatRoom.agentId !== null);
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

    const isLive = chatRoom.agentId !== null;
    const result = await toggleLiveAgentMode(chatRoom.id, !isLive);

    if (result.success && result.chatRoom) {
      setChatRoom(result.chatRoom);
      setIsLiveAgent(!isLive); // Update the local state
    }
  };

  const handleSendMessage = async (newMessage: string) => {
    setLoading(true);

    try {
      if (chatRoom) {
        const sender = isLiveAgent ? 'chatbot' : 'customer';
        await createMessageInChatRoom(chatRoom.id, newMessage, sender);
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
      <MessagesBody 
        onSendMessage={handleSendMessage} 
        settings={settings} 
        isLiveAgent={isLiveAgent} 
        onToggleLiveAgent={handleToggleLiveAgent} 
      />
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}
