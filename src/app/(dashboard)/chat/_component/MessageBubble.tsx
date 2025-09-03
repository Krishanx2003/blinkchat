"use client"

import React from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  created_at: string
  user_name: string
  username: string
}

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
  showAvatar: boolean
  index: number
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar,
  index,
}) => {
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-violet-500",
      "bg-blue-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-cyan-500",
      "bg-teal-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-green-500",
    ]
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: Math.min(index * 0.03, 0.3) }}
      className={cn("flex gap-3 sm:gap-4", isOwnMessage ? "justify-end" : "justify-start")}
    >
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl">
                <AvatarFallback
                  className={cn(
                    "!text-white dark:!text-white font-bold text-sm rounded-xl",
                    getAvatarColor(message.user_name || message.username)
                  )}
                >
                  {(message.user_name || message.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          ) : (
            <div className="w-10 h-10 sm:w-11 sm:h-11" />
          )}
        </div>
      )}
      <div className={cn("flex flex-col max-w-[80%] sm:max-w-lg", isOwnMessage ? "items-end" : "items-start")}>
        {showAvatar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex items-center gap-2 sm:gap-3 mb-2 px-1", isOwnMessage ? "justify-end" : "justify-start")}
          >
            <span className="text-sm font-bold !text-white dark:!text-white">
              {isOwnMessage ? "You" : message.user_name || message.username}
            </span>
            <Badge variant="outline" className="text-xs px-2 py-0.5 !text-gray-400 dark:!text-gray-400">
              {formatTime(message.created_at)}
            </Badge>
          </motion.div>
        )}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={cn(
            "px-4 sm:px-5 py-3 sm:py-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md backdrop-blur-sm",
            isOwnMessage
              ? "bg-primary !text-white dark:!text-white rounded-br-lg"
              : "bg-card border !text-white dark:!text-white rounded-bl-lg"
          )}
        >
          <p className="text-sm sm:text-base leading-relaxed break-words font-medium">{message.content}</p>
        </motion.div>
        {!showAvatar && (
          <Badge
            variant="outline"
            className={cn("text-xs mt-2 px-2 !text-gray-400 dark:!text-gray-400", isOwnMessage ? "self-end" : "self-start")}
          >
            {formatTime(message.created_at)}
          </Badge>
        )}
      </div>
    </motion.div>
  )
}