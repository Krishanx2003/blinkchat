"use client";

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import ActiveChat from './_components/ActiveChat';
import UserDiscovery from './_components/UserDiscovery';
import { supabase } from '@/lib/client';

export interface OnlineUser {
  user_id: string;
  name: string;
  username: string;
  gender: string;
  age: number;
  country: string;
  city: string;
  last_seen: string;
}

export interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  created_at: string;
}

const ChatPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
  const [chatPartner, setChatPartner] = useState<OnlineUser | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const router = useRouter();

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowChatList(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Check for current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        updateUserPresence(user.id, true);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        router.push('/auth');
      } else {
        setUser(session.user);
        updateUserPresence(session.user.id, true);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (user) {
        updateUserPresence(user.id, false);
      }
    };
  }, [router]);

  const updateUserPresence = async (userId: string, isOnline: boolean) => {
    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: userId,
          is_online: isOnline,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const handleUserSelect = async (selectedUser: OnlineUser) => {
    if (!user) return;

    try {
      // Check if chat room already exists
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${selectedUser.user_id}),and(user1_id.eq.${selectedUser.user_id},user2_id.eq.${user.id})`)
        .eq('status', 'active')
        .single();

      let chatRoom = existingRoom;

      if (!existingRoom) {
        // Create new chat room
        const { data: newRoom, error } = await supabase
          .from('chat_rooms')
          .insert({
            user1_id: user.id,
            user2_id: selectedUser.user_id,
            status: 'active'
          })
          .select()
          .single();

        if (error) {
          toast.error('Failed to create chat room');
          return;
        }
        chatRoom = newRoom;
      }

      setActiveChat(chatRoom);
      setChatPartner(selectedUser);
      
      // Handle mobile view
      if (isMobileView) {
        setShowChatList(false);
      }
    } catch (error) {
      console.error('Error creating/finding chat room:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleBackToDiscovery = () => {
    setActiveChat(null);
    setChatPartner(null);
    setShowChatList(true);
  };

  const handleEndChat = async () => {
    if (!activeChat) return;

    try {
      await supabase
        .from('chat_rooms')
        .update({ 
          status: 'ended', 
          ended_at: new Date().toISOString() 
        })
        .eq('id', activeChat.id);

      setActiveChat(null);
      setChatPartner(null);
      setShowChatList(true);
      toast.success('Chat ended');
    } catch (error) {
      console.error('Error ending chat:', error);
      toast.error('Failed to end chat');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Left Sidebar - User Discovery */}
      <div className={`${
        isMobileView 
          ? (showChatList ? 'w-full' : 'hidden') 
          : 'w-full md:w-1/3'
      } bg-secondary border-r border-border flex flex-col`}>
        {/* Header */}
        <div className="bg-muted p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-medium text-foreground">
                  {activeChat ? `Chat with ${chatPartner?.name}` : 'Filtered Chat'}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* User Discovery Component */}
        <div className="flex-1 overflow-hidden">
          <UserDiscovery
            currentUser={user}
            onUserSelect={handleUserSelect}
            isMobileView={isMobileView}
          />
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className={`${
        isMobileView 
          ? (showChatList ? 'hidden' : 'w-full') 
          : 'flex-1'
      } flex flex-col`}>
        {activeChat && chatPartner ? (
          <ActiveChat
            chatRoom={activeChat}
            chatPartner={chatPartner}
            currentUser={user}
            onBack={handleBackToDiscovery}
            onEndChat={handleEndChat}
            isMobileView={isMobileView}
          />
        ) : (
          <div className={`flex-1 flex items-center justify-center bg-background ${isMobileView ? 'hidden' : ''}`}>
            <div className="text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowLeft className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-light text-muted-foreground mb-2">Filtered Chat</h2>
              <p className="text-muted-foreground px-4">Select a user from the list to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;