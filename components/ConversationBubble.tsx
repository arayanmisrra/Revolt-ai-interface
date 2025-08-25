
import React from 'react';
import { Message, Role } from '../types';
import { UserIcon, SparklesIcon } from './Icons';

interface ConversationBubbleProps {
  message: Message;
}

const ConversationBubble: React.FC<ConversationBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.User;

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <SparklesIcon className="w-6 h-6 text-white" />
        </div>
      )}
      <div
        className={`max-w-md rounded-2xl px-5 py-3 shadow-md text-base ${
          isUser
            ? 'bg-blue-600 rounded-br-none'
            : 'bg-gray-700 rounded-bl-none'
        }`}
      >
        <p>{message.text}</p>
      </div>
       {isUser && (
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );
};

export default ConversationBubble;
