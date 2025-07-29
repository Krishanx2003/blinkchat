import React from 'react';
import { Eye, Heart, Instagram, Twitter, Music } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative">
                <Eye className="h-8 w-8 text-[#FFFC00]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFFC00] rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl sm:text-2xl font-bold">TingleTalk</span>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-6 max-w-md">
              The anonymous chat platform where authentic conversations happen. 
              Connect, share, and discover without the pressure of social media personas.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FFFC00] hover:text-black transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FFFC00] hover:text-black transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FFFC00] hover:text-black transition-colors">
                <Music className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-sm sm:text-base text-gray-400 hover:text-[#FFFC00] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm sm:text-base text-gray-400 hover:text-[#FFFC00] transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#download" className="text-sm sm:text-base text-gray-400 hover:text-[#FFFC00] transition-colors">
                  Download
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-gray-400 hover:text-[#FFFC00] transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm sm:text-base text-gray-400 hover:text-[#FFFC00] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-gray-400 hover:text-[#FFFC00] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-gray-400 hover:text-[#FFFC00] transition-colors">
                  Community Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-gray-400 hover:text-[#FFFC00] transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm sm:text-base text-gray-400 mb-4 md:mb-0 text-center md:text-left">
              © 2025 TingleTalk. All rights reserved.
            </div>
          
          </div>
        </div>

        {/* Fun Element */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-gray-800 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">100K+ users online now</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 