// context/use-interface-settings-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getInterfaceSettings } from '@/lib/queries';

export interface InterfaceSettings {
  icon: string;
  userAvatar: string;
  chatbotAvatar: string;
  chatIcon: string;
  background: string;
  userMsgBackgroundColour: string;
  chatbotMsgBackgroundColour: string;
  userTextColor: string;
  chatbotTextColor: string;
  helpdesk: boolean;
  copyRightMessage: string;
  footerText: string;
  messagePlaceholder: string;
  suggestedMessage: string;
  themeColor: string;
  botDisplayName: string;
  chatBubbleButtonColor: string;
  helpdeskLiveAgentColor: string;
  isLiveAgentEnabled: boolean;
  botDisplayNameColor: string;

}

type InterfaceSettingsContextProps = {
  settings: InterfaceSettings | null;
  loading: boolean;
};

const InterfaceSettingsContext = createContext<InterfaceSettingsContextProps>({
  settings: null,
  loading: true,
});

export const useInterfaceSettings = () => useContext(InterfaceSettingsContext);

export const InterfaceSettingsProvider: React.FC<{ chatbotId: string; children: React.ReactNode }> = ({ chatbotId, children }) => {
  const [settings, setSettings] = useState<InterfaceSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const fetchedSettings = await getInterfaceSettings(chatbotId);
        setSettings(fetchedSettings || null);
      } catch (error) {
        console.error('Error fetching interface settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [chatbotId]);

  return (
    <InterfaceSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </InterfaceSettingsContext.Provider>
  );
};
