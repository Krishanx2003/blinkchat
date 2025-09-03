// chat/_components/ChatHeader.tsx
"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Hash, MoreVertical, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { User } from "@supabase/supabase-js"

interface ChatHeaderProps {
  user: User
  activeUserCount: number
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ user, activeUserCount }) => {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="rounded-xl h-12 w-12 hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12 rounded-xl">
                  <AvatarFallback className="bg-primary text-primary-foreground rounded-xl">
                    <Hash className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 w-12 h-12 rounded-xl bg-primary/40 animate-ping"></div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">Global Chat</h1>
                
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1.5"></div>
                    {activeUserCount > 0 ? `${activeUserCount} active` : "Join now"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Signed in as</p>
              <p className="text-sm font-semibold text-foreground truncate max-w-32">
                {user.user_metadata?.name || user.email?.split("@")[0]}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}