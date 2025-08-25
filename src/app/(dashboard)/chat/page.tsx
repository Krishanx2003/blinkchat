"use client"

import React, { useState } from "react"
import useAuth from "./_hook/useAuth"
import useMessages from "./_hook/useMessages"
import { LoadingScreen } from "./_component/LoadingScreen"
import { ChatHeader } from "./_component/ChatHeader"
import { MessagesList } from "./_component/MessagesList"
import { MessageInput } from "./_component/MessageInput"

const ChatPage: React.FC = () => {
  const { user } = useAuth()
  const { messages, isLoading, sendMessage } = useMessages(user)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const success = await sendMessage(newMessage)
    
    if (success) {
      setNewMessage("")
    }
    
    setIsSending(false)
  }

  const activeUserCount = new Set(messages.map((m) => m.username)).size

  if (!user) {
    return <LoadingScreen />
  }

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      <ChatHeader user={user} activeUserCount={activeUserCount} />

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div className="absolute inset-0 bg-muted/20"></div>
        </div>

        <MessagesList messages={messages} user={user} isLoading={isLoading} />
      </main>

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={handleSendMessage}
        isSending={isSending}
      />
    </div>
  )
}

export default ChatPage