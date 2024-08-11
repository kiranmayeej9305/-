'use client';

import { useEffect, useRef } from 'react';
import { useChatContext } from '@/context/use-chat-context';
import MessagesBody from './messages-body';
import { createCustomerAndChatRoom, getChatMessages, createMessageInChatRoom } from '@/lib/queries';

interface ChatRoomProps {
  chatbotId: string;
  isPlayground: boolean;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatbotId, isPlayground }) => {
  const { setChatRoom, setChats, setLoading, chatRoom, pusher } = useChatContext();
  const messageWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChatRoom = async () => {
      try {
        setLoading(true);

        if (isPlayground) {
          const existingChatRoom = await fetchChatRoomByChatbotId(chatbotId);

          if (existingChatRoom) {
            console.log('ChatRoom: Using existing chatroom');
            setChatRoom(existingChatRoom.id);
            setChats(existingChatRoom.ChatMessages || []);
          }
        }

        setLoading(false);

        if (chatRoom && pusher) {
          const channel = pusher.subscribe(`chat-room-${chatRoom}`);
          channel.bind('new-message', (data: any) => {
            console.log('ChatRoom: Received new message from Pusher:', data);
            setChats((prevChats) => {
              const messageExists = prevChats.some(chat => chat.id === data.id);
              if (!messageExists) {
                console.log('ChatRoom: Adding new message to chat:', data);
                return [...prevChats, data];
              }
              console.warn('ChatRoom: Duplicate message ignored:', data);
              return prevChats;
            });

            // Scroll to the latest message
            messageWindowRef.current?.scrollIntoView({ behavior: 'smooth' });
          });

          return () => {
            console.log('ChatRoom: Unsubscribing from Pusher channel');
            channel.unbind('new-message');
            pusher.unsubscribe(`chat-room-${chatRoom}`);
          };
        }
      } catch (error) {
        console.error('ChatRoom: Error initializing chat room:', error);
        setLoading(false);
      }
    };

    initializeChatRoom();
  }, [chatbotId, setChatRoom, setChats, setLoading, chatRoom, pusher]);

  const handleSendMessage = async (newMessage: string) => {
    if (!newMessage.trim()) return;

    console.log('ChatRoom: Sending message:', newMessage);
    try {
      setLoading(true);

      let currentChatRoom = chatRoom;

      if (!currentChatRoom) {
        console.log('ChatRoom: Creating new chat room');
        const { chatRoomId } = await createCustomerAndChatRoom(chatbotId, isPlayground);
        setChatRoom(chatRoomId);
        currentChatRoom = chatRoomId;

        const chatMessagesData = await getChatMessages(chatRoomId);
        setChats(chatMessagesData.ChatMessages || []);
      }

      if (currentChatRoom) {
        await createMessageInChatRoom(currentChatRoom, newMessage, 'customer');
        // Do not update the chat context here, as Pusher will handle it
      }

      setLoading(false);
    } catch (error) {
      console.error('ChatRoom: Error sending message:', error);
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
