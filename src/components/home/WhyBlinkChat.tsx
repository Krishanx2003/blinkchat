import React from 'react';
import { Shield, UserX, Globe, Filter, Smartphone, Heart } from 'lucide-react';

const WhyBlinkChat = () => {
  const reasons = [
    {
      icon: Shield,
      title: '100% Anonymous',
      description: 'No personal information required. Chat freely without revealing your identity.',
      color: 'bg-gradient-to-r from-green-500 to-teal-600'
    },
    {
      icon: UserX,
      title: 'No Phone Number Required',
      description: 'Jump in instantly without giving away your personal contact information.',
      color: 'bg-gradient-to-r from-purple-500 to-pink-600'
    },
    {
      icon: Globe,
      title: 'Real-Time Global Chat',
      description: 'Connect with people from every corner of the world in real-time.',
      color: 'bg-gradient-to-r from-blue-500 to-purple-600'
    },
    {
      icon: Filter,
      title: 'Chat Safely with Filters',
      description: 'Advanced filtering system to ensure safe and appropriate conversations.',
      color: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    {
      icon: Smartphone,
      title: 'Gen Z–Friendly UI',
      description: 'Designed specifically for Gen Z users with intuitive, modern interface.',
      color: 'bg-gradient-to-r from-pink-500 to-orange-500'
    },
    {
      icon: Heart,
      title: 'Authentic Connections',
      description: 'Make genuine friendships without the pressure of social media personas.',
      color: 'bg-gradient-to-r from-red-500 to-pink-600'
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4 sm:mb-6 px-4">
            Why <span className="bg-gradient-to-r from-[#FFFC00] to-[#FFB800] bg-clip-text text-transparent">TingleTalk</span>?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            We're not just another chat app. We're a movement towards authentic, anonymous connections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-[#FFFC00]/30 overflow-hidden"
            >
              {/* Background Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFFC00]/5 to-[#FFB800]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${reason.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <reason.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-4 group-hover:text-[#FFFC00] transition-colors">
                  {reason.title}
                </h3>
                
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {reason.description}
                </p>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#FFFC00]/10 to-[#FFB800]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 sm:mt-20 bg-white rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl mx-4 sm:mx-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="group">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FFFC00] mb-2 group-hover:scale-110 transition-transform duration-300">
                100K+
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">Active Users</div>
            </div>
            <div className="group">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FFFC00] mb-2 group-hover:scale-110 transition-transform duration-300">
                50M+
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">Messages Sent</div>
            </div>
            <div className="group">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FFFC00] mb-2 group-hover:scale-110 transition-transform duration-300">
                180+
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">Countries</div>
            </div>
            <div className="group">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FFFC00] mb-2 group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">Online Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyBlinkChat; 