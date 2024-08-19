import React from 'react';
import { MessageSquareMore } from 'lucide-react'; // Importing a more stylish icon

type ChatBubblePreviewProps = {
  color: string;
};

const ChatBubblePreview = ({ color }: ChatBubblePreviewProps) => {
  return (
    <div className="flex justify-center items-center h-16">
      <button
        className="p-4 rounded-full shadow-xl transition-transform duration-300 ease-in-out hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        style={{
          background: `linear-gradient(135deg, ${color || '#3b82f6'}, #6a5acd)`, // Gradient for a more stylish look
        }}
      >
        <MessageSquareMore className="h-12 w-12 text-white drop-shadow-lg" />
      </button>
    </div>
  );
};

export default ChatBubblePreview;
