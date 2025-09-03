// components/home/Hero.tsx
"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { supabase } from "@/lib/client";
import { Users, MessageCircle, Globe } from "lucide-react";

import chatLogo from "@/assets/chat-logo.png";
import { ChatBubble } from "../ui/chat-bubble";
import { AuthDialog } from "../dialogs/AuthDialog";
import { ProfileSetupDialog } from "../dialogs/ProfileSetupDialog";

import Image from "next/image";

export const HeroSection = () => {
  const router = useRouter();
  
  // Dialog states
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    // Check current auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const checkUserStatusAndRedirect = async (user: User) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("user_id", user.id)
        .single();

      if (profile?.profile_completed) {
        // User has completed profile, redirect directly to chat
        toast.success("Welcome back! Redirecting to chat...");
        setTimeout(() => {
          router.push('/chat');
        }, 100);
      } else {
        // User needs to complete profile
        setIsProfileDialogOpen(true);
      }
    } catch (error) {
      // Profile doesn't exist, user needs to set it up
      setIsProfileDialogOpen(true);
    }
  };

  const handleStartMatching = async () => {
    if (currentUser) {
      // User is already logged in, check profile status
      setIsCheckingAuth(true);
      await checkUserStatusAndRedirect(currentUser);
      setIsCheckingAuth(false);
    } else {
      // User is not logged in, show auth dialog
      setIsAuthDialogOpen(true);
    }
  };

  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    setIsAuthDialogOpen(false);
    
    // Check if user needs to complete profile
    setIsCheckingAuth(true);
    await checkUserStatusAndRedirect(user);
    setIsCheckingAuth(false);
  };

  const handleProfileComplete = () => {
    setIsProfileDialogOpen(false);
    toast.success("Welcome to TingleTalk! Redirecting to chat...");
    // Redirect to chat page after profile completion
    setTimeout(() => {
      router.push('/chat');
    }, 150);
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20">
        {/* Enhanced background effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          
          {/* Animated gradient orbs */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
          
          {/* Floating chat bubbles with improved animations */}
          <ChatBubble 
            className="absolute top-20 left-10 w-16 h-16 opacity-30 hover:opacity-60 transition-opacity duration-500" 
            animate 
          >
            <i className="fas fa-comment text-2xl text-orange-500"></i>
          </ChatBubble>
          <ChatBubble 
            className="absolute top-32 right-20 w-12 h-12 opacity-25 hover:opacity-50 transition-opacity duration-500" 
            animate 
          >
            <i className="fas fa-heart text-lg text-pink-500"></i>
          </ChatBubble>
          <ChatBubble 
            className="absolute bottom-40 left-20 w-20 h-20 opacity-20 hover:opacity-40 transition-opacity duration-500" 
            animate 
          >
            <i className="fas fa-users text-2xl text-blue-500"></i>
          </ChatBubble>
          <ChatBubble 
            className="absolute bottom-20 right-10 w-14 h-14 opacity-35 hover:opacity-60 transition-opacity duration-500" 
            animate 
          >
            <i className="fas fa-globe text-xl text-purple-500"></i>
          </ChatBubble>
          <ChatBubble 
            className="absolute top-1/2 left-5 w-10 h-10 opacity-20 hover:opacity-40 transition-opacity duration-500" 
            animate 
          >
            <i className="fas fa-star text-sm text-yellow-500"></i>
          </ChatBubble>
          <ChatBubble 
            className="absolute top-1/3 right-5 w-12 h-12 opacity-25 hover:opacity-45 transition-opacity duration-500" 
            animate 
          >
            <i className="fas fa-bolt text-base text-indigo-500"></i>
          </ChatBubble>
        </div>

        <div className="text-center max-w-6xl mx-auto z-10 space-y-8">
          {/* Enhanced logo section */}
          <div className="mb-12 flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 blur-2xl opacity-50 animate-pulse group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 blur-lg opacity-30 animate-pulse delay-1000"></div>
              <Image
                src={chatLogo} 
                alt="TingleTalk Logo" 
                className="w-32 h-32 md:w-40 md:h-40 animate-float hero-glow rounded-3xl relative z-10 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -inset-2 rounded-3xl border border-gradient-to-r from-orange-400/30 via-pink-400/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
          
          {/* Enhanced title with better typography */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight">
              <span className="inline-block transform hover:scale-105 transition-transform duration-300">Meet Someone</span>
              <br />
              <span className="gradient-text inline-block transform hover:scale-105 transition-transform duration-300 delay-100">New Today</span>
            </h1>
            
            <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground/80 mb-16 max-w-4xl mx-auto leading-relaxed font-medium">
              Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 font-bold">real people</span> around the world through 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 font-bold"> anonymous conversations</span>
            </p>
          </div>
          
          {/* Enhanced buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="relative group overflow-hidden tinder-button text-white border-0 text-xl px-12 py-6 rounded-full hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25"
              onClick={handleStartMatching}
              disabled={isCheckingAuth}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center">
                {isCheckingAuth ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-3"></i>
                    Checking...
                  </>
                ) : (
                  <>
                    <i className="fas fa-heart mr-3 group-hover:animate-pulse"></i>
                    {currentUser ? 'Continue to Chat' : 'Start Matching'}
                  </>
                )}
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="group relative overflow-hidden px-12 py-6 text-xl font-bold border-2 border-primary/50 text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-full hover:scale-105 hover:border-primary shadow-lg hover:shadow-primary/25"
              onClick={() => scrollToSection("how-it-works")}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center">
                <i className="fas fa-play mr-3 group-hover:translate-x-1 transition-transform duration-300"></i>
                See How It Works
              </div>
            </Button>
          </div>
          
          {/* Enhanced feature badges */}
          <div className="mt-20 flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-muted-foreground">
            <div className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <i className="fas fa-shield-alt text-green-600 dark:text-green-400 text-sm"></i>
              </div>
              <span className="font-semibold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">100% Anonymous</span>
            </div>
            
            <div className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <i className="fas fa-bolt text-blue-600 dark:text-blue-400 text-sm"></i>
              </div>
              <span className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Instant Connect</span>
            </div>
            
            <div className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/30 hover:bg-white/70 dark:hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <i className="fas fa-lock text-purple-600 dark:text-purple-400 text-sm"></i>
              </div>
              <span className="font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Secure & Safe</span>
            </div>
          </div>
          
        {/* New stats section */}
 {/* New stats section */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 group-hover:scale-110 transition-transform duration-300">10K+</div>
              <div className="text-sm font-medium text-muted-foreground mt-2">Active Users</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 group-hover:scale-110 transition-transform duration-300">50M+</div>
              <div className="text-sm font-medium text-muted-foreground mt-2">Messages Sent</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500 group-hover:scale-110 transition-transform duration-300">195</div>
              <div className="text-sm font-medium text-muted-foreground mt-2">Countries</div>
            </div>
          </div>
        </div>

      </section>

      {/* Authentication Dialog */}
      <AuthDialog
        open={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Profile Setup Dialog */}
      <ProfileSetupDialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
        user={currentUser}
        onProfileComplete={handleProfileComplete}
      />
    </>
  );
};