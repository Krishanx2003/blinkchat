import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      text: "Finally a chat app where I don't need to be someone I'm not. Just real conversations with real people!",
      author: "Anonymous User",
      location: "California, USA",
      rating: 5,
      avatar: "🌟"
    },
    {
      text: "Love the AI chats when I'm bored! It's like having a friend who's always there to talk.",
      author: "Anonymous User",
      location: "London, UK",
      rating: 5,
      avatar: "🎭"
    },
    {
      text: "The anonymity gives me confidence to be myself. Best decision ever joining BlinkChat!",
      author: "Anonymous User",
      location: "Tokyo, Japan",
      rating: 5,
      avatar: "✨"
    },
    {
      text: "Global chats are amazing! I've learned so much about different cultures and made genuine friends.",
      author: "Anonymous User",
      location: "Sydney, Australia",
      rating: 5,
      avatar: "🌍"
    },
    {
      text: "Safe, fun, and addictive in the best way. The filters work perfectly to keep conversations appropriate.",
      author: "Anonymous User",
      location: "Toronto, Canada",
      rating: 5,
      avatar: "🛡️"
    },
    {
      text: "No pressure, no judgment, just pure conversation. This is what social media should be like!",
      author: "Anonymous User",
      location: "Berlin, Germany",
      rating: 5,
      avatar: "💬"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#FFFC00] to-[#FFB800]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4 sm:mb-6 px-4">
            What Our <span className="text-white">Anonymous</span> Users Say
          </h2>
          <p className="text-lg sm:text-xl text-gray-800 max-w-3xl mx-auto px-4">
            Real testimonials from real people who found their voice through BlinkChat
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-8 h-8 text-[#FFFC00] group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Testimonial Text */}
                <p className="text-sm sm:text-base text-gray-700 mb-6 leading-relaxed font-medium">
                  "{testimonial.text}"
                </p>

                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-semibold text-black">{testimonial.author}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{testimonial.location}</div>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FFFC00] text-[#FFFC00]" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-r from-[#FFFC00]/10 to-[#FFB800]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-6 px-4">
            Ready to Share Your Story?
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-gray-800 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of anonymous users who've found their voice on BlinkChat
          </p>
          <button className="bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg">
            Start Your Journey
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 