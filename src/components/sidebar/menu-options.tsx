'use client';

import {
  Account,
  Chatbot,
  AccountSidebarOption,
  ChatbotSidebarOption,
} from '@prisma/client';
import React, { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { ChevronsUpDown, Compass, Menu, PlusCircleIcon, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { AspectRatio } from '../ui/aspect-ratio';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useModal } from '@/providers/modal-provider';
import CustomModal from '../global/custom-modal';
import ChatbotDetails from '../forms/chatbot-details';
import { Separator } from '../ui/separator';
import { icons } from '@/lib/constants';
import { getAccountSidebarOptions, getChatbotSidebarOptions } from '@/lib/queries';

type Props = {
  defaultOpen?: boolean;
  chatbots: Chatbot[];
  sidebarLogo: string;
  details: any;
  user: any;
  id: string;
  type: 'account' | 'chatbot';
};

const MenuOptions = ({
  details,
  id,
  sidebarLogo,
  chatbots,
  user,
  defaultOpen,
  type,
}: Props) => {
  const { setOpen } = useModal();
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarOptions, setSidebarOptions] = useState<(AccountSidebarOption | ChatbotSidebarOption)[]>([]);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const openState = useMemo(() => (defaultOpen ? { open: true } : {}), [defaultOpen]);

  useEffect(() => {
    setIsMounted(true);
    const fetchSidebarOptions = async () => {
      let options;
      if (type === 'account') {
        options = await getAccountSidebarOptions(id);
      } else {
        options = await getChatbotSidebarOptions(id);
      }
      setSidebarOptions(options);
    };
    fetchSidebarOptions();
  }, [id, type]);

  if (!isMounted) return null;

  const handleMenuClick = (optionId: string, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      setExpandedMenu((prev) => (prev === optionId ? null : optionId));
    } else {
      setExpandedMenu(null);
    }
  };

  const renderMenuOptions = (
    options: (AccountSidebarOption | ChatbotSidebarOption)[],
    parentId: string | null = null
  ) => {
    return options
      .filter((option) => option.parentId === parentId)
      .map((option) => {
        const hasSubmenu = options.some((childOption) => childOption.parentId === option.id);
        const IconComponent = icons.find((icon) => icon.value === option.icon)?.path || null;
        return (
          <div key={option.id} className={clsx('mt-2', { 'ml-4': parentId })}>
            <div className="flex items-center justify-between md:w-[320px] w-full">
              <Link
                href={!hasSubmenu ? option.link : '#'}
                onClick={() => handleMenuClick(option.id, hasSubmenu)}
                className="flex items-center gap-2 hover:bg-transparent rounded-md transition-all md:w-full w-[320px]"
              >
                {IconComponent && <IconComponent />}
                <span>{option.name}</span>
              </Link>
              {hasSubmenu && (
                <Button variant="ghost" size="icon" onClick={() => handleMenuClick(option.id, hasSubmenu)}>
                  {expandedMenu === option.id ? <ChevronDown /> : <ChevronRight />}
                </Button>
              )}
            </div>
            {hasSubmenu && expandedMenu === option.id && (
              <div className="ml-4">{renderMenuOptions(options, option.id)}</div>
            )}
          </div>
        );
      });
  };

  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger asChild className="absolute left-4 top-4 z-[100] md:!hidden flex">
        <Button variant="outline" size={'icon'}>
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent showX={!defaultOpen} side={'left'} className={clsx('bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6', {
          'hidden md:inline-block z-0 w-[300px]': defaultOpen,
          'inline-block md:hidden z-[100] w-full': !defaultOpen,
        })}
      >
        <div>
          <AspectRatio ratio={16 / 5}>
            <Image src={sidebarLogo} alt="Sidebar Logo" fill className="rounded-md object-contain" />
          </AspectRatio>
          <Popover>
            <PopoverTrigger asChild>
              <Button className="w-full my-4 flex items-center justify-between py-8" variant="ghost">
                <div className="flex items-center text-left gap-2">
                  <Compass />
                  <div className="flex flex-col">
                    {details.name}
                    <span className="text-muted-foreground">{details.address}</span>
                  </div>
                </div>
                <div>
                  <ChevronsUpDown size={16} className="text-muted-foreground" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 h-80 mt-4 z-[200]">
              <Command className="rounded-lg">
                <CommandInput placeholder="Search Accounts..." />
                <CommandList className="pb-16">
                  <CommandEmpty> No results found</CommandEmpty>
                  {(user?.role === 'ACCOUNT_OWNER' || user?.role === 'ACCOUNT_ADMIN') &&
                    user?.Account && (
                      <CommandGroup heading="Account">
                        <CommandItem className="!bg-transparent my-2 text-primary border-[1px] border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                          {defaultOpen ? (
                            <Link href={`/account/${user?.Account?.id}`} className="flex gap-4 w-full h-full">
                              <div className="relative w-16">
                                <Image src={user?.Account?.accountLogo} alt="Account Logo" fill className="rounded-md object-contain" />
                              </div>
                              <div className="flex flex-col flex-1">
                                {user?.Account?.name}
                                <span className="text-muted-foreground">{user?.Account?.address}</span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link href={`/account/${user?.Account?.id}`} className="flex gap-4 w-full h-full">
                                <div className="relative w-16">
                                  <Image src={user?.Account?.accountLogo} alt="Account Logo" fill className="rounded-md object-contain" />
                                </div>
                                <div className="flex flex-col flex-1">
                                  {user?.Account?.name}
                                  <span className="text-muted-foreground">{user?.Account?.address}</span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  <CommandGroup heading="Accounts">
                    {!!chatbots
                      ? chatbots.map((chatbot) => (
                          <CommandItem key={chatbot.id}>
                            {defaultOpen ? (
                              <Link href={`/chatbot/${chatbot.id}`} className="flex gap-4 w-full h-full">
                                <div className="flex flex-col flex-1">
                                  {chatbot.name}
                                </div>
                              </Link>
                            ) : (
                              <SheetClose asChild>
                                <Link href={`/chatbot/${chatbot.id}`} className="flex gap-4 w-full h-full">
                                  <div className="flex flex-col flex-1">
                                    {chatbot.name}
                                  </div>
                                </Link>
                              </SheetClose>
                            )}
                          </CommandItem>
                        ))
                      : 'No Accounts'}
                  </CommandGroup>
                </CommandList>
                {(user?.role === 'ACCOUNT_OWNER' || user?.role === 'ACCOUNT_ADMIN') && (
                  <SheetClose>
                    <Button className="w-full flex gap-2" onClick={() => {
                        setOpen(
                          <CustomModal
                            title="Create A Chatbot"
                            subheading="You can switch between your account account and the Chatbot from the sidebar"
                          >
                            <ChatbotDetails
                              accountDetails={user?.Account as Account}
                              userId={user?.id as string}
                              userName={user?.name}
                            />
                          </CustomModal>
                        );
                      }}
                    >
                      <PlusCircleIcon size={15} />
                      Create Chatbot
                    </Button>
                  </SheetClose>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-muted-foreground text-xs mb-2">MENU LINKS</p>
          <Separator className="mb-4" />
          <nav className="relative">
            <Command className="rounded-lg overflow-visible bg-transparent">
              <CommandInput placeholder="Search..." />
              <CommandList className="py-4 overflow-visible">
                <CommandEmpty>No Results Found</CommandEmpty>
                <CommandGroup className="overflow-visible">
                  {renderMenuOptions(sidebarOptions)}
                </CommandGroup>
              </CommandList>
            </Command>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuOptions;
