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
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const handleUserSelect = async (selectedUser: OnlineUser) => {
    if (!user) return;

    try {
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${selectedUser.user_id}),and(user1_id.eq.${selectedUser.user_id},user2_id.eq.${user.id})`,
        )
        .eq('status', 'active')
        .single();

      let chatRoom = existingRoom;

      if (!existingRoom) {
        const { data: newRoom, error } = await supabase
          .from('chat_rooms')
          .insert({
            user1_id: user.id,
            user2_id: selectedUser.user_id,
            status: 'active',
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
          ended_at: new Date().toISOString(),
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
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">Loading your chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      {/* Chat List */}
      <div 
        className={cn(
          'lg:flex-shrink-0 lg:border-r lg:border-gray-200 bg-white',
          isMobileView ? (showChatList ? 'w-full' : 'hidden') : 'w-80',
          'h-full overflow-y-auto transition-all duration-300',
          'flex flex-col',
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chats</h2>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Chat List Content */}
        <div className="flex-1 overflow-y-auto">
          <UserDiscovery
            currentUser={user}
            onUserSelect={handleUserSelect}
            isMobileView={isMobileView}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        'flex-1 flex flex-col h-full',
        isMobileView && !showChatList ? 'flex' : 'hidden lg:flex'
      )}>
        {activeChat && chatPartner ? (
   <ActiveChat 
   chatRoom={activeChat} 
   chatPartner={chatPartner}  // Changed from partner to chatPartner
   currentUser={user}  // Make sure you have access to the current user
   onBack={() => setShowChatList(true)}
   onEndChat={() => {
     setActiveChat(null);
     setShowChatList(true);
   }}
   isMobileView={isMobileView}
 />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-6 max-w-md">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chat selected</h3>
              <p className="text-gray-500 mb-4">Select a chat to start messaging</p>
              {isMobileView && (
                <button
                  onClick={() => setShowChatList(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Back to chats
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;