// 'use client';

// import React, { useEffect, useRef } from 'react';
// import Pusher from 'pusher-js';
// import { useForm } from 'react-hook-form';
// import { useChatContext } from '@/context/use-chat-context';
// import { createMessageInChatRoom } from '@/lib/queries';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import Bubble from '@/components/chatbot/bubble';
// import { Loader } from '../loader/index';
// export default function Messenger() {
//   const { chats, chatRoom, setChats, loading, setLoading } = useChatContext();
//   const messageWindowRef = useRef<HTMLDivElement>(null);
//   const { register, handleSubmit, reset } = useForm();

//   const onScrollToBottom = () => {
//     if (messageWindowRef.current) {
//       messageWindowRef.current.scrollTo({
//         top: messageWindowRef.current.scrollHeight,
//         behavior: 'smooth',
//       });
//     }
//   };

//   useEffect(() => {
//     onScrollToBottom();
//   }, [chats]);

//   useEffect(() => {
//     if (chatRoom) {
//       const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
//         cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
//       });

//       const channel = pusher.subscribe(`chat-${chatRoom}`);
//       channel.bind('new-message', (data: any) => {
//         setChats((prev) => [...prev, data.message]);
//         onScrollToBottom();
//       });

//       return () => {
//         channel.unbind_all();
//         channel.unsubscribe();
//       };
//     }
//   }, [chatRoom]);

//   const onHandleSentMessage = handleSubmit(async (data) => {
//     if (!chatRoom) return;
//     setLoading(true);
//     try {
//       const message = await createMessageInChatRoom(chatRoom, data.content, 'user');
//       if (message) {
//         setChats((prev) => [...prev, message]);
//         reset();
//         onScrollToBottom();
//       }
//     } catch (error) {
//       console.error('Failed to send message:', error);
//     } finally {
//       setLoading(false);
//     }
//   });

//   return (
//     <div className="flex-1 flex flex-col h-0 relative bg-white dark:bg-gray-900">
//       <div className="flex-1 h-0 w-full flex flex-col">
//         <Loader loading={loading}>
//           <div
//             ref={messageWindowRef}
//             className="w-full flex-1 h-0 flex flex-col gap-3 pl-5 py-5 overflow-y-auto"
//           >
//             {chats.length > 0 ? (
//               chats.map((chat, index) => (
//                 <Bubble key={index} message={chat.message} createdAt={chat.createdAt} />
//               ))
//             ) : (
//               <p className="text-center text-gray-500">No messages yet.</p>
//             )}
//           </div>
//         </Loader>
//       </div>
//       <form
//         onSubmit={onHandleSentMessage}
//         className="flex px-3 pt-3 pb-10 flex-col backdrop-blur-sm bg-muted w-full"
//       >
//         <div className="flex justify-between items-center">
//           <Input
//             {...register('content')}
//             placeholder="Type your message..."
//             className="focus-visible:ring-0 flex-1 p-0 focus-visible:ring-offset-0 bg-muted rounded-none outline-none border-none"
//           />
//           <Button type="submit" className="mt-3 px-7 ml-2" disabled={!chatRoom}>
//             Send
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }
