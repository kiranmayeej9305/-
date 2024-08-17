import { AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { getAuthUserDetails } from '@/lib/queries';
import { Chatbot } from '@prisma/client';
import Link from 'next/link';
import React from 'react';
import DeleteButton from './all-chatbots/_components/delete-button';
import CreateChatbotButton from './all-chatbots/_components/create-Chatbot-btn';

type Props = {
  params: { accountId: string };
};

const AllChatbotsPage = async ({ params }: Props) => {
  const user = await getAuthUserDetails();

  // Add logging to inspect the user and account data
  console.log("User data:", user);
  console.log("Account ID:", params.accountId);

  if (!user) {
    console.error("No user found!");
    return;
  }

  if (!user.Account?.Chatbot.length) {
    console.warn("No chatbots found for this account.");
  }

  return (
    <AlertDialog>
      <div className="flex flex-col">
        <CreateChatbotButton
          user={user}
          id={params.accountId}
          className="w-[200px] self-end m-6"
        />
        <Command className="rounded-lg bg-transparent">
          <CommandInput placeholder="Search Chatbot..." />
          <CommandList>
            <CommandEmpty>No Results Found.</CommandEmpty>
            <CommandGroup heading="Chatbots">
              {!!user.Account?.Chatbot.length ? (
                user.Account.Chatbot.map((chatbot: Chatbot) => {
                  // Log each chatbot to ensure they are being rendered correctly
                  console.log("Rendering chatbot:", chatbot);

                  return (
                    <CommandItem
                      key={chatbot.id}
                      className="h-32 !bg-background my-2 text-primary border-[1px] border-border p-4 rounded-lg hover:!bg-background cursor-pointer transition-all"
                    >
                      <div className="flex gap-4 w-full h-full">
                        <Link
                          href={`/chatbot/${chatbot.id}`}
                          className="flex flex-col justify-between flex-grow"
                        >
                          <div className="flex flex-col">
                            {chatbot.name}
                            <span className="text-muted-foreground text-xs">
                              {chatbot.address}
                            </span>
                          </div>
                        </Link>
                        <AlertDialogTrigger asChild>
                          <Button
                            size={'sm'}
                            variant={'destructive'}
                            className="w-20 hover:bg-red-600 hover:text-white !text-white"
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                      </div>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-left">
                            Are your absolutely sure
                          </AlertDialogTitle>
                          <AlertDescription className="text-left">
                            This action cannot be undone. This will delete the
                            Chatbot and all data related to the Chatbot.
                          </AlertDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex items-center">
                          <AlertDialogCancel className="mb-2">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive">
                            <DeleteButton chatbotId={chatbot.id} />
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </CommandItem>
                  );
                })
              ) : (
                <div className="text-muted-foreground text-center p-4">
                  No Chatbots
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </AlertDialog>
  );
};

export default AllChatbotsPage;
