'use client';

import { useEffect, useRef } from 'react';
import { useChatContext } from '@/context/use-chat-context';
import { useInterfaceSettings } from '@/context/use-interface-settings-context';
import MessagesBody from './messages-body';
import { createCustomerAndChatRoom, createMessageInChatRoom, fetchChatRoomByChatbotId, getChatMessages } from '@/lib/queries';
import { pusherClient } from '@/lib/pusher';

interface ChatRoomProps {
  chatbotId: string;
  isPlayground: boolean;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatbotId, isPlayground }) => {
  const { setChatRoom, setChats, setLoading, chatRoom } = useChatContext();
  const { settings, loading } = useInterfaceSettings();
  const messageWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChatRoom = async () => {
      setLoading(true);

      if (isPlayground) {
        const existingChatRoom = await fetchChatRoomByChatbotId(chatbotId);
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

      setLoading(false);

      if (chatRoom) {
        const channel = pusherClient.subscribe(`chatroom-${chatRoom.id}`);
        channel.bind('new-message', (data: any) => {
          setChats((prevChats) => [...prevChats, data]);
          messageWindowRef.current?.scrollIntoView({ behavior: 'smooth' });
        });

        return () => {
          channel.unbind('new-message');
          pusherClient.unsubscribe(`chatroom-${chatRoom.id}`);
        };
      }
    };

    initializeChatRoom();
  }, [chatbotId, chatRoom, isPlayground, setChatRoom, setChats, setLoading]);

  if (loading || !settings) {
    return <div>Loading...</div>; // Show loading state while fetching settings
  }

  const handleSendMessage = async (newMessage: string) => {
    setLoading(true);

    if (!chatRoom) {
      const { chatRoomId } = await createCustomerAndChatRoom(chatbotId, isPlayground);
      const chatMessagesData = await getChatMessages(chatRoomId);
      setChatRoom({ id: chatRoomId, live: true, ...chatMessagesData });
      setChats(chatMessagesData.ChatMessages || []);
    }

    await createMessageInChatRoom(chatRoom.id, newMessage, 'customer');
    setLoading(false);
  };

  return (
    <div className="chat-room flex flex-col h-full">
      <MessagesBody onSendMessage={handleSendMessage} settings={settings} />
      <div ref={messageWindowRef} aria-hidden="true" />
    </div>
  );
};

export default ChatRoom;
