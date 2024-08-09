import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Pusher from 'pusher-js';
import { getChatMessages, createMessageInChatRoom, updateMessagesToSeen } from '@/queries';
import { useChatContext } from '@/context/use-chat-context';
import { ChatBotMessageSchema } from '@/schemas/conversation.schema';

export const useConversation = () => {
  const { register, watch } = useForm({
    resolver: zodResolver(ChatBotMessageSchema),
    mode: 'onChange',
  });
  const { setLoading: loadMessages, setChats, setChatRoom } = useChatContext();
  const [loading, setLoading] = useState<boolean>(false);
  
  const onGetActiveChatMessages = async (id: string) => {
    try {
      loadMessages(true);
      const messages = await getChatMessages(id);
      if (messages) {
        setChatRoom(id);
        loadMessages(false);
        setChats(messages.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {
    register,
    loading,
    onGetActiveChatMessages,
  };
};

export const useChatWindow = () => {
  const { chats, loading, setChats, chatRoom } = useChatContext();
  const messageWindowRef = useRef<HTMLDivElement | null>(null);
  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(ChatBotMessageSchema),
    mode: 'onChange',
  });

  const onScrollToBottom = () => {
    messageWindowRef.current?.scroll({
      top: messageWindowRef.current.scrollHeight,
      left: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    onScrollToBottom();
  }, [chats, messageWindowRef]);

  useEffect(() => {
    if (chatRoom) {
      Pusher.subscribe(chatRoom);
      Pusher.bind('realtime-mode', (data: any) => {
        setChats((prev) => [...prev, data.chat]);
      });

      return () => {
        Pusher.unbind('realtime-mode');
        Pusher.unsubscribe(chatRoom);
      };
    }
  }, [chatRoom]);

  const onHandleSentMessage = handleSubmit(async (values) => {
    try {
      reset();
      const message = await createMessageInChatRoom(
        chatRoom!,
        values.content,
        'assistant'
      );
      if (message) {
        setChats((prev) => [...prev, message.message[0]]);
      }
    } catch (error) {
      console.log(error);
    }
  });

  return {
    messageWindowRef,
    register,
    onHandleSentMessage,
    chats,
    loading,
    chatRoom,
  };
};
