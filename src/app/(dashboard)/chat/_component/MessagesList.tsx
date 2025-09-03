"use client"

import React, { useRef, useEffect } from "react"
import { Users } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { MessageBubble } from "./MessageBubble"
import type { User } from "@supabase/supabase-js"

interface Message {
  id: string
  content: string
  created_at: string
  user_name: string
  username: string
}

interface MessagesListProps {
  messages: Message[]
  user: User
  isLoading: boolean
}

export const MessagesList: React.FC<MessagesListProps> = ({ messages, user, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm dark:bg-gray-900">
          <CardContent className="p-8 text-center">
            <div className="relative mx-auto mb-6 w-16 h-16">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-chart-1 rounded-full animate-spin-reverse"></div>
            </div>
            <p className="text-white dark:text-white font-semibold">Loading messages...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center h-96"
      >
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm dark:bg-gray-900 max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Avatar className="h-24 w-24 mx-auto mb-6 rounded-2xl">
              <AvatarFallback className="bg-muted rounded-2xl">
                <Users className="w-12 h-12 text-white dark:text-white" />
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold text-white dark:text-white mb-4">Start the conversation</h3>
            <p className="text-gray-400 dark:text-gray-400 font-medium leading-relaxed text-sm">
              All chats vanish after 1 hour — encrypted & anonymous.
              <br />
              <span className="text-xs opacity-75">Share your thoughts freely.</span>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <ScrollArea className="flex-1 h-full relative z-10">
      <div className="px-3 sm:px-6 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const isOwnMessage = user && message.username === user.email?.split("@")[0]
              const showAvatar = index === 0 || messages[index - 1].username !== message.username

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                  showAvatar={showAvatar}
                  index={index}
                />
              )
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>
    </ScrollArea>
  )
}