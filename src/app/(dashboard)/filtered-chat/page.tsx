// App/(dashboard)/filtered-chat/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import ActiveChat from './_components/ActiveChat';
import UserDiscovery from './_components/UserDiscovery';
import { supabase } from '@/lib/client';
import { cn } from '@/lib/utils';
import EmptyState from '../_components/EmptyState';

// Updated interface to match the SQL function return type and UserDiscovery component
export interface OnlineUser {
  user_id: string;
  name: string;
  username: string;
  gender: string;
  age: number;
  country: string;
  city: string;
  last_seen: string;
  // Optional properties for UI state management
  is_online?: boolean;
  looking_for_chat?: boolean;
  updated_at?: string;
}

export interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  created_at: string;
  ended_at?: string;
}

const ChatPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
  const [chatPartner, setChatPartner] = useState<OnlineUser | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for mobile view (sync with DashboardLayout's breakpoint)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024); // Match DashboardLayout's lg breakpoint
      if (window.innerWidth >= 1024) {
        setShowChatList(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for current user
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          router.push('/auth');
          return;
        }

        if (!currentUser) {
          router.push('/auth');
          return;
        }

        setUser(currentUser);
        await updateUserPresence(currentUser.id, true, true);
      } catch (error) {
        console.error('Initialization error:', error);
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        if (user) {
          await updateUserPresence(user.id, false, false);
        }
        router.push('/auth');
      } else if (event === 'SIGNED_IN' && session.user) {
        setUser(session.user);
        await updateUserPresence(session.user.id, true, true);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (user) {
        updateUserPresence(user.id, false, false);
      }
    };
  }, [router]);

  const updateUserPresence = async (userId: string, isOnline: boolean, lookingForChat: boolean = false) => {
    try {
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: userId,
          is_online: isOnline,
          looking_for_chat: lookingForChat,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating presence:', error);
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const handleUserSelect = async (selectedUser: OnlineUser) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Check for existing chat room between users
      const { data: existingRooms, error: searchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${selectedUser.user_id}),and(user1_id.eq.${selectedUser.user_id},user2_id.eq.${user.id})`
        )
        .eq('status', 'active');

      if (searchError) {
        console.error('Error searching for existing room:', searchError);
        toast.error('Failed to search for existing chat');
        return;
      }

      let chatRoom: ChatRoom;

      if (existingRooms && existingRooms.length > 0) {
        // Use existing room
        chatRoom = existingRooms[0] as ChatRoom;
      } else {
        // Create new room
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            user1_id: user.id,
            user2_id: selectedUser.user_id,
            status: 'active',
          })
          .select()
          .single();

        if (createError || !newRoom) {
          console.error('Error creating chat room:', createError);
          toast.error('Failed to create chat room');
          return;
        }
        chatRoom = newRoom as ChatRoom;
      }

      setActiveChat(chatRoom);
      setChatPartner(selectedUser);
      
      if (isMobileView) {
        setShowChatList(false);
      }
      
      toast.success(`Connected with ${selectedUser.name}`);
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
      const { error } = await supabase
        .from('chat_rooms')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', activeChat.id);

      if (error) {
        console.error('Error ending chat:', error);
        toast.error('Failed to end chat');
        return;
      }

      setActiveChat(null);
      setChatPartner(null);
      setShowChatList(true);
      toast.success('Chat ended');
    } catch (error) {
      console.error('Error ending chat:', error);
      toast.error('Failed to end chat');
    }
  };

  // Loading state
  if (loading || !user) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">Loading your chat...</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Connecting to conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-900">
      {/* User Discovery Sidebar */}
      <div 
        className={cn(
          'lg:flex-shrink-0 lg:border-r lg:border-slate-200 dark:lg:border-slate-700',
          'bg-white dark:bg-slate-900 shadow-sm',
          isMobileView ? (showChatList ? 'w-full' : 'hidden') : 'w-96',
          'h-full overflow-hidden transition-all duration-300',
          'flex flex-col',
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Discover</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">Find people to chat with</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-medium text-violet-600 dark:text-violet-400">Live</span>
            </div>
          </div>
        </div>
        
        {/* User Discovery Content */}
        <div className="flex-1 overflow-hidden">
          <UserDiscovery
            currentUser={user}
            onUserSelect={handleUserSelect}
            isMobileView={isMobileView}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        'flex-1 flex flex-col h-full bg-white dark:bg-slate-900',
        isMobileView && !showChatList ? 'flex' : 'hidden lg:flex'
      )}>
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
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="max-w-md text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-violet-500 dark:text-violet-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Ready to Connect?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Choose someone from the discovery panel to start a meaningful conversation. 
                Your next great chat is just a click away!
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>People are online and ready to chat</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;