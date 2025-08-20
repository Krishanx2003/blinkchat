'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MessageCircle, Filter, FileText, User, Settings, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

const navigation: NavigationItem[] = [
  { name: 'Chats', href: '/chat', icon: MessageCircle, count: 5 },
  { name: 'Filtered', href: '/filtered-chat', icon: Filter, count: 2 },
  { name: 'Stories', href: '/blog', icon: FileText },
  { name: 'Profile', href: '/profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark')
      setIsDark(isDarkMode)
    }
  }, [])

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
    setIsDark(!isDark)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'flex flex-col h-screen transition-all duration-300 ease-in-out z-50',
          isDark ? 'bg-[#1F1F1F] border-[#3F3F3F]' : 'bg-white border-[#E5E7EB]',
          isCollapsed ? 'w-16' : 'w-64',
          'fixed lg:relative',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'border-r shadow-sm'
        )}
        style={{ fontFamily: '"Inter", sans-serif' }} // Match chat UI font
      >
        {/* Logo Section */}
        <div
          className={cn(
            'p-4 border-b',
            isDark ? 'border-[#3F3F3F] bg-[#1F1F1F]/90' : 'border-[#E5E7EB] bg-white/90'
          )}
        >
          <div className="flex items-center gap-3">
            <Image
              src="/blinkchat.jpg"
              alt="TingleTalk Logo"
              width={36}
              height={36}
              className={cn(
                'rounded-lg',
                isCollapsed ? 'w-8 h-8' : 'w-9 h-9'
              )}
              priority
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <h1
                  className={cn(
                    'text-lg font-semibold',
                    isDark ? 'text-white' : 'text-[#111827]'
                  )}
                >
                  TingleTalk
                </h1>
                <p
                  className={cn(
                    'text-xs font-medium',
                    isDark ? 'text-[#9CA3AF]' : 'text-[#6B7280]'
                  )}
                >
                  Anonymous & Free
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                  isActive
                    ? cn(
                        isDark
                          ? 'bg-[#DB2777]/10 text-[#DB2777]'
                          : 'bg-[#FCE7F3] text-[#DB2777]'
                      )
                    : cn(
                        isDark
                          ? 'text-[#D1D5DB] hover:bg-[#2D2D2D] hover:text-white'
                          : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                      ),
                  isCollapsed ? 'justify-center px-2' : ''
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon
                  className={cn(
                    'w-5 h-5',
                    isActive
                      ? 'text-[#DB2777]'
                      : isDark
                      ? 'text-[#9CA3AF] group-hover:text-white'
                      : 'text-[#6B7280] group-hover:text-[#111827]'
                  )}
                />
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-[#DB2777]' : ''
                      )}
                    >
                      {item.name}
                    </span>
                    {item.count !== undefined && (
                      <div
                        className={cn(
                          'px-2 py-0.5 text-xs font-semibold rounded-full',
                          isActive
                            ? 'bg-[#DB2777]/20 text-[#DB2777]'
                            : isDark
                            ? 'bg-[#3F3F3F] text-[#9CA3AF]'
                            : 'bg-[#E5E7EB] text-[#6B7280]'
                        )}
                      >
                        {item.count}
                      </div>
                    )}
                  </div>
                )}
                {isCollapsed && (
                  <div
                    className={cn(
                      'absolute left-full ml-2 px-2 py-1 text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200',
                      isDark
                        ? 'bg-[#2D2D2D] text-white border-[#3F3F3F]'
                        : 'bg-white text-[#111827] border-[#E5E7EB]'
                    )}
                  >
                    {item.name}
                    {item.count !== undefined && (
                      <span
                        className={cn(
                          'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                          isDark ? 'bg-[#3F3F3F]' : 'bg-[#E5E7EB]'
                        )}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div
          className={cn(
            'p-3 border-t',
            isDark ? 'border-[#3F3F3F] bg-[#1F1F1F]/90' : 'border-[#E5E7EB] bg-white/90'
          )}
        >
          <div className={cn('flex items-center gap-2', isCollapsed ? 'flex-col space-y-2' : '')}>
            <button
              onClick={toggleTheme}
              className={cn(
                'flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 flex-1',
                isDark
                  ? 'text-[#D1D5DB] hover:bg-[#2D2D2D] hover:text-white'
                  : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]',
                isCollapsed ? 'w-full' : ''
              )}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              {!isCollapsed && (
                <span className="text-sm font-medium">
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </button>
            <Link
              href="/settings"
              className={cn(
                'flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
                isDark
                  ? 'text-[#D1D5DB] hover:bg-[#2D2D2D] hover:text-white'
                  : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]',
                isCollapsed ? 'w-full' : ''
              )}
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
              {!isCollapsed && (
                <span className="text-sm font-medium">Settings</span>
              )}
            </Link>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                'hidden lg:flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200',
                isDark
                  ? 'text-[#D1D5DB] hover:bg-[#2D2D2D] hover:text-white'
                  : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]',
                isCollapsed ? 'w-full' : ''
              )}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={cn(
          'fixed top-3 left-3 z-50 lg:hidden p-2 rounded-lg transition-all duration-200',
          isDark
            ? 'bg-[#1F1F1F] text-white border-[#3F3F3F]'
            : 'bg-white text-[#111827] border-[#E5E7EB]'
        )}
        aria-label="Toggle menu"
      >
        <div className="relative w-5 h-5">
          <span
            className={cn(
              'absolute top-0 left-0 w-full h-0.5 rounded-full transition-all duration-200',
              isDark ? 'bg-white' : 'bg-[#111827]',
              isMobileOpen ? 'rotate-45 top-2' : ''
            )}
          />
          <span
            className={cn(
              'absolute top-2 left-0 w-full h-0.5 rounded-full transition-all duration-200',
              isDark ? 'bg-white' : 'bg-[#111827]',
              isMobileOpen ? 'opacity-0' : ''
            )}
          />
          <span
            className={cn(
              'absolute top-4 left-0 w-full h-0.5 rounded-full transition-all duration-200',
              isDark ? 'bg-white' : 'bg-[#111827]',
              isMobileOpen ? '-rotate-45 top-2' : ''
            )}
          />
        </div>
      </button>
    </>
  )
}