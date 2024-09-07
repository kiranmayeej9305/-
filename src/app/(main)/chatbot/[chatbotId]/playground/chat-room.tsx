'use client';

import { useEffect, useRef } from 'react';
import { useChatContext } from '@/context/use-chat-context';
import { useInterfaceSettings } from '@/context/use-interface-settings-context';
import MessagesBody from './messages-body';
import { createCustomerAndChatRoom, createMessageInChatRoom, fetchChatRoomById, getChatMessages } from '@/lib/queries';
import { pusherClient } from '@/lib/pusher';  
import BlurPage from '@/components/global/blur-page'; 
interface ChatRoomProps {
  chatbotId: string;
  isPlayground: boolean;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatbotId, isPlayground }) => {
  const { setChatRoom, setChats, setLoading, chatRoom } = useChatContext();
  const { settings, loading } = useInterfaceSettings();
  const messageWindowRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false); // This ref will track if the room has been initialized

  useEffect(() => {
    // Prevent initializing the room more than once
    if (initializedRef.current) return;

    const initializeChatRoom = async () => {
      setLoading(true);

      try {
        if (isPlayground) {
          const existingChatRoom = await fetchChatRoomById(chatbotId);
          if (existingChatRoom) {
            setChatRoom(existingChatRoom);
            setChats(existingChatRoom.ChatMessages || []);
          } else {
            const { chatRoomId } = await createCustomerAndChatRoom(chatbotId, true);
            const chatMessagesData = await getChatMessages(chatRoomId);
            setChatRoom({ id: chatRoomId, live: true, ...chatMessagesData });
            setChats(chatMessagesData.ChatMessages || []);
          }
        }
      } catch (error) {
        console.error("Error initializing chat room:", error);
      } finally {
        setLoading(false);
      }

      initializedRef.current = true; // Mark as initialized
    };

    initializeChatRoom();

    return () => {
      // Cleanup effect if the component unmounts
      initializedRef.current = false;
    };
  }, [chatbotId, isPlayground, setChatRoom, setChats, setLoading]);

  useEffect(() => {
    if (!chatRoom) return;

    const channel = pusherClient.subscribe(`chatroom-${chatRoom.id}`);

    const handleMessage = (data: any) => {
      setChats((prevChats) => [...prevChats, data]);
      messageWindowRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    channel.bind('new-message', handleMessage);

    return () => {
      channel.unbind('new-message', handleMessage);
      pusherClient.unsubscribe(`chatroom-${chatRoom.id}`);
    };
  }, [chatRoom, setChats]);

  if (loading || !settings) {
    return <div>Loading...</div>; // Show loading state while fetching settings
  }

  const handleSendMessage = async (newMessage: string) => {
    setLoading(true);

    try {
      if (!chatRoom) {
        const { chatRoomId } = await createCustomerAndChatRoom(chatbotId, isPlayground);
        const chatMessagesData = await getChatMessages(chatRoomId);
        setChatRoom({ id: chatRoomId, live: true, ...chatMessagesData });
        setChats(chatMessagesData.ChatMessages || []);
      } else {
        await createMessageInChatRoom(chatRoom.id, newMessage, 'customer');
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlurPage>
    <div className="chat-room flex flex-col h-full">
      <MessagesBody onSendMessage={handleSendMessage} settings={settings} />
      <div ref={messageWindowRef} aria-hidden="true" />
    </div>
    </BlurPage>
  );
};

export default ChatRoom;
