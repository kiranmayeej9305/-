// 'use client';

// import React from 'react';
// import MessagesHeader from './message-header';
// import MessagesBody from './message-body';

// type ChatRoomProps = {
//   chatbotId: string;
// };

// const ChatRoom: React.FC<ChatRoomProps> = ({ chatbotId }) => {
//   const settings = form.watch(); // Assuming form.watch() gives access to all the form fields

//   console.log('ChatRoom Settings:', settings); // Log the settings to ensure botDisplayNameColor is correct

//   return (
//     <div className="flex flex-col h-full">
//       <MessagesHeader 
//         botDisplayName={settings.botDisplayName} 
//         chatIcon={settings.chatIcon} 
//         isLiveAgentEnabled={settings.isLiveAgentEnabled} 
//         helpdeskLiveAgentColor={settings.helpdeskLiveAgentColor} 
//         themeColor={settings.themeColor} 
//         botDisplayNameColor={settings.botDisplayNameColor} // Pass the new prop
//       />
//       <MessagesBody />
//     </div>
//   );
// };

// export default ChatRoom;
