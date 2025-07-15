
import { useState, useEffect, useRef } from 'react';
import { Send, Clock, X } from 'lucide-react';

interface ChatScreenProps {
  timeLeft: string;
  onEndChat: () => void;
}

interface Message {
  id: string;
  text: string;
  isOwn: boolean;
  timestamp: Date;
}

const ChatScreen = ({ timeLeft, onEndChat }: ChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! 👋",
      isOwn: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto responses for demo (simulating the other person)
  const autoResponses = [
    "How's your day going?",
    "That's interesting! Tell me more",
    "I love that! 😊",
    "What do you like to do for fun?",
    "Haha, that's funny!",
    "Where are you from?",
    "This is such a cool app idea!",
    "Time is flying by so fast!",
    "What's the most interesting thing that happened to you this week?",
    "I wish we had more time to chat!"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate responses from the other person
  useEffect(() => {
    if (messages.length > 1 && messages[messages.length - 1].isOwn) {
      const timer = setTimeout(() => {
        const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];
        const newMessage: Message = {
          id: Date.now().toString(),
          text: randomResponse,
          isOwn: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds

      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isOwn: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">Connected</span>
          </div>
          
          <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-white font-mono font-bold">{timeLeft}</span>
          </div>
          
          <button
            onClick={onEndChat}
            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.isOwn
                  ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-br-none'
                  : 'bg-white/20 backdrop-blur-sm text-white rounded-bl-none'
              } shadow-lg`}
            >
              <p className="text-sm lg:text-base">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white/10 backdrop-blur-lg border-t border-white/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-full px-4 py-3 border border-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;