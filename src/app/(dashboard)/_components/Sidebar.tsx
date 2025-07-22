// Sidebar.tsx
"use client";

import React from 'react';
import { User, MessageCircle, Globe, FileText, X } from 'lucide-react';

interface SidebarProps {
  activeSection: 'profile' | 'private' | 'global' | 'blogs';
  onSectionChange: (section: 'profile' | 'private' | 'global' | 'blogs') => void;
  onClose?: () => void; // For mobile overlay
  isMobile?: boolean;
}

export default function Sidebar({ 
  activeSection, 
  onSectionChange, 
  onClose, 
  isMobile = false 
}: SidebarProps) {
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

  const handleSectionClick = (section: typeof activeSection) => {
    onSectionChange(section);
    // Auto-close on mobile after selection
    if (isMobile && onClose) {
      onClose();
    }
  };

  if (isMobile) {
    // Mobile sidebar (overlay)
    return (
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-50 flex flex-col">
        {/* Mobile header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Mobile navigation items */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sections.map(({ id, icon: Icon, title, ariaLabel }) => (
              <button
                key={id}
                onClick={() => handleSectionClick(id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 text-left
                  ${activeSection === id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }
                `}
                aria-label={ariaLabel}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{title}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  // Desktop sidebar (narrow with icons)
  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-6 z-40">
      {sections.map(({ id, icon: Icon, title, ariaLabel }) => (
        <div key={id} className="relative group">
          <button
            onClick={() => handleSectionClick(id)}
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

