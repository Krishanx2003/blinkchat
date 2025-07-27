'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MessageCircle, Filter, FileText, User, Settings, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

const navigation: NavigationItem[] = [
  {
    name: 'Chats',
    href: '/chat',
    icon: MessageCircle,
    count: 5,
  },
  {
    name: 'Filtered',
    href: '/filtered-chat',
    icon: Filter,
    count: 2,
  },
  {
    name: 'Stories',
    href: '/blog',
    icon: FileText,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Check for dark mode preference
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
    <div className={cn(
      'flex flex-col h-full transition-all duration-300',
      isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
      isCollapsed ? 'w-20' : 'w-72',
      'border-r'
    )}>
      {/* Logo */}
      <div className={cn("p-4 lg:p-6 border-b", isDark ? 'border-gray-800' : 'border-gray-200')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className={cn("text-xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>
                BlinkChat
              </h1>
              <p className={cn("text-sm", isDark ? 'text-gray-400' : 'text-gray-500')}>
                Anonymous & Free
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 lg:p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : isDark
                    ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-white' : '')} />
                {!isCollapsed && (
                  <>
                    <span className="font-medium">{item.name}</span>
                    {item.count !== undefined && (
                      <span className={cn(
                        'ml-auto px-2 py-1 text-xs rounded-full',
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : isDark
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-600'
                      )}>
                        {item.count}
                      </span>
                    )}
                  </>
                )}
                
                {isCollapsed && (
                  <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className={cn("p-2 lg:p-4 border-t", isDark ? 'border-gray-800' : 'border-gray-200')}>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl transition-all duration-200',
              isDark
                ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
            )}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!isCollapsed && (
              <span className="font-medium">
                {isDark ? 'Light' : 'Dark'}
              </span>
            )}
          </button>
          
          <Link 
            href="/settings"
            className={cn(
              'flex items-center justify-center p-3 rounded-xl transition-all duration-200',
              isDark
                ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
            )}
          >
            <Settings className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'hidden lg:flex items-center justify-center p-3 rounded-xl transition-all duration-200',
              isDark
                ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
            )}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>
    </div>
  )
}