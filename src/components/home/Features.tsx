import React from 'react';
import { Globe, Filter, Bot, Shield, Users, Zap } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Globe,
      title: 'Global Chat',
      description: 'Connect with people from around the world in real-time conversations',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: Filter,
      title: 'Filtered Chat',
      description: 'Find your perfect chat partner by age, interests, or location',
      color: 'from-pink-500 to-orange-500'
    },
    {
      icon: Bot,
      title: 'AI Chat Companion',
      description: 'Never feel lonely - chat with our intelligent AI when no one\'s around',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: Shield,
      title: 'Anonymous & Safe',
      description: 'Your privacy is protected with end-to-end encryption and no personal data required',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Users,
      title: 'Group Conversations',
      description: 'Join topic-based group chats or create your own discussion rooms',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Zap,
      title: 'Instant Connect',
      description: 'Jump into conversations instantly without lengthy sign-up processes',
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4 sm:mb-6 px-4">
            Why Choose <span className="text-[#FFFC00]">BlinkChat</span>?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Experience the future of anonymous chatting with features designed for Gen Z
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-[#FFFC00]/30"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-4 group-hover:text-[#FFFC00] transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative element */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-[#FFFC00] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Feature Highlight */}
        <div className="mt-16 sm:mt-20 bg-gradient-to-r from-[#FFFC00] to-[#FFB800] rounded-3xl p-6 sm:p-8 md:p-12 text-center mx-4 sm:mx-0">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-6">
            Join 100K+ Anonymous Chatters
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-gray-800 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Be part of the fastest-growing anonymous chat community where authentic conversations happen every day.
          </p>
          <button className="bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg">
            Start Chatting Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features; 