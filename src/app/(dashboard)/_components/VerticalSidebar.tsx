"use client";
import React, { useState } from 'react';
import { User, MessageCircle, Globe, FileText } from 'lucide-react';

interface VerticalSidebarProps {
  activeSection: 'profile' | 'private' | 'global' | 'blogs';
  onSectionChange: (section: 'profile' | 'private' | 'global' | 'blogs') => void;
}

function VerticalSidebar({ activeSection, onSectionChange }: VerticalSidebarProps) {
  const sections = [
    {
      id: 'profile' as const,
      icon: User,
      title: 'User Profile',
      ariaLabel: 'Go to user profile'
    },
    {
      id: 'private' as const,
      icon: MessageCircle,
      title: 'Private Chat',
      ariaLabel: 'Go to private chats'
    },
    {
      id: 'global' as const,
      icon: Globe,
      title: 'Global Group Chat',
      ariaLabel: 'Go to global group chat'
    },
    {
      id: 'blogs' as const,
      icon: FileText,
      title: 'Blogs',
      ariaLabel: 'Go to blogs'
    }
  ];

  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-6">
      {sections.map(({ id, icon: Icon, title, ariaLabel }) => (
        <div key={id} className="relative group">
          <button
            onClick={() => onSectionChange(id)}
            className={`
              relative w-12 h-12 rounded-xl flex items-center justify-center
              transition-all duration-200 ease-in-out
              ${activeSection === id
                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
              }
            `}
            title={title}
            aria-label={ariaLabel}
          >
            <Icon className="w-6 h-6" />
            {/* Active indicator */}
            {activeSection === id && (
              <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
            )}
          </button>
          {/* Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            {title}
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<'profile' | 'private' | 'global' | 'blogs'>('profile');

  return (
    <div className="flex min-h-screen">
      <VerticalSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 p-8">
        {activeSection === 'profile' && <div>User Profile Section</div>}
        {activeSection === 'private' && <div>Private Chat Section</div>}
        {activeSection === 'global' && <div>Global Group Chat Section</div>}
        {activeSection === 'blogs' && <div>Blogs Section</div>}
      </main>
    </div>
  );
}