// components/messages-footer.tsx
'use client';

import { useForm } from 'react-hook-form';
import { useChatContext } from '@/context/use-chat-context';
import { createMessageInChatRoom } from '@/lib/queries';
import { Send } from 'lucide-react';
import { useRef } from 'react';

export default function MessagesFooter() {
  const { chatRoom, setLoading } = useChatContext(); // Remove setChats from here
  const { register, handleSubmit, reset } = useForm();
  const isSendingRef = useRef(false); // To prevent double sending

  const onHandleSentMessage = handleSubmit(async (data) => {
    if (!chatRoom || isSendingRef.current) return;

    try {
      setLoading(true);
      isSendingRef.current = true;

      await createMessageInChatRoom(chatRoom, data.content, 'customer'); // Do not directly set chats here
      reset(); // Clear the input after sending
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
      isSendingRef.current = false;
    }
  });

  return (
    <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 md:px-5 h-16 flex items-center">
      <form className="grow flex" onSubmit={onHandleSentMessage}>
        <input
          {...register('content')}
          className="form-input w-full bg-slate-100 dark:bg-slate-800 border-transparent dark:border-transparent focus:bg-white dark:focus:bg-slate-800 placeholder-slate-500"
          type="text"
          placeholder="Type a message..."
        />
        <button type="submit" className="ml-3 p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
