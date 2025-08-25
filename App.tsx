import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Message, Status, Role } from './types';
import { useSpeech } from './hooks/useSpeech';
import { generateResponse } from './services/geminiService';
import MicButton from './components/MicButton';
import ConversationBubble from './components/ConversationBubble';
import StatusDisplay from './components/StatusDisplay';
import { GithubIcon, ZapIcon } from './components/Icons';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: Role.AI,
      text: "Hello! I'm the Revolt Motors voice assistant. How can I help you today? You can ask me about our bikes, booking a test ride, or anything else.",
    },
  ]);
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [lang, setLang] = useState<string>('en-US');

  const conversationEndRef = useRef<HTMLDivElement>(null);

  const handleTranscript = useCallback(async (transcript: string) => {
    if (!transcript) {
      setStatus(Status.Idle);
      return;
    }

    const userMessage: Message = { role: Role.User, text: transcript };
    setMessages((prev) => [...prev, userMessage]);
    setStatus(Status.Processing);

    try {
      const aiResponse = await generateResponse(transcript, [...messages, userMessage]);
      const aiMessage: Message = { role: Role.AI, text: aiResponse };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage: Message = {
        role: Role.AI,
        text: "I'm sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [messages]);

  const { isListening, startListening, stopListening, speak, interrupt, supported } = useSpeech({
    onListenStart: () => setStatus(Status.Listening),
    onListenStop: () => {},
    onSpeakStart: () => setStatus(Status.Speaking),
    onSpeakEnd: () => setStatus(Status.Idle),
    onTranscript: handleTranscript,
    lang,
  });

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === Role.AI && status === Status.Processing) {
        speak(lastMessage.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, speak, status]);
  
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      interrupt(); // Interrupt any ongoing speech
      startListening();
    }
  };

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!supported) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-2xl">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Browser Not Supported</h1>
          <p>The Web Speech API is not supported by your browser. Please try Chrome or Edge.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col font-sans">
      <header className="w-full max-w-4xl mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <ZapIcon className="w-8 h-8 text-indigo-400" />
           <h1 className="text-2xl font-bold tracking-tight">Revolt Motors AI</h1>
        </div>
        <a href="https://github.com/google/prompt-gallery" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <GithubIcon className="w-6 h-6" />
        </a>
      </header>
      
      <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto p-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {messages.map((msg, index) => (
            <ConversationBubble key={index} message={msg} />
          ))}
          <div ref={conversationEndRef} />
        </div>
      </main>

      <footer className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center justify-center">
        <StatusDisplay status={status} />
        <div className="my-6">
            <MicButton status={status} onClick={handleMicClick} />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Language:</span>
            <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={status !== Status.Idle}
            >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Español (España)</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
                <option value="hi-IN">हिन्दी</option>
                <option value="ja-JP">日本語</option>
            </select>
        </div>
         <p className="text-xs text-gray-600 mt-4 text-center">
            Click the mic and start talking. You can interrupt the AI at any time by clicking the mic again.
         </p>
      </footer>
    </div>
  );
};

export default App;
