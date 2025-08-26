"use client"

import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { supabase } from '@/lib/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/auth');
  };

  return (
    <header className="bg-[#5865F2] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Image 
                src="/blinkchat.jpg"
                alt="Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD500] rounded-full animate-pulse"></div>
            </div>
            <span className="text-white font-bold text-2xl">TingleTalk</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white hover:text-gray-200 transition-colors font-medium">
              Features
            </a>
            <a href="#download" className="text-white hover:text-gray-200 transition-colors font-medium">
              Download
            </a>
            <a href="#contact" className="text-white hover:text-gray-200 transition-colors font-medium">
              Contact
            </a>
            {!user ? (
              <a href="/auth" className="text-white hover:text-gray-200 transition-colors font-medium">
                Login
              </a>
            ) : null}
          </nav>

          {/* Desktop Sign Up/Logout Button */}
          <div className="hidden md:block">
            {!user ? (
              <Button 
                className="bg-white text-black hover:bg-gray-100 transition-colors font-medium px-4 py-2 rounded-full"
                onClick={() => router.push('/auth')}
              >
                Sign Up
              </Button>
            ) : (
              <Button 
                className="bg-white text-black hover:bg-gray-100 transition-colors font-medium px-4 py-2 rounded-full flex items-center"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-white hover:text-gray-200 transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
                Features
              </a>
              <a href="#download" className="text-white hover:text-gray-200 transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
                Download
              </a>
              <a href="#contact" className="text-white hover:text-gray-200 transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
                Contact
              </a>
              {!user ? (
                <Button 
                  className="bg-white text-black hover:bg-gray-100 transition-colors font-medium px-4 py-2 rounded-full w-fit"
                  onClick={() => { setIsMenuOpen(false); router.push('/auth'); }}
                >
                  Login / Sign Up
                </Button>
              ) : (
                <Button 
                  className="bg-white text-black hover:bg-gray-100 transition-colors font-medium px-4 py-2 rounded-full w-fit flex items-center"
                  onClick={() => { setIsMenuOpen(false); handleSignOut(); }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;