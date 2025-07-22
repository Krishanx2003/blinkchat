"use client";

import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  Send, 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Mic,
  Check,
  CheckCheck,
  Search
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

  const getMessageStatus = (isOwn: boolean) => {
    if (!isOwn) return null;
    // For now, we'll show delivered status. You can implement read receipts later
    return <CheckCheck className="w-4 h-4 text-primary" />;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate avatar URL (you can replace this with actual avatars)
  const getAvatarUrl = (userId: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const color = colors[parseInt(userId.slice(-1), 16) % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(chatPartner.name)}&background=${color.slice(1)}&color=fff&size=40`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-muted p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobileView && (
            <button 
              onClick={onBack}
              className="p-1 text-muted-foreground hover:bg-secondary rounded-full transition-colors mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="relative">
            <img
              src={getAvatarUrl(chatPartner.user_id)}
              alt={chatPartner.name}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full border-2 border-background"></div>
          </div>
          <div>
            <h3 className="font-medium text-foreground text-sm sm:text-base">{chatPartner.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isTyping ? 'typing...' : 'online'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {!isMobileView && (
            <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={onEndChat}
            className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
          >
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 bg-background"
        style={{}}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">Start the conversation!</p>
              <p>Send the first message to {chatPartner.name}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.is_own_message ? 'justify-end' : 'justify-start'} mb-2`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                    message.is_own_message
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-secondary text-foreground border border-border rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    message.is_own_message ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    <span className="text-xs">{formatTime(message.created_at)}</span>
                    {getMessageStatus(message.is_own_message)}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-2">
                <div className="bg-secondary px-4 py-2 rounded-lg rounded-bl-none shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-muted p-3 sm:p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <button className="p-1.5 sm:p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="p-1.5 sm:p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2.5 sm:py-2 bg-background border border-border rounded-full text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          
          {newMessage.trim() ? (
            <button 
              onClick={sendMessage}
              className="p-1.5 sm:p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : (
            <button className="p-1.5 sm:p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveChat;