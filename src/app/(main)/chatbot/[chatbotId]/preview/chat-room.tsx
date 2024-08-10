'use client';

import { useEffect, useRef } from 'react';
import { createCustomerAndChatRoom, getChatMessages, createMessageInChatRoom } from '@/lib/queries';
import { useChatContext } from '@/context/use-chat-context';
import MessagesBody from './messages-body';
import { pusherClient } from '@/lib/utils';

interface ChatRoomProps {
  chatbotId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatbotId }) => {
  const { setChatRoom, setChats, setLoading, chatRoom } = useChatContext();
  const messageWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChatRoom = async () => {
      try {
        setLoading(true);
        console.log("Creating or fetching chat room for chatbotId:", chatbotId);
        const { chatRoomId } = await createCustomerAndChatRoom(chatbotId);
        setChatRoom(chatRoomId);
        console.log("Chat room created or fetched:", chatRoomId);

        const chatMessagesData = await getChatMessages(chatRoomId);
        console.log("Fetched chat messages:", chatMessagesData);
        
        // Ensure that only the messages array is stored in chats
        setChats(chatMessagesData.ChatMessages || []);
        setLoading(false);

        const channel = pusherClient.subscribe(`chat-room-${chatRoomId}`);
        console.log(`Subscribing to Pusher for chat room: ${chatRoomId}`);

        channel.bind('new-message', (data: any) => {
          console.log("New message received:", data);
          setChats((prevChats) => [...prevChats, data]);
        });

        return () => {
          console.log(`Unsubscribing from Pusher channel: chat-room-${chatRoomId}`);
          pusherClient.unsubscribe(`chat-room-${chatRoomId}`);
        };
      } catch (error) {
        console.error('Error initializing chat room:', error);
        setLoading(false);
      }
    };

    initializeChatRoom();
  }, [chatbotId, setChatRoom, setChats, setLoading]);

  const handleSendMessage = async (newMessage: string) => {
    if (newMessage.trim() && chatRoom) {
      try {
        setLoading(true);
        const chatMessage = await createMessageInChatRoom(chatRoom, newMessage, 'customer');
        console.log("New message sent:", chatMessage);
        setChats((prevChats) => [...prevChats, chatMessage]);
        pusherClient.trigger(`chat-room-${chatRoom}`, 'new-message', chatMessage);
        setLoading(false);
      } catch (error) {
        console.error('Error sending message:', error);
        setLoading(false);
      }
    }
  };

  return (
    <div className="chat-room flex flex-col h-full">
      <MessagesBody onSendMessage={handleSendMessage} />
      <div ref={messageWindowRef} aria-hidden="true" />
    </div>
  );
};

export default ChatRoom;
