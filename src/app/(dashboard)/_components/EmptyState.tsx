import React from 'react';
import { MessageCircle, Users, Zap } from 'lucide-react';

interface EmptyStateProps {
  isDark: boolean;
}

export default function EmptyState({ isDark }: EmptyStateProps) {
  return (
    <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="text-center max-w-md px-6">
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center animate-bounce">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
            <Users className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Welcome to BlinkChat
        </h2>
        
        <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
          Connect with people around the world anonymously. 
          Select someone from the discovery panel to start chatting!
        </p>
        
        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Anonymous & Safe</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No personal info required</p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Instant Connection</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Start chatting immediately</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
