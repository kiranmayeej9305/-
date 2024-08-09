import React, { useState } from 'react';

type Props = {
  onChatbotChange: (chatbotId: string) => void;
  chatbots?:
    | {
        name: string;
        id: string;
        icon: string;
      }[]
    | undefined;
};

const ConversationSearch = ({ onChatbotChange, chatbots }: Props) => {
  const [selectedChatbot, setSelectedChatbot] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const chatbotId = event.target.value;
    setSelectedChatbot(chatbotId);
    onChatbotChange(chatbotId);
  };

  return (
    <div className="flex flex-col py-3">
      <select
        value={selectedChatbot}
        onChange={handleChange}
        className="px-3 py-4 text-sm border-[1px] rounded-lg mr-5"
      >
        <option disabled value="">
          Chatbot name
        </option>
        {chatbots?.map((chatbot) => (
          <option value={chatbot.id} key={chatbot.id}>
            {chatbot.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ConversationSearch;
