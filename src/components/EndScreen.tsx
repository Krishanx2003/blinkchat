
import { Heart, MessageCircle, RefreshCw } from 'lucide-react';

interface EndScreenProps {
  onNewChat: () => void;
}

const EndScreen = ({ onNewChat }: EndScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mb-8 animate-fade-in">
          <div className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-pink-300" />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl animate-scale-in">
          <h2 className="text-3xl font-bold text-white mb-4">
            Chat Ended
          </h2>
          <p className="text-white/70 text-lg mb-6">
            Hope you had a great conversation! ✨
          </p>
          
          {/* Stats/Info */}
          <div className="bg-white/10 rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-center space-x-6 text-white/80">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-300">15:00</div>
                <div className="text-xs">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-violet-300">∞</div>
                <div className="text-xs">Memories</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={onNewChat}
              className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Start New Chat</span>
            </button>
            
            <div className="text-white/60 text-sm">
              <p>Every conversation is unique ✨</p>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-white/60">
          <p className="text-sm">
            Thanks for using QuickChat! 💜
          </p>
        </div>
      </div>
    </div>
  );
};

export default EndScreen;