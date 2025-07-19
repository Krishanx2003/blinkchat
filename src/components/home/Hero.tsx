import React from 'react';
import { MessageCircle, Sparkles, Users } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFFC00] via-[#FFFC00]/80 to-[#FFB800]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-white rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-white rounded-full animate-bounce opacity-40"></div>
        <div className="absolute bottom-32 left-20 w-8 h-8 bg-white rounded-full animate-pulse opacity-30"></div>
        <MessageCircle className="absolute top-32 right-40 w-8 h-8 text-white animate-bounce opacity-50" />
        <Sparkles className="absolute bottom-40 right-10 w-6 h-6 text-white animate-pulse opacity-60" />
        <Users className="absolute top-60 left-40 w-10 h-10 text-white animate-bounce opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-4 sm:mb-6 leading-tight">
              Chat Freely.
              <br />
              <span className="text-white">Anonymously.</span>
              <br />
              <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                Instantly.
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-800 mb-6 sm:mb-8 max-w-2xl leading-relaxed px-4 lg:px-0">
              Join global and local conversations without revealing your identity. 
              BlinkChat keeps it fun and safe.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-2xl">
                Get Started
              </button>
              <button className="bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl border-2 border-black">
                Try in Browser
              </button>
            </div>
          </div>

          {/* Right Content - Mock App Interface */}
          <div className="relative">
            <div className="relative z-10 max-w-xs sm:max-w-sm mx-auto mt-8 lg:mt-0">
              {/* Phone Frame */}
              <div className="bg-black rounded-[3rem] p-2 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="bg-black h-8 flex items-center justify-center">
                    <div className="w-20 h-1 bg-white rounded-full"></div>
                  </div>
                  
                  {/* App Content */}
                  <div className="p-4 sm:p-6 h-[500px] sm:h-[600px] bg-gradient-to-br from-purple-100 to-pink-100">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-[#FFFC00] rounded-full flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-bold text-base sm:text-lg">BlinkChat</span>
                      </div>
                      <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-bl-md p-2 sm:p-3 max-w-[200px] sm:max-w-xs shadow-sm">
                          <p className="text-xs sm:text-sm">Hey! Anyone up for a fun chat? 😊</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <div className="bg-[#FFFC00] rounded-2xl rounded-br-md p-2 sm:p-3 max-w-[200px] sm:max-w-xs shadow-sm">
                          <p className="text-xs sm:text-sm">Always! Love the anonymity here 🎭</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-start">
                        <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-2xl rounded-bl-md p-2 sm:p-3 max-w-[200px] sm:max-w-xs shadow-sm">
                          <p className="text-xs sm:text-sm">Same! No pressure to be perfect ✨</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl rounded-br-md p-2 sm:p-3 max-w-[200px] sm:max-w-xs shadow-sm">
                          <p className="text-xs sm:text-sm">Exactly! Just real conversations 💬</p>
                        </div>
                      </div>
                    </div>

                    {/* Floating Emojis */}
                    <div className="absolute bottom-16 sm:bottom-20 right-4 sm:right-6 text-xl sm:text-2xl animate-bounce">😄</div>
                    <div className="absolute bottom-24 sm:bottom-32 left-4 sm:left-6 text-xl sm:text-2xl animate-pulse">🎉</div>
                    <div className="absolute bottom-32 sm:bottom-40 right-8 sm:right-12 text-xl sm:text-2xl animate-bounce">💭</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements around Phone */}
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full animate-pulse opacity-80"></div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce opacity-70"></div>
            <div className="absolute top-1/2 -left-8 w-8 h-8 bg-white rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute top-1/3 -right-8 w-6 h-6 bg-[#FFFC00] rounded-full animate-bounce shadow-lg"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 