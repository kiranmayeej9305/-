import { getAuthUserDetails } from '@/lib/queries';
import React from 'react';
import MenuOptions from './menu-options';

type Props = {
  id: string;
  type: 'account' | 'chatbot';
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();
  if (!user) return null;

  const details =
    type === 'account'
      ? user?.Account
      : user?.Account.Chatbot.find((Chatbot) => Chatbot.id === id);

  if (!details) return null;

  let sideBarLogo = user.Account.accountLogo || '/assets/plura-logo.svg';

  if (!user.Account.whiteLabel && type === 'chatbot') {
    sideBarLogo =
      details.chatbotLogo || user.Account.accountLogo;
  }

  const chatbots = user.Account.Chatbot.filter((Chatbot) =>
    user.Permissions.find(
      (permission) =>
        permission.chatbotId === Chatbot.id && permission.access
    )
  );

  return (
    <MenuOptions
      defaultOpen={true}
      details={details}
      id={id}
      sidebarLogo={sideBarLogo}
      chatbots={chatbots}
      user={user}
      type={type}
    />
  );
};

export default Sidebar;
