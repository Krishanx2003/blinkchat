"use client";

import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  Smile,
  Shield,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { ChatRoom, OnlineUser } from '../page';
import { supabase } from '@/lib/client';
import { motion } from 'framer-motion';

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
    <div className="h-full flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {chatPartner.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white dark:border-gray-900 rounded-full bg-green-500"></div>
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-gray-900 dark:text-white">{chatPartner.name}</h2>
              <span className="text-lg">{getCountryFlag(chatPartner.country)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isTyping ? (
                <span className="flex items-center text-indigo-600 dark:text-indigo-400">
                  <span className="flex space-x-1 mr-1">
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                  typing...
                </span>
              ) : 'Online now'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20"
            >
              <button
                onClick={() => {
                  handleBlockUser();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Block User</span>
              </button>
              <button
                onClick={() => {
                  handleReportUser();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center space-x-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report User</span>
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              <button
                onClick={() => {
                  onEndChat();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                End Chat
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No messages yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Say hello to {chatPartner.name} and start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isSameSender = index > 0 && messages[index - 1].is_own_message === message.is_own_message;
              const isFirstInGroup = !isSameSender;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.is_own_message ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs sm:max-w-md ${isFirstInGroup ? 'mt-3' : 'mt-1'}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        message.is_own_message
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                      } transition-all duration-200 hover:shadow-md`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    </div>
                    <div className={`text-xs mt-1 px-1 ${
                      message.is_own_message ? 'text-right text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs border border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-2">
            {/* Emoji button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 hover:text-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Emoji picker */}
              {showEmojiPicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 z-20 w-64"
                >
                  <div className="grid grid-cols-6 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
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
                className="w-full resize-none rounded-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 outline-none pr-12"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              
              {/* Send button */}
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className={`absolute right-1.5 bottom-1.5 p-1.5 rounded-full transition-all duration-200 ${
                  newMessage.trim()
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
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