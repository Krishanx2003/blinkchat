"use client";

import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  Smile,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { ChatRoom, OnlineUser } from '../page';
import { supabase } from '@/lib/client';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_name: string;
  sender_username: string;
  is_own_message: boolean;
}

interface ActiveChatProps {
  chatRoom: ChatRoom;
  chatPartner: OnlineUser;
  currentUser: User;
  onBack: () => void;
  onEndChat: () => void;
  isMobileView: boolean;
}

const ActiveChat = ({ chatRoom, chatPartner, currentUser, onBack, onEndChat, isMobileView }: ActiveChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const emojis = ['😊', '😂', '😍', '😔', '😎', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'];

  useEffect(() => {
    loadMessages();
    
    // Set up realtime subscription for new messages
    const channel = supabase
      .channel(`chat_room_${chatRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `chat_room_id=eq.${chatRoom.id}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Get the sender profile info
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, username')
            .eq('user_id', payload.new.sender_id)
            .single();

          const newMsg: Message = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            sender_name: profileData?.name || 'Unknown User',
            sender_username: profileData?.username || 'unknown',
            is_own_message: payload.new.sender_id === currentUser.id
          };

          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoom.id, currentUser.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (newMessage.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [newMessage]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_chat_messages', {
        room_id: chatRoom.id
      });
      
      if (error) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('private_messages')
        .insert({
          chat_room_id: chatRoom.id,
          sender_id: currentUser.id,
          content: newMessage.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      } else {
        setNewMessage('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCountryFlag = (country: string) => {
    // Simple country to flag mapping - you can expand this
    const flagMap: { [key: string]: string } = {
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'United Kingdom': '🇬🇧',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'India': '🇮🇳',
      'China': '🇨🇳',
      'Japan': '🇯🇵',
      'Brazil': '🇧🇷',
      'Australia': '🇦🇺'
    };
    return flagMap[country] || '🌍';
  };

  const handleBlockUser = () => {
    // Implement block user functionality
    toast.info('Block user functionality to be implemented');
  };

  const handleReportUser = () => {
    // Implement report user functionality
    toast.info('Report user functionality to be implemented');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 relative">
        {/* Left side - Back button and user info */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {chatPartner.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full bg-green-500" />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{chatPartner.name}</h3>
                <span className="text-lg">{getCountryFlag(chatPartner.country)}</span>
              </div>
              <p className="text-sm text-gray-500">
                {isTyping ? 'typing...' : 'Online'}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]">
              <button
                onClick={() => {
                  handleBlockUser();
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <Shield className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Block User</span>
              </button>
              <button
                onClick={() => {
                  handleReportUser();
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report User</span>
              </button>
              <button
                onClick={() => {
                  onEndChat();
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600"
              >
                <span>End Chat</span>
              </button>
            </div>
          )}

          {/* Overlay to close menu */}
          {showMenu && (
            <div 
              className="fixed inset-0 z-0" 
              onClick={() => setShowMenu(false)}
            />
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Start the conversation!</p>
              <p>Send the first message to {chatPartner.name}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.is_own_message ? 'justify-end' : 'justify-start'}`}
              >
                <div className="group relative max-w-xs sm:max-w-md">
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.is_own_message
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                    } transition-all duration-200 hover:shadow-md`}
                  >
                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                  </div>
                  
                  {/* Timestamp tooltip */}
                  <div className={`absolute top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 ${
                    message.is_own_message ? 'right-0' : 'left-0'
                  }`}>
                    {formatTime(message.created_at)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 max-w-xs border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-2">
            {/* Emoji button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Emoji picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20">
                  <div className="grid grid-cols-6 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        className="text-lg hover:bg-gray-100 p-1 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Message input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={handleTextareaChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full resize-none rounded-full px-4 py-2 bg-gray-100 border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 outline-none"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className={`p-2 rounded-full transition-all duration-200 ${
                newMessage.trim()
                  ? 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Overlay to close emoji picker */}
        {showEmojiPicker && (
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowEmojiPicker(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ActiveChat;