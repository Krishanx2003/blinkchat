"use client";

import { useState, useEffect } from 'react';
import HomeScreen from '@/components/HomeScreen';
// import WaitingScreen from '@/components/WaitingScreen';
// import ChatScreen from '@/components/ChatScreen';
// import EndScreen from '@/components/EndScreen';

type AppState = 'home' | 'waiting' | 'chat' | 'ended';

const HomePage: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  const handleStartChat = () => {
    setCurrentState('waiting');
    // Simulate finding a match after 2-3 seconds
    setTimeout(() => {
      setCurrentState('chat');
      setTimeLeft(15 * 60); // Reset timer when chat starts
    }, 2500);
  };

  const handleEndChat = () => {
    setCurrentState('ended');
  };

  const handleNewChat = () => {
    setCurrentState('home');
    setTimeLeft(15 * 60);
  };

  // Timer countdown effect
  useEffect(() => {
    if (currentState === 'chat' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCurrentState('ended');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentState, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800">
      {currentState === 'home' && <HomeScreen onStartChat={handleStartChat} />}
      {/* {currentState === 'waiting' && <WaitingScreen />}
      {currentState === 'chat' && (
        <ChatScreen 
          timeLeft={formatTime(timeLeft)} 
          onEndChat={handleEndChat}
        />
      )}
      {currentState === 'ended' && <EndScreen onNewChat={handleNewChat} />} */}
    </div>
  );
};

export default HomePage;