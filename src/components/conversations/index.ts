// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { Loader } from '@/components/ui/loader';
// import ChatCard from '@/components/ui/chat-card';
// import { CardDescription } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { getChatMessages } from '@/lib/queries';
// import { useChatContext } from '@/context/use-chat-context';

// type ChatRoom = {
//   id: string;
//   createdAt: Date;
//   message: {
//     message: string;
//     createdAt: Date;
//     seen: boolean;
//   }[];
// };

// type Props = {
//   chatRooms: ChatRoom[];
// };

// const ConversationMenu: React.FC<Props> = ({ chatRooms }) => {
//   const { setLoading: loadMessages, setChats, setChatRoom } = useChatContext();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [filteredRooms, setFilteredRooms] = useState(chatRooms);

//   const onGetActiveChatMessages = async (id: string) => {
//     try {
//       loadMessages(true);
//       const messages = await getChatMessages(id);
//       if (messages) {
//         setChatRoom(id);
//         loadMessages(false);
//         setChats(messages.message);
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     if (searchQuery) {
//       const filtered = chatRooms.filter((room) =>
//         room.message[0]?.message
//           .toLowerCase()
//           .includes(searchQuery.toLowerCase())
//       );
//       setFilteredRooms(filtered);
//     } else {
//       setFilteredRooms(chatRooms);
//     }
//   }, [searchQuery, chatRooms]);

//   return (
//     <div className="py-3 px-0">
//       <Tabs defaultValue="unread" className="w-full">
//         <TabsList className="flex justify-between items-center mb-4">
//           {['unread', 'all', 'expired', 'starred'].map((tab) => (
//             <TabsTrigger
//               key={tab}
//               value={tab}
//               className="capitalize font-semibold"
//             >
//               {tab}
//             </TabsTrigger>
//           ))}
//           <div className="flex gap-2">
//             <Input
//               placeholder="Search..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full max-w-xs"
//             />
//             <Button onClick={() => setSearchQuery('')}>Clear</Button>
//           </div>
//         </TabsList>
//         <TabsContent value="unread">
//           <div className="flex flex-col">
//             <Loader loading={loading}>
//               {filteredRooms.length ? (
//                 filteredRooms.map((room) => (
//                   <ChatCard
//                     key={room.id}
//                     seen={room.message[0]?.seen}
//                     id={room.id}
//                     onChat={() => onGetActiveChatMessages(room.id)}
//                     createdAt={room.message[0]?.createdAt}
//                     title={room.id}
//                     description={room.message[0]?.message}
//                   />
//                 ))
//               ) : (
//                 <CardDescription>No chats available</CardDescription>
//               )}
//             </Loader>
//           </div>
//         </TabsContent>
//         <TabsContent value="all">
//           <Separator orientation="horizontal" className="mt-5" />
//           <CardDescription>All chats will be shown here.</CardDescription>
//         </TabsContent>
//         <TabsContent value="expired">
//           <Separator orientation="horizontal" className="mt-5" />
//           <CardDescription>Expired chats will be shown here.</CardDescription>
//         </TabsContent>
//         <TabsContent value="starred">
//           <Separator orientation="horizontal" className="mt-5" />
//           <CardDescription>Starred chats will be shown here.</CardDescription>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default ConversationMenu;
