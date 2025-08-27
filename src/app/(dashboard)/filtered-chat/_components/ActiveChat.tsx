"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { User } from "@supabase/supabase-js"
import { Send, ArrowLeft, MoreVertical, Smile, Shield, AlertTriangle, MessageCircle, UserIcon } from "lucide-react"
import { toast } from "sonner"
import type { ChatRoom, OnlineUser } from "../page"
import { supabase } from "@/lib/client"
import { motion } from "framer-motion"

interface Message {
  id: string
  content: string
  created_at: string
  sender_name: string
  sender_username: string
  is_own_message: boolean
}

interface ActiveChatProps {
  chatRoom: ChatRoom
  chatPartner: OnlineUser
  currentUser: User
  onBack: () => void
  onEndChat: () => void
  isMobileView: boolean
  onShowProfile?: () => void
}

const ActiveChat = ({
  chatRoom,
  chatPartner,
  currentUser,
  onBack,
  onEndChat,
  isMobileView,
  onShowProfile,
}: ActiveChatProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [partnerIsTyping, setPartnerIsTyping] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [chatStatus, setChatStatus] = useState(chatRoom.status)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const emojis = ["😊", "😂", "😍", "😔", "😎", "🤔", "👍", "👎", "❤️", "🎉", "🔥", "💯"]

  useEffect(() => {
    loadMessages()

    const messageChannel = supabase.channel(`chat_room_${chatRoom.id}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "private_messages",
        filter: `chat_room_id=eq.${chatRoom.id}`,
      },
      async (payload) => {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name, username")
          .eq("user_id", payload.new.sender_id)
          .single()

        const newMsg: Message = {
          id: payload.new.id,
          content: payload.new.content,
          created_at: payload.new.created_at,
          sender_name: profileData?.name || "Unknown User",
          sender_username: profileData?.username || "unknown",
          is_own_message: payload.new.sender_id === currentUser.id,
        }

        setMessages((prev) => [...prev, newMsg])
        setPartnerIsTyping(false)
      },
    )

    const roomChannel = supabase.channel(`room_status_${chatRoom.id}`).on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "chat_rooms",
        filter: `id=eq.${chatRoom.id}`,
      },
      (payload) => {
        setChatStatus(payload.new.status)
        if (payload.new.status === "ended") {
          toast.info("Chat has been ended")
          onEndChat()
        }
      },
    )

    const typingChannel = supabase
      .channel(`typing_${chatRoom.id}`)
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.user_id !== currentUser.id) {
          setPartnerIsTyping(payload.isTyping)
        }
      })

    messageChannel.subscribe()
    roomChannel.subscribe()
    typingChannel.subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
      supabase.removeChannel(roomChannel)
      supabase.removeChannel(typingChannel)
    }
  }, [chatRoom.id, currentUser.id, onEndChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (newMessage.length > 0) {
        supabase.channel(`typing_${chatRoom.id}`).send({
          type: "broadcast",
          event: "typing",
          payload: { user_id: currentUser.id, isTyping: true },
        })
      } else {
        supabase.channel(`typing_${chatRoom.id}`).send({
          type: "broadcast",
          event: "typing",
          payload: { user_id: currentUser.id, isTyping: false },
        })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [newMessage, chatRoom.id, currentUser.id])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.rpc("get_chat_messages", {
        room_id: chatRoom.id,
      })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error loading messages:", error)
      toast.error("Failed to load messages. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || chatStatus !== "active") return

    try {
      const { error } = await supabase.from("private_messages").insert({
        chat_room_id: chatRoom.id,
        sender_id: currentUser.id,
        content: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message. Please try again.")
    }
  }

  const endChat = async () => {
    try {
      const { error } = await supabase
        .from("chat_rooms")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", chatRoom.id)

      if (error) throw error
      onEndChat()
      toast.success("Chat ended successfully")
    } catch (error) {
      console.error("Error ending chat:", error)
      toast.error("Failed to end chat")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCountryFlag = (country: string) => {
    const flagMap: { [key: string]: string } = {
      "United States": "🇺🇸",
      Canada: "🇨🇦",
      "United Kingdom": "🇬🇧",
      Germany: "🇩🇪",
      France: "🇫🇷",
      India: "🇮🇳",
      China: "🇨🇳",
      Japan: "🇯🇵",
      Brazil: "🇧🇷",
      Australia: "🇦🇺",
    }
    return flagMap[country] || "🌍"
  }

  const handleBlockUser = async () => {
    toast.info("Block user functionality to be implemented")
    setShowMenu(false)
  }

  const handleReportUser = async () => {
    toast.info("Report user functionality to be implemented")
    setShowMenu(false)
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="lg:hidden p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </button>

          <button
            onClick={onShowProfile}
            className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
          >
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm sm:text-base">
                {chatPartner.name.charAt(0).toUpperCase()}
              </div>
              {chatStatus === "active" && (
                <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 border-2 border-card rounded-full bg-green-500"></div>
              )}
            </div>

            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <h2 className="font-semibold text-sm sm:text-base text-card-foreground truncate">{chatPartner.name}</h2>
                <span className="text-sm sm:text-lg flex-shrink-0">{getCountryFlag(chatPartner.country)}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {chatStatus === "ended" ? (
                  "Chat ended"
                ) : partnerIsTyping ? (
                  <span className="flex items-center text-primary">
                    <span className="flex space-x-1 mr-1">
                      <span
                        className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></span>
                      <span
                        className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></span>
                      <span
                        className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></span>
                    </span>
                    typing...
                  </span>
                ) : (
                  "Online now"
                )}
              </p>
            </div>
          </button>
        </div>

        {/* Actions */}
        <div className="relative flex-shrink-0 flex items-center space-x-1">
          {/* Profile button for larger screens */}
          {!isMobileView && onShowProfile && (
            <button
              onClick={onShowProfile}
              className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors"
              title="View profile"
            >
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </button>
          )}

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors"
          >
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-44 sm:w-48 bg-popover rounded-lg shadow-xl border border-border overflow-hidden z-20 top-full"
            >
              <button
                onClick={handleBlockUser}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-left text-xs sm:text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground flex items-center space-x-2"
              >
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Block User</span>
              </button>
              <button
                onClick={handleReportUser}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-left text-xs sm:text-sm text-destructive hover:bg-accent hover:text-accent-foreground flex items-center space-x-2"
              >
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Report User</span>
              </button>
              <div className="border-t border-border"></div>
              <button
                onClick={endChat}
                disabled={chatStatus === "ended"}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-left text-xs sm:text-sm text-destructive hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                End Chat
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground text-sm">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-card-foreground mb-1">No messages yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
              Say hello to {chatPartner.name} and start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isSameSender =
                index > 0 &&
                messages[index - 1].is_own_message === message.is_own_message &&
                new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() <
                  5 * 60 * 1000
              const isFirstInGroup = !isSameSender

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.is_own_message ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-xs md:max-w-md ${isFirstInGroup ? "mt-2 sm:mt-3" : "mt-0.5 sm:mt-1"}`}
                  >
                    {isFirstInGroup && !message.is_own_message && (
                      <div className="text-xs text-muted-foreground mb-1 px-1">
                        {message.sender_name} (@{message.sender_username})
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl ${
                        message.is_own_message
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-card-foreground border border-border rounded-bl-sm"
                      } transition-all duration-200 hover:shadow-md`}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed break-words">{message.content}</p>
                    </div>
                    <div
                      className={`text-xs mt-1 px-1 ${
                        message.is_own_message ? "text-right text-muted-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {partnerIsTyping && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2 sm:px-4 sm:py-3 max-w-[85%] sm:max-w-xs border border-border">
                  <div className="flex space-x-1">
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      {chatStatus === "active" ? (
        <div className="p-2 sm:p-4 bg-card/95 backdrop-blur-lg border-t border-border">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end space-x-1 sm:space-x-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-all duration-200"
                >
                  <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 bg-popover border border-border rounded-xl shadow-xl p-2 sm:p-3 z-20 w-56 sm:w-64"
                  >
                    <div className="grid grid-cols-6 gap-1 sm:gap-2">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="text-lg sm:text-2xl hover:bg-accent p-1 rounded-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={handleTextareaChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full resize-none rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 bg-input text-foreground border border-border focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 outline-none pr-10 sm:pr-12 text-sm sm:text-base placeholder:text-muted-foreground"
                  rows={1}
                  style={{ minHeight: "36px", maxHeight: "120px" }}
                />

                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`absolute right-1 bottom-1 sm:right-1.5 sm:bottom-1.5 p-1 sm:p-1.5 rounded-full transition-all duration-200 ${
                    newMessage.trim()
                      ? "bg-primary text-primary-foreground hover:shadow-lg transform hover:scale-105"
                      : "text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </form>

          {showEmojiPicker && <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />}
        </div>
      ) : (
        <div className="p-3 sm:p-4 bg-card/95 backdrop-blur-lg border-t border-border text-center">
          <p className="text-muted-foreground text-sm">This chat has ended</p>
        </div>
      )}
    </div>
  )
}

export default ActiveChat
