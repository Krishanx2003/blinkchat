"use client"

import React, { useRef, useEffect } from "react"
import { Send, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface MessageInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  onSendMessage: () => void
  isSending: boolean
}

export const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  onSendMessage,
  isSending,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [newMessage])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <footer className="sticky bottom-0 z-20 bg-background/80 backdrop-blur-xl border-t">
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-end gap-2 sm:gap-3 max-w-4xl mx-auto"
          onSubmit={(e) => {
            e.preventDefault()
            onSendMessage()
          }}
        >
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="min-h-[48px] sm:min-h-[52px] max-h-[120px] resize-none rounded-2xl border-input bg-background/80 backdrop-blur-sm pr-12 sm:pr-14 text-sm sm:text-base text-white dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              rows={1}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-xl text-white dark:text-white"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {isSending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 dark:border-white/30 border-t-white dark:border-t-white rounded-full"
              />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>
        </motion.form>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center mt-2 sm:mt-3"
        >
          <Badge variant="secondary" className="text-xs text-white dark:text-white">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1.5"></div>
            Connected & Encrypted
          </Badge>
        </motion.div>
      </div>
    </footer>
  )
}