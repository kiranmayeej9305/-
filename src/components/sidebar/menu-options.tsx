'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { ChevronsUpDown, Menu, ChevronDown, ChevronRight, Bot } from 'lucide-react'; // Import Bot icon for chatbot
import { Landmark } from 'lucide-react'; // Import Office icon for account
import clsx from 'clsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { getAccountSidebarOptions, getChatbotSidebarOptions } from '@/lib/queries';
import { icons } from '@/lib/constants';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';

type Props = {
  defaultOpen?: boolean;
  chatbots: Chatbot[];
  sidebarLogo: string;
  details: any;
  user: any;
  id: string;
  type: 'account' | 'chatbot';
};

const MenuOptions: React.FC<Props> = ({ details, id, chatbots, user, defaultOpen, type }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarOptions, setSidebarOptions] = useState<
    (AccountSidebarOption | ChatbotSidebarOption)[]
  >([]);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [context, setContext] = useState(type);
  const [searchQuery, setSearchQuery] = useState('');

  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );

  useEffect(() => {
    const fetchSidebarOptions = async () => {
      const options = context === 'account'
        ? await getAccountSidebarOptions(id)
        : await getChatbotSidebarOptions(id);
      setSidebarOptions(options);
    };

    setIsMounted(true);
    fetchSidebarOptions();
  }, [context, id]);

  const handleMenuClick = useCallback((optionId: string, hasSubmenu: boolean, parentId?: string) => {
    if (hasSubmenu) {
      setExpandedMenu(prev => (prev === optionId ? null : optionId));
    } else {
      setExpandedMenu(parentId || null);
      setSelectedMenu(optionId);
      const option = sidebarOptions.find(opt => opt.id === optionId);
      if (option) handleNavigation(option.link);
    }
  }, [sidebarOptions]);

  const handleNavigation = useCallback((link: string) => {
    const resolvedLink = link
      .replace(':chatbotId', context === 'chatbot' ? id : '')
      .replace(':accountId', context === 'account' ? id : '');
    router.push(resolvedLink);
  }, [context, id, router]);

  const renderMenuOptions = useCallback((options: (AccountSidebarOption | ChatbotSidebarOption)[], parentId: string | null = null) => {
    return options
      .filter(option => option.parentId === parentId)
      .map(option => {
        const hasSubmenu = options.some(childOption => childOption.parentId === option.id);
        const IconComponent = icons.find(icon => icon.value === option.icon)?.path;

        return (
          <div key={option.id} className={clsx('mt-2', { 'ml-2': parentId })}>
            <div className="flex items-center justify-between w-full group">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMenuClick(option.id, hasSubmenu, parentId)}
                className={clsx(
                  'flex items-center gap-2 hover:bg-primary hover:text-white rounded-md transition-all w-full text-left justify-start',
                  { 'bg-primary text-white': expandedMenu === option.id || selectedMenu === option.id }
                )}
              >
                {IconComponent && (
                  <IconComponent className="text-muted-foreground group-hover:text-white" />
                )}
                <span className="font-semibold group-hover:text-white">
                  {option.name}
                </span>
              </Button>
              {hasSubmenu && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => handleMenuClick(option.id, hasSubmenu)}
                >
                  {expandedMenu === option.id ? <ChevronDown /> : <ChevronRight />}
                </Button>
              )}
            </div>
            {hasSubmenu && expandedMenu === option.id && (
              <div className="ml-2 pl-1 border-l-2 border-primary">
                {renderMenuOptions(options, option.id)}
              </div>
            )}
          </div>
        );
      });
  }, [expandedMenu, selectedMenu, handleMenuClick]);

  const filteredChatbots = useMemo(() => {
    return chatbots.filter(chatbot => chatbot.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [chatbots, searchQuery]);

  if (!isMounted) return null;

  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger asChild className="absolute left-4 top-4 z-[100] md:!hidden flex">
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        showX={!defaultOpen}
        side="left"
        className={clsx(
          'bg-background/90 backdrop-blur-xl fixed top-0 border-r-[1px] p-6 transition-all h-screen',
          {
            'hidden md:inline-block z-0 w-[300px]': defaultOpen,
            'inline-block md:hidden z-[100] w-full': !defaultOpen,
          }
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="lg" className="flex items-center justify-between w-full border border-black rounded-md">
              <span className="font-bold text-lg">
                {context === 'account' ? 'Select Chatbot' : 'Select Account'}
              </span>
              <ChevronsUpDown size={16} className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full max-h-60 overflow-y-auto border border-black shadow-md">
            <DropdownMenuLabel className="px-2">Accounts</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => {
              setContext('account');
              handleNavigation(`/account/${user.Account.id}`);
            }}>
              {user.Account.name}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-2">Chatbots</DropdownMenuLabel>
            <div className="px-2 pb-2">
              <input
                type="text"
                placeholder="Search Chatbots..."
                className="w-full p-2 rounded-md border border-muted"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {filteredChatbots.map(chatbot => (
              <DropdownMenuItem
                key={chatbot.id}
                onClick={() => {
                  setContext('chatbot');
                  handleNavigation(`/chatbot/${chatbot.id}`);
                }}
              >
                {chatbot.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Card className="mb-4 p-6 text-center bg-blue-100 text-primary rounded-lg shadow-lg mt-6 flex flex-col items-center">
          {context === 'account' ? (
            <Landmark size={48} className="text-primary mb-4" />
          ) : (
            <Bot size={48} className="text-primary mb-4" />
          )}
          <div className="font-bold text-lg">
            {context === 'account' ? user.Account.name : details.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {context === 'account' ? 'Free Tier' : `${details?.ChatbotSettings?.ChatbotType?.name || 'Custom Type'} - ${details?.ChatbotSettings?.AIModel?.name || 'Unknown Model'}`}
          </div>
        </Card>
        <nav className="relative">
          <div className="py-4 overflow-visible">
            <Card className="overflow-visible p-4">
              {renderMenuOptions(sidebarOptions)}
            </Card>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MenuOptions;
