'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatContext } from '@/context/use-chat-context';
import Bubble from './bubble';
import { createMessageInChatRoom, createOrFetchChatRoom, endChatRoomSession } from '@/lib/queries';
import { pusherClient } from '@/lib/utils';

interface ChatRoomProps {
  chatbotId: string;
  customerId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatbotId, customerId }) => {
  const { setChatRoom, setChats, chats, setLoading, chatRoom } = useChatContext();
  const [newMessage, setNewMessage] = useState('');
  const messageWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChatRoom = async () => {
      try {
        setLoading(true);
        const chatRoomData = await createOrFetchChatRoom(chatbotId, customerId, true);
        setChatRoom(chatRoomData.id);
        setChats(chatRoomData.ChatMessages || []);

        const channel = pusherClient.subscribe(`chat-room-${chatRoomData.id}`);
        channel.bind('new-message', (data: any) => {
          setChats((prevMessages) => [...prevMessages, data]);
        });

        setLoading(false);

        return () => {
          pusherClient.unsubscribe(`chat-room-${chatRoomData.id}`);
        };
      } catch (error) {
        console.error('Error initializing chat room:', error);
        setLoading(false);
      }
    };

    initializeChatRoom();
  }, [chatbotId, customerId, setChatRoom, setChats, setLoading]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        setLoading(true);
        const chatMessage = await createMessageInChatRoom(chatRoom, newMessage, 'customer');
        setChats((prevMessages) => [...prevMessages, chatMessage]);
        setNewMessage('');
        setLoading(false);
      } catch (error) {
        console.error('Error sending message:', error);
        setLoading(false);
      }
    }
  };

  const handleEndSession = async () => {
    if (chatRoom) {
      await endChatRoomSession(chatRoom);
      setChatRoom(null);
      setChats([]);
    }
  };

  useEffect(() => {
    messageWindowRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
      <div className="flex-grow px-4 py-6 overflow-y-auto bg-white dark:bg-gray-900" ref={messageWindowRef}>
        {chats.length > 0 ? (
          chats.map((msg) => (
            <Bubble
              key={msg.id}
              message={msg.message}
              createdAt={new Date(msg.createdAt)}
              sender={msg.sender}
            />
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">No messages yet.</p>
        )}
      </div>
      <div className="px-4 py-2 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Send
          </button>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            End Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
