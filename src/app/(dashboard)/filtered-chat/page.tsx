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
  const router = useRouter();

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
    } catch (error) {
      console.error('Error creating/finding chat room:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleBackToDiscovery = () => {
    setActiveChat(null);
    setChatPartner(null);
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
      toast.success('Chat ended');
    } catch (error) {
      console.error('Error ending chat:', error);
      toast.error('Failed to end chat');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800">
        <div className="text-white text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800">
      <div className="max-w-6xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {activeChat ? `Chat with ${chatPartner?.name}` : 'Filtered Chat'}
                </h1>
                <p className="text-white/70 text-sm">
                  {activeChat ? 'Private conversation' : 'Find and chat with people'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {activeChat && chatPartner ? (
            <ActiveChat
              chatRoom={activeChat}
              chatPartner={chatPartner}
              currentUser={user}
              onBack={handleBackToDiscovery}
              onEndChat={handleEndChat}
            />
          ) : (
            <UserDiscovery
              currentUser={user}
              onUserSelect={handleUserSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;