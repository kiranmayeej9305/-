// components/chat/ChatRoom.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useChatContext } from '@/context/use-chat-context';
import MessagesBody from './messages-body';
import { createCustomerAndChatRoom, createMessageInChatRoom, fetchChatRoomByChatbotId, getChatMessages } from '@/lib/queries';
import { pusherClient } from '@/lib/pusher';

interface ChatRoomProps {
  chatbotId: string;
  isPlayground: boolean;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatbotId, isPlayground }) => {
  const { setChatRoom, setChats, setLoading, chatRoom } = useChatContext();
  const messageWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChatRoom = async () => {
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
        const channel = pusherClient.subscribe(`chatroom-${chatRoom}`);
        channel.bind('new-message', (data: any) => {
          setChats((prevChats) => [...prevChats, data]);
          messageWindowRef.current?.scrollIntoView({ behavior: 'smooth' });
        });

        return () => {
          channel.unbind('new-message');
          pusherClient.unsubscribe(`chatroom-${chatRoom}`);
        };
      }
    };

    initializeChatRoom();
  }, [chatbotId, chatRoom, setChatRoom, setChats, setLoading]);

  const handleSendMessage = async (newMessage: string) => {
    setLoading(true);
    let currentChatRoom = chatRoom;

    if (!currentChatRoom) {
      const { chatRoomId } = await createCustomerAndChatRoom(chatbotId, isPlayground);
      setChatRoom(chatRoomId);
      currentChatRoom = chatRoomId;
      const chatMessagesData = await getChatMessages(chatRoomId);
      setChats(chatMessagesData.ChatMessages || []);
    }

    await createMessageInChatRoom(currentChatRoom, newMessage, 'customer');
    setLoading(false);
  };

  return (
    <div className="chat-room flex flex-col h-full">
      <MessagesBody onSendMessage={handleSendMessage} />
      <div ref={messageWindowRef} aria-hidden="true" />
    </div>
  );
};

export default ChatRoom;
