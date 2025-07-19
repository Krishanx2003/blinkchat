import React, { useState, useEffect } from 'react';
import { Menu, X, Eye, LogOut } from 'lucide-react';
import { supabase } from '@/lib/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Eye className="h-8 w-8 text-[#FFFC00]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFFC00] rounded-full animate-pulse"></div>
            </div>
            <span className="text-2xl font-bold text-black">BlinkChat</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-[#FFFC00] transition-colors font-medium">
              Features
            </a>
            <a href="#about" className="text-gray-700 hover:text-[#FFFC00] transition-colors font-medium">
              About
            </a>
            <a href="#download" className="text-gray-700 hover:text-[#FFFC00] transition-colors font-medium">
              Download
            </a>
            <a href="#contact" className="text-gray-700 hover:text-[#FFFC00] transition-colors font-medium">
              Contact
            </a>
            {!user ? (
              <a href="/auth" className="text-gray-700 hover:text-[#FFFC00] transition-colors font-medium">
                Login / Sign Up
              </a>
            ) : null}
          </nav>

          {/* Sign Up/Logout Button */}
          <div className="hidden md:block">
            {!user ? (
              <button className="bg-[#FFFC00] text-black px-6 py-2 rounded-full font-semibold hover:bg-[#FFFC00]/90 transform hover:scale-105 transition-all duration-200 shadow-lg" onClick={() => router.push('/auth')}>
                Sign Up
              </button>
            ) : (
              <button className="flex items-center bg-[#FFFC00] text-black px-6 py-2 rounded-full font-semibold hover:bg-[#FFFC00]/90 transform hover:scale-105 transition-all duration-200 shadow-lg" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t z-50">
            <nav className="flex flex-col space-y-4 p-4">
              <a href="#features" className="text-gray-700 hover:text-[#FFFC00] transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                Features
              </a>
              <a href="#about" className="text-gray-700 hover:text-[#FFFC00] transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                About
              </a>
              <a href="#download" className="text-gray-700 hover:text-[#FFFC00] transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                Download
              </a>
              <a href="#contact" className="text-gray-700 hover:text-[#FFFC00] transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                Contact
              </a>
              {!user ? (
                <a href="/auth" className="text-gray-700 hover:text-[#FFFC00] transition-colors font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                  Login / Sign Up
                </a>
              ) : (
                <button className="flex items-center bg-[#FFFC00] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#FFFC00]/90 transition-all duration-200 shadow-lg w-full mt-2" onClick={() => { setIsMenuOpen(false); handleSignOut(); }}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 