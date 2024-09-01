import { db } from '@/lib/db';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import CreateChatbotButton from './create-chatbot-btn';

type Props = {
  params: { accountId: string };
};

const AllChatbotsPage = async ({ params }: Props) => {
  const user = await getAuthUserDetails();

  if (!user) {
    console.error("No user found!");
    return null;
  }

  const accountDetails = await db.account.findUnique({
    where: {
      id: params.accountId,
    },
    include: {
      Chatbot: {
        include: {
          ChatbotSettings: {
            include: {
              AIModel: true,
              ChatbotType: true,
            },
          },
        },
      },
    },
  });

  if (!accountDetails) {
    console.error("No account found for the given ID");
    return null;
  }

  const chatbots = accountDetails.Chatbot || [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-end mb-6">
        <CreateChatbotButton
          user={user}
          id={params.accountId}
          className="w-[200px] self-end m-6"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {chatbots.length > 0 ? (
          chatbots.map((chatbot) => (
            <Card key={chatbot.id} className="shadow-lg flex flex-col justify-between">
              <CardHeader className="flex flex-col items-center">
                <MessageSquare size={48} className="text-primary mb-4" />
                <CardTitle className="text-center">
                  {chatbot.name}
                </CardTitle>
                <CardDescription className="text-center text-sm">
                  {chatbot.ChatbotSettings?.AIModel?.name || 'Unknown Model'} : {chatbot.ChatbotSettings?.ChatbotType?.name || 'Unknown Type'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center mt-auto">
                <Link href={`/chatbot/${chatbot.id}`} className="text-blue-600 mt-4 inline-block">
                  View Details
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center col-span-full">
            No Chatbots available
          </div>
        )}
      </div>
    </div>
  );
};

export default AllChatbotsPage;
