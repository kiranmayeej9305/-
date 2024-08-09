// components/messages-footer.tsx
'use client';

import { useForm } from 'react-hook-form';
import { useChatContext } from '@/context/use-chat-context';
import { createMessageInChatRoom } from '@/lib/queries';
import { Send } from 'lucide-react';

export default function MessagesFooter() {
  const { chatRoom, setChats, setLoading } = useChatContext();
  const { register, handleSubmit, reset } = useForm();

  const onHandleSentMessage = handleSubmit(async (data) => {
    if (!chatRoom) return;
    setLoading(true);
    const message = await createMessageInChatRoom(chatRoom, data.content, 'user');
    if (message) {
      setChats((prev) => [...prev, message]);
      reset();
    }
    setLoading(false);
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
