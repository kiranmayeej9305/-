// 'use server'

// import { pusherServer } from '@/lib/utils'
// import {
//   getConversationMode,
//   getDomainChatRooms,
//   getChatMessages,
//   updateChatRoom,
//   updateMessagesToSeen,
//   createMessageInChatRoom,
// } from '@/lib/queries'

// export const onToggleRealtime = async (id: string, state: boolean) => {
//   try {
//     const chatRoom = await updateChatRoom(id, { live: state }, { id: true, live: true });

//     if (chatRoom) {
//       return {
//         status: 200,
//         message: chatRoom.live ? 'Realtime mode enabled' : 'Realtime mode disabled',
//         chatRoom,
//       };
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const onGetConversationMode = async (id: string) => {
//   try {
//     const mode = await getConversationMode(id);
//     return mode;
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const onGetDomainChatRooms = async (id: string) => {
//   try {
//     const domains = await getDomainChatRooms(id);
//     if (domains) {
//       return domains;
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const onGetChatMessages = async (id: string) => {
//   try {
//     const messages = await getChatMessages(id);
//     if (messages) {
//       return messages;
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const onViewUnReadMessages = async (id: string) => {
//   try {
//     await updateMessagesToSeen(id);
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const onRealTimeChat = async (
//   chatroomId: string,
//   message: string,
//   id: string,
//   role: 'assistant' | 'user'
// ) => {
//   pusherServer.trigger(chatroomId, 'realtime-mode', {
//     chat: {
//       message,
//       id,
//       role,
//     },
//   });
// };

// export const onOwnerSendMessage = async (
//   chatroom: string,
//   message: string,
//   role: 'assistant' | 'user'
// ) => {
//   try {
//     const chat = await createMessageInChatRoom(chatroom, message, role);
//     if (chat) {
//       return chat;
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };
