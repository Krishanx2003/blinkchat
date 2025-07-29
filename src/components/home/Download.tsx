import React from 'react';
import { Download as DownloadIcon, Globe, Smartphone, Tablet } from 'lucide-react';

const Download = () => {
  return (
    <section id="download" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4 sm:mb-6 px-4">
            Get Started with <span className="text-[#FFFC00]">TingleTalk</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Choose your preferred way to start anonymous chatting. Available on all your devices.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - CTA Buttons */}
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-6 px-4 lg:px-0">
                Start Chatting Right Now
              </h3>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4 lg:px-0">
                No downloads required. Jump into conversations instantly in your browser or get our mobile app for the best experience.
              </p>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-[#FFFC00] text-black px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg hover:bg-[#FFFC00]/90 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center space-x-3">
                <Globe className="w-6 h-6" />
                <span>Launch Web App</span>
              </button>
              
              <button className="w-full bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center space-x-3">
                <span>Sign Up Free</span>
              </button>
            </div>

            {/* Coming Soon */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200 mx-4 lg:mx-0">
              <h4 className="text-lg sm:text-xl font-bold text-black mb-4">Coming Soon</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 sm:space-x-3 text-gray-600">
                  <Smartphone className="w-5 h-5" />
                  <span className="text-sm sm:text-base">iOS App</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 text-gray-600">
                  <Smartphone className="w-5 h-5" />
                  <span className="text-sm sm:text-base">Android App</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Device Mockups */}
          <div className="relative mt-8 lg:mt-0">
            <div className="flex justify-center items-center space-x-4 sm:space-x-8">
              {/* Tablet Mockup */}
              <div className="relative transform rotate-12 hover:rotate-6 transition-transform duration-300 hidden sm:block">
                <div className="bg-black rounded-2xl p-2 shadow-2xl">
                  <div className="bg-white rounded-xl w-32 sm:w-48 h-40 sm:h-64 overflow-hidden">
                    <div className="bg-gradient-to-br from-[#FFFC00] to-[#FFB800] h-full p-4">
                      <div className="bg-white rounded-lg h-full flex flex-col justify-center items-center">
                        <Tablet className="w-8 sm:w-12 h-8 sm:h-12 text-[#FFFC00] mb-2 sm:mb-4" />
                        <div className="text-center">
                          <div className="text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">TingleTalk</div>
                          <div className="text-xs text-gray-600">Web Version</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Mockup */}
              <div className="relative transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                <div className="bg-black rounded-3xl p-2 shadow-2xl">
                  <div className="bg-white rounded-2xl w-32 sm:w-40 h-64 sm:h-80 overflow-hidden">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 h-full p-4">
                      <div className="bg-white rounded-lg h-full flex flex-col justify-center items-center">
                        <Smartphone className="w-8 sm:w-12 h-8 sm:h-12 text-purple-500 mb-2 sm:mb-4" />
                        <div className="text-center">
                          <div className="text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">TingleTalk</div>
                          <div className="text-xs text-gray-600">Mobile App</div>
                          <div className="text-xs text-gray-400 mt-1 sm:mt-2">Coming Soon</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#FFFC00] rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 -left-8 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <div className="absolute top-1/4 -right-8 w-4 h-4 bg-white rounded-full animate-bounce shadow-lg"></div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 sm:mt-20 bg-gray-50 rounded-3xl p-6 sm:p-8 md:p-12 mx-4 sm:mx-0">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">
              Trusted by Users Worldwide
            </h3>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              Join a community that values privacy, authenticity, and genuine connections
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <DownloadIcon className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-black mb-2">Easy Setup</h4>
              <p className="text-sm sm:text-base text-gray-600 px-2">Get started in seconds with no complex registration</p>
            </div>
            
            <div className="group">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-black mb-2">Global Reach</h4>
              <p className="text-sm sm:text-base text-gray-600 px-2">Connect with people from over 180 countries</p>
            </div>
            
            <div className="group">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-black mb-2">Multi-Platform</h4>
              <p className="text-sm sm:text-base text-gray-600 px-2">Use on web, mobile, or tablet - your choice</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Download; 