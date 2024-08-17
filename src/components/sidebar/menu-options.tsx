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
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { useModal } from '@/providers/modal-provider';
import CustomModal from '../global/custom-modal';
import ChatbotCreate from '@/components/forms/chatbot-create';
import { Separator } from '../ui/separator';
import { icons } from '@/lib/constants';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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
      const option = sidebarOptions.find((opt) => opt.id === optionId);
      if (option) {
        handleNavigation(option.link);
      }
    }
  };

  const handleNavigation = (link: string) => {
    console.log(link);
    const resolvedLink = link
      .replace(':chatbotId', type === 'Chatbot' ? id : '')
      .replace(':accountId', type === 'account' ? id : '');
    console.log(type);
    console.log(id);

    // Use the router to navigate to the resolved link
    router.push(resolvedLink);
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
            <div className="flex items-center justify-between md:w-[300px] w-full group">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMenuClick(option.id, hasSubmenu)}
                className={clsx(
                  'flex items-center gap-2 hover:bg-primary hover:text-white rounded-md transition-all md:w-full w-[300px] text-left',
                  { 'bg-primary text-white': expandedMenu === option.id }
                )}
              >
                {IconComponent && (
                  <IconComponent className="text-muted-foreground group-hover:text-white" />
                )}
                <span className="font-semibold group-hover:text-white">{option.name}</span>
              </Button>
              {hasSubmenu && (
                <Button variant="ghost" size="icon" onClick={() => handleMenuClick(option.id, hasSubmenu)}>
                  {expandedMenu === option.id ? <ChevronDown /> : <ChevronRight />}
                </Button>
              )}
            </div>
            {hasSubmenu && expandedMenu === option.id && (
              <div className="ml-4 pl-4 border-l-2 border-primary">
                {renderMenuOptions(options, option.id)}
              </div>
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

      <SheetContent
        showX={!defaultOpen}
        side={'left'}
        className={clsx(
          'bg-background/90 backdrop-blur-xl fixed top-0 border-r-[1px] p-6 transition-all h-screen',
          {
            'hidden md:inline-block z-0 w-[300px]': defaultOpen,
            'inline-block md:hidden z-[100] w-full': !defaultOpen,
          }
        )}
      >
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button className="w-full my-4 flex items-center justify-between py-4 bg-secondary text-secondary-foreground rounded-lg shadow hover:bg-secondary-hover transition-all">
                <div className="flex flex-col text-left">
                  <span className="font-bold text-lg">{details.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {type === 'account' ? details.subscriptionPlan : `${details.type} - ${details.model}`}
                  </span>
                </div>
                <ChevronsUpDown size={16} className="text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full mt-4 z-[200] shadow-lg">
              <Command className="rounded-lg shadow-inner bg-muted-background">
                <CommandInput placeholder="Search..." className="p-4 text-primary" />
                <CommandList className="pb-16">
                  <CommandEmpty>No results found</CommandEmpty>
                  {(user?.role === 'ACCOUNT_OWNER' || user?.role === 'ACCOUNT_ADMIN') &&
                    user?.Account && (
                      <CommandGroup heading="Account" className="p-2 text-muted-foreground">
                        <CommandItem
                          className="!bg-transparent my-2 text-primary border-[1px] border-border p-4 rounded-md hover:!bg-muted cursor-pointer transition-all"
                          onSelect={() => handleNavigation(`/account/${user?.Account?.id}`)}
                        >
                          <div className="flex flex-col flex-1">
                            <span className="font-semibold text-lg">{user?.Account?.name}</span>
                            <span className="text-muted-foreground text-sm">
                              {user?.Account?.subscriptionPlan}
                            </span>
                          </div>
                        </CommandItem>
                      </CommandGroup>
                    )}
                  <CommandGroup heading="Chatbots" className="p-2 text-muted-foreground">
                    {!!chatbots
                      ? chatbots.map((chatbot) => (
                          <CommandItem
                            key={chatbot.id}
                            className="!bg-transparent my-2 text-primary border-[1px] border-border p-4 rounded-md hover:!bg-muted cursor-pointer transition-all"
                            onSelect={() => handleNavigation(`/chatbot/${chatbot.id}`)}
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-lg">{chatbot.name}</span>
                              <span className="text-muted-foreground text-sm">
                                {chatbot.type} - {chatbot.model}
                              </span>
                            </div>
                          </CommandItem>
                        ))
                      : 'No Chatbots'}
                  </CommandGroup>
                </CommandList>
                {(user?.role === 'ACCOUNT_OWNER' || user?.role === 'ACCOUNT_ADMIN') && (
                  <SheetClose>
                    <Button
                      className="w-full flex gap-2 justify-center items-center py-4 mt-4 bg-primary text-white rounded-lg shadow-lg hover:bg-primary-hover transition-all"
                      onClick={() => {
                        setOpen(
                          <CustomModal
                            title="Create A Chatbot"
                            subheading="You can switch between your account and the Chatbot from the sidebar"
                          >
                            <ChatbotCreate
                              accountId={user?.Account.id as Account}
                              userId={user?.id as string}
                              userName={user?.name}
                            />
                          </CustomModal>
                        );
                      }}
                    >
                      <PlusCircleIcon size={18} />
                      Create Chatbot
                    </Button>
                  </SheetClose>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-muted-foreground text-xs mb-2 font-semibold">MENU LINKS</p>
          <Separator className="mb-4 border-primary" />
          <nav className="relative">
            <Command className="rounded-lg overflow-visible bg-transparent">
              <CommandInput placeholder="Search..." className="text-primary p-4" />
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
