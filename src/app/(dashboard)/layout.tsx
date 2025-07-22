// DashboardLayout.tsx
"use client";

import React, { useState, useEffect } from "react";

import { User, Globe, FileText, MessageCircle } from 'lucide-react';
import Sidebar from "./_components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState<"profile" | "private" | "global" | "blogs">("profile");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Check screen size and handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 1024; // Using lg breakpoint (1024px)
      setIsMobileView(isMobile);
      if (!isMobile) setShowMobileSidebar(false); // Hide mobile sidebar on desktop
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle section changes
  const handleSectionChange = (section: "profile" | "private" | "global" | "blogs") => {
    setActiveSection(section);
    if (isMobileView) {
      setShowMobileSidebar(false); // Hide sidebar after selection on mobile
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar - Always visible on desktop */}
      {!isMobileView && (
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isMobile={false}
        />
      )}

      {/* Mobile Sidebar - Overlay on mobile */}
      {isMobileView && showMobileSidebar && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMobileSidebar(false)}
          />
          
          {/* Sidebar */}
          <Sidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            onClose={() => setShowMobileSidebar(false)}
            isMobile={true}
          />
        </>
      )}

      {/* Main Content */}
      <main className={`
        flex-1 transition-all duration-300
        ${!isMobileView ? 'ml-16 p-4 lg:p-8' : 'p-4 pb-20'}
      `}>
        {/* Mobile Header - Show menu button and current section */}
        {isMobileView && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-sm border hover:bg-gray-50"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1">
                <div className="w-full h-0.5 bg-gray-600 rounded"></div>
                <div className="w-full h-0.5 bg-gray-600 rounded"></div>
                <div className="w-full h-0.5 bg-gray-600 rounded"></div>
              </div>
              <span className="text-sm font-medium capitalize">{activeSection}</span>
            </button>
          </div>
        )}

        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobileView && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30">
          <div className="flex justify-around">
            {[
              { id: 'profile' as const, icon: User, title: 'Profile' },
              { id: 'private' as const, icon: MessageCircle, title: 'Chat' },
              { id: 'global' as const, icon: Globe, title: 'Global' },
              { id: 'blogs' as const, icon: FileText, title: 'Blogs' }
            ].map(({ id, icon: Icon, title }) => (
              <button
                key={id}
                onClick={() => handleSectionChange(id)}
                className={`
                  flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200
                  ${activeSection === id
                    ? 'text-blue-500 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-500'
                  }
                `}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}