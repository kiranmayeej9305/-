'use client';

import { useEffect, useRef } from 'react';
import { createCustomerAndChatRoom, getChatMessages, createMessageInChatRoom, fetchChatRoomByChatbotId } from '@/lib/queries';
import { useChatContext } from '@/context/use-chat-context';
import MessagesBody from './messages-body';
import { pusherClient } from '@/lib/utils';

interface ChatRoomProps {
  chatbotId: string;
  isPlayground: boolean;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatbotId, isPlayground }) => {
  const { setChatRoom, setChats, setLoading, chatRoom, isIframe } = useChatContext();
  const messageWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChatRoom = async () => {
      try {
        setLoading(true);

        if (isPlayground) {
          const existingChatRoom = await fetchChatRoomByChatbotId(chatbotId);

          if (existingChatRoom) {
            setChatRoom(existingChatRoom.id);
            setChats(existingChatRoom.ChatMessages || []);
          }
        }

        setLoading(false);

        if (chatRoom) {
          const channel = pusherClient.subscribe(`chat-room-${chatRoom}`);
          channel.bind('new-message', (data: any) => {
            setChats((prevChats) => [...prevChats, data]);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          });

          return () => {
            pusherClient.unsubscribe(`chat-room-${chatRoom}`);
          };
        }
      } catch (error) {
        console.error('Error initializing chat room:', error);
        setLoading(false);
      }
    };

    initializeChatRoom();
  }, [chatbotId, setChatRoom, setChats, setLoading, isIframe, isPlayground, chatRoom]);

  const handleSendMessage = async (newMessage: string) => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);

      let currentChatRoom = chatRoom;

      if (!currentChatRoom) {
        const { chatRoomId } = await createCustomerAndChatRoom(chatbotId, isPlayground);
        setChatRoom(chatRoomId);
        currentChatRoom = chatRoomId;

        const chatMessagesData = await getChatMessages(chatRoomId);
        setChats(chatMessagesData.ChatMessages || []);
      }

      if (currentChatRoom) {
        const chatMessage = await createMessageInChatRoom(currentChatRoom, newMessage, 'customer');
        setChats((prevChats) => [...prevChats, chatMessage]);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
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
