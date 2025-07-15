"use client";

import { useState, useEffect, useRef } from 'react';

import { User } from '@supabase/supabase-js';
import { Send, ArrowLeft, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
}

const ActiveChat = ({ chatRoom, chatPartner, currentUser, onBack, onEndChat }: ActiveChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {chatPartner.name}
              </h2>
              <p className="text-white/70 text-sm">
                @{chatPartner.username} • {chatPartner.city && chatPartner.country 
                  ? `${chatPartner.city}, ${chatPartner.country}` 
                  : chatPartner.country || 'Location not specified'}
              </p>
            </div>
          </div>
          <Button
            onClick={onEndChat}
            variant="destructive"
            size="sm"
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            End Chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/70">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white/70">
                <p className="text-lg mb-2">Start the conversation!</p>
                <p>Send the first message to {chatPartner.name}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_own_message ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                      message.is_own_message
                        ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white'
                        : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                    }`}
                  >
                    {!message.is_own_message && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.sender_name}
                        </span>
                        <span className="text-xs opacity-70">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                    <p className="text-sm lg:text-base break-words">
                      {message.content}
                    </p>
                    {message.is_own_message && (
                      <div className="text-xs opacity-70 text-right mt-1">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-4">
        <div className="flex items-center space-x-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Send a message to ${chatPartner.name}...`}
            className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 rounded-2xl px-4 py-3 border border-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-none max-h-32"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveChat;