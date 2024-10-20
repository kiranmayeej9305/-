// 'use client';

// import React from 'react';
// import MessagesChat from './message-chat';
// import MessagesFooter from './message-footer';

// type MessagesBodyProps = {
//   suggestedMessage?: string;
//   userMsgBackgroundColour?: string;
//   chatbotMsgBackgroundColour?: string;
//   userTextColor?: string;
//   chatbotTextColor?: string;
//   userAvatar?: string;
//   chatbotAvatar?: string;
//   footerText?: string;
//   copyRightMessage?: string;
// };

// const MessagesBody: React.FC<MessagesBodyProps> = ({
//   suggestedMessage,
//   userMsgBackgroundColour,
//   chatbotMsgBackgroundColour,
//   userTextColor,
//   chatbotTextColor,
//   userAvatar,
//   chatbotAvatar,
//   footerText,
//   copyRightMessage,
// }) => {
//   return (
//     <div className="flex flex-col h-full">
//       <div className="flex-grow p-4 overflow-y-auto">
//         <MessagesChat
//           suggestedMessage={suggestedMessage}
//           userMsgBackgroundColour={userMsgBackgroundColour}
//           chatbotMsgBackgroundColour={chatbotMsgBackgroundColour}
//           userTextColor={userTextColor}
//           chatbotTextColor={chatbotTextColor}
//           userAvatar={userAvatar}
//           chatbotAvatar={chatbotAvatar}
//         />
//       </div>
//       <MessagesFooter
//         footerText={footerText}
//         copyRightMessage={copyRightMessage}
//       />
//     </div>
//   );
// };

// export default MessagesBody;
