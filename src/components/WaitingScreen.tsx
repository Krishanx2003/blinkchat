
import { Loader2, Users } from 'lucide-react';

const WaitingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Animation Container */}
        <div className="mb-8 animate-pulse">
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
              <Users className="w-16 h-16 text-white" />
            </div>
            {/* Rotating loader */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-40 h-40 text-white/30 animate-spin" />
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Finding your match...
          </h2>
          <p className="text-white/70 text-lg mb-6">
            We're connecting you with someone interesting
          </p>
          
          {/* Loading dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 text-white/60">
          <p className="text-sm">
            💡 Tip: Be kind and respectful for the best experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingScreen;