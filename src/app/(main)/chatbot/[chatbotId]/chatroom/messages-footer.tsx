'use client';

import { useState, useEffect, useRef } from 'react';
import { pusherClient } from '@/lib/utils';
import { useChatContext } from '@/context/use-chat-context';
import {
  createMessageInChatRoom,
  getChatMessages,
  createOrFetchChatRoom,
  endChatRoomSession,
} from '@/lib/queries';

interface ChatRoomProps {
  chatbotId: string;
  customerId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatbotId, customerId }) => {
  const { setChatRoom, setChats, chatRoom, chats } = useChatContext();
  const [newMessage, setNewMessage] = useState('');
  const messageWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChatRoom = async () => {
      try {
        const chatRoomData = await createOrFetchChatRoom(chatbotId, customerId, true);
        setChatRoom(chatRoomData.id);
        setChats(chatRoomData.ChatMessages || []);

        const channel = pusherClient.subscribe(`chat-room-${chatRoomData.id}`);
        channel.bind('new-message', (data: any) => {
          setChats((prevMessages) => [...prevMessages, data]);
        });

        return () => {
          pusherClient.unsubscribe(`chat-room-${chatRoomData.id}`);
        };
      } catch (error) {
        console.error('Error initializing chat room:', error);
      }
    };

    initializeChatRoom();
  }, [chatbotId, customerId, setChatRoom, setChats]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && chatRoom) {
      try {
        const chatMessage = await createMessageInChatRoom(chatRoom, newMessage, 'customer');
        setChats((prevMessages) => [...prevMessages, chatMessage]);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
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
    <div className="chat-room">
      <div className="messages" ref={messageWindowRef}>
        {chats.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
      />
      <button onClick={handleSendMessage}>Send</button>
      <button onClick={handleEndSession}>End Chat</button>
    </div>
  );
};

export default ChatRoom;
