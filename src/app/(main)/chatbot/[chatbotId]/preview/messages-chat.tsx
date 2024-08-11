'use client';

import { useEffect, useRef } from 'react';
import { useChatContext } from '@/context/use-chat-context';
import Bubble from './bubble';
import { pusherClient } from '@/lib/utils';

export default function MessagesChat() {
  const { chats, setChats, chatRoom } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatRoom) return;

    console.log(`MessagesChat: Subscribing to chatroom-${chatRoom}`);

    const channel = pusherClient.subscribe(`chatroom-${chatRoom}`);

    // Track the last message ID to avoid duplicates
    let lastMessageId: string | null = null;

    channel.bind('new-message', (data: any) => {
      console.log('MessagesChat: Received new message from Pusher:', data);

      // Check if the new message is a duplicate by comparing its ID with the last received message ID
      if (data.id === lastMessageId) {
        console.warn('MessagesChat: Duplicate message detected and ignored:', data);
        return;
      }

      // Update the lastMessageId to the current message's ID
      lastMessageId = data.id;

      // Add the new message to the chat
      setChats((prevChats) => {
        const isDuplicate = prevChats.some((chat) => chat.id === data.id);
        if (!isDuplicate) {
          console.log('MessagesChat: Adding new message to chat:', data);
          return [...prevChats, data];
        } else {
          console.warn('MessagesChat: Duplicate message detected in setChats and ignored:', data);
          return prevChats;
        }
      });

      // Scroll to the bottom of the chat
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => {
      console.log(`MessagesChat: Unsubscribing from chatroom-${chatRoom}`);
      channel.unbind('new-message');
      pusherClient.unsubscribe(`chatroom-${chatRoom}`);
    };
  }, [chatRoom, setChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  return (
    <div className="grow px-4 sm:px-6 md:px-5 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
      {chats.length > 0 ? (
        chats.map((chat) => (
          <div key={chat.id} className="flex items-start mb-4 last:mb-0">
            <Bubble message={chat.message} createdAt={chat.createdAt} sender={chat.sender} />
          </div>
        ))
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center">No messages yet.</p>
      )}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
}
