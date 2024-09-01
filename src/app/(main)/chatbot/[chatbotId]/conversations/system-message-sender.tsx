// src/lib/system-message-sender.ts
'use client';

import { createMessageInChatRoom } from '@/lib/queries';

const SystemMessageSender = {
  sendSystemMessage: async (chatRoomId: string, message: string) => {
    try {
      await createMessageInChatRoom(chatRoomId, message, 'system');
    } catch (error) {
      console.error('Failed to send system message:', error);
    }
  },
};

export default SystemMessageSender;
