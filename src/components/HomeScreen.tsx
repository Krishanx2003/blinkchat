"use client";

import { MessageCircle, Zap, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/client';

interface HomeScreenProps {
  onStartChat: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartChat }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        checkProfileCompletion(user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        router.push('/auth');
      } else {
        setUser(session.user);
        checkProfileCompletion(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        setProfile(profileData);
        if (!profileData.profile_completed) {
          router.push('/profile-setup');
        }
      } else {
        // Profile doesn't exist, redirect to setup
        router.push('/profile-setup');
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
      router.push('/profile-setup');
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Error signing out');
      } else {
        toast.success('Signed out successfully');
        router.push('/auth');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  if (!user || !profile || !profile.profile_completed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-white text-center">
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Sign Out Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>

        {/* App Logo/Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            QuickChat
          </h1>
          <p className="text-white/80 text-lg">
            15 minutes. Anonymous. Real.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl animate-scale-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">
              Welcome back, {profile.name}!
            </h2>
            <p className="text-white/70">
              Get matched with someone new for a 15-minute anonymous conversation
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center text-white/80">
              <Zap className="w-5 h-5 mr-3 text-yellow-300" />
              <span>Instant anonymous matching</span>
            </div>
            <div className="flex items-center text-white/80">
              <MessageCircle className="w-5 h-5 mr-3 text-blue-300" />
              <span>Real-time messaging</span>
            </div>
            <div className="flex items-center text-white/80">
              <div className="w-5 h-5 mr-3 rounded-full bg-green-400 flex items-center justify-center">
                <span className="text-xs font-bold text-white">15</span>
              </div>
              <span>Exactly 15 minutes per chat</span>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={onStartChat}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span className="text-lg">Start Chat</span>
          </button>
        </div>

        {/* User Info */}
        <div className="text-center mt-6 text-white/60">
          <p className="text-sm">
            Signed in as: @{profile.username}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-white/60">
          <p className="text-sm">
            Safe • Anonymous • Time-limited
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;