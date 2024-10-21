'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { ChevronsUpDown, Menu, ChevronDown, ChevronRight, Bot, X } from 'lucide-react';
import { Landmark } from 'lucide-react';
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
import { Card } from '../ui/card';
import { AccountSidebarOption, Chatbot, ChatbotSidebarOption } from '@prisma/client';

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
  const [isOpen, setIsOpen] = useState(false); // Track open state

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

  const handleMenuClick = useCallback((optionId: string, hasSubmenu: boolean, parentId?: string | null) => {
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
        if (option.name === 'Manage Blogs' && !user.email.includes('dipuoec')) {
          return null; // Skip rendering this option
        }

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
                  <IconComponent
                    width="24"
                    height="24"
                  />
                )}
                <span className={`font-semibold group-hover:text-white ${selectedMenu === option.id ? 'text-white' : ''}`}>
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
  }, [expandedMenu, selectedMenu, handleMenuClick, user.email]);

  const filteredChatbots = useMemo(() => {
    return chatbots.filter(chatbot => chatbot.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [chatbots, searchQuery]);

  const toggleMenu = () => {
    setIsOpen(prev => !prev); // Toggle menu open/close state
  };

  if (!isMounted) return null;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="lg" className="flex items-center justify-between w-full mb-4">
            <span className="font-bold text-lg">
              {context === 'account' ? 'Select Chatbot' : 'Select Account'}
            </span>
            <ChevronsUpDown size={16} className="ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
          <DropdownMenuLabel>Accounts</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => {
            setContext('account');
            handleNavigation(`/account/${user.Account.id}`);
          }}>
            {user.Account.name}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Chatbots</DropdownMenuLabel>
          <div className="px-2 pb-2">
            <input
              type="text"
              placeholder="Search Chatbots..."
              className="w-full p-2 rounded-md border"
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

      <Card className="mb-4 p-4 text-center bg-blue-100 text-primary rounded-lg shadow-lg">
        {context === 'account' ? (
          <Landmark size={32} className="text-primary mb-2 mx-auto" />
        ) : (
          <Bot size={32} className="text-primary mb-2 mx-auto" />
        )}
        <div className="font-bold text-lg">
          {context === 'account' ? user.Account.name : details.name}
        </div>
        <div className="text-sm text-muted-foreground">
          {context === 'account' ? 'Free Tier' : `${details?.ChatbotSettings?.ChatbotType?.name || 'Custom Type'} - ${details?.ChatbotSettings?.AIModel?.name || 'Unknown Model'}`}
        </div>
      </Card>

      <nav className="overflow-y-auto flex-grow">
        {renderMenuOptions(sidebarOptions)}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[300px] border-r p-6 h-screen overflow-y-auto fixed left-0 top-0 bg-background z-50">
        {sidebarContent}
      </aside>

      {/* Mobile Menu with always-visible hamburger */}
      <div className="lg:hidden">
        {/* Always visible hamburger button */}
        <Button variant="ghost" className="fixed top-4 left-4 z-50" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>

        <Sheet open={isOpen} onOpenChange={toggleMenu}>
          <SheetContent side="left" className="p-6">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default MenuOptions;
