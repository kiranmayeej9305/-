import { getAuthUserDetails } from '@/lib/queries'
import React from 'react'
import MenuOptions from './menu-options'

type Props = {
  id: string
  type: 'account' | 'chatbot'
}

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails()
  if (!user) return null

  if (!user.Account) return

  const details =
    type === 'account'
      ? user?.Account
      : user?.Account.Chatbot.find((Chatbot) => Chatbot.id === id)

  const isWhiteLabeledAccount = user.Account.whiteLabel
  if (!details) return

  let sideBarLogo = user.Account.accountLogo || '/assets/plura-logo.svg'

  if (!isWhiteLabeledAccount) {
    if (type === 'chatbot') {
      sideBarLogo =
        user?.Account.Chatbot.find((Chatbot) => Chatbot.id === id)
          ?.chatbotLogo || user.Account.accountLogo
    }
  }

  const sidebarOpt =
    type === 'account'
      ? user.Account.SidebarOption || []
      : user.Account.Chatbot.find((Chatbot) => Chatbot.id === id)
          ?.SidebarOption || []

  const chatbots = user.Account.Chatbot.filter((Chatbot) =>
    user.Permissions.find(
      (permission) =>
        permission.chatbotId === Chatbot.id && permission.access
    )
  )

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        chatbots={chatbots}
        user={user}
        type={type}
      />
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sidebarOpt={sidebarOpt}
        chatbots={chatbots}
        user={user}
        type={type}
      />
    </>
  )
}

export default Sidebar
