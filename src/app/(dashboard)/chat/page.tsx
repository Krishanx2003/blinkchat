"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/client"
import type { User } from "@supabase/supabase-js"
import { Send, ArrowLeft, Users, Smile, MoreVertical, Hash, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  created_at: string
  user_name: string
  username: string
}

const ChatPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth")
      } else {
        setUser(user)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        router.push("/auth")
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Load existing messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase.rpc("get_messages_with_profiles")
        if (error) {
          console.error("Error loading messages:", error)
          toast.error("Failed to load messages")
        } else {
          setMessages(data || [])
        }
      } catch (error) {
        console.error("Error loading messages:", error)
        toast.error("Failed to load messages")
      } finally {
        setIsLoading(false)
      }
    }
    if (user) {
      loadMessages()
    }
  }, [user])

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          // Get the user profile for the new message
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name, username")
            .eq("user_id", payload.new.user_id)
            .single()
          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            user_name: profileData?.name || "Unknown User",
            username: profileData?.username || "unknown",
          }
          setMessages((prev) => [...prev, newMessage])
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [newMessage])

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return

    setIsSending(true)
    try {
      const { error } = await supabase.from("messages").insert({
        content: newMessage.trim(),
        user_id: user.id,
      })
      if (error) {
        console.error("Error sending message:", error)
        toast.error("Failed to send message")
      } else {
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

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
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4 border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="relative mx-auto mb-6 w-20 h-20">
              <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-chart-1 rounded-full animate-spin-reverse"></div>
            </div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-xl font-bold text-primary mb-2">Loading TingleTalk</h2>
              <p className="text-muted-foreground font-medium">Connecting you to the conversation...</p>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col bg-background">
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
                    <Sparkles className="w-4 h-4 text-chart-1 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1.5"></div>
                      {messages.length > 0 ? `${new Set(messages.map((m) => m.username)).size} active` : "Join now"}
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

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div className="absolute inset-0 bg-muted/20"></div>
        </div>

        <ScrollArea className="flex-1 h-full relative z-10">
          <div className="px-3 sm:px-6 py-4 sm:py-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="relative mx-auto mb-6 w-16 h-16">
                      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-chart-1 rounded-full animate-spin-reverse"></div>
                    </div>
                    <p className="text-muted-foreground font-semibold">Loading messages...</p>
                  </CardContent>
                </Card>
              </div>
            ) : messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center h-96"
              >
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm max-w-md mx-auto">
                  <CardContent className="p-8 text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-6 rounded-2xl">
                      <AvatarFallback className="bg-muted rounded-2xl">
                        <Users className="w-12 h-12 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-foreground mb-4">Start the conversation</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed text-sm">
                      All chats vanish after 1 hour — encrypted & anonymous.
                      <br />
                      <span className="text-xs opacity-75">Share your thoughts freely.</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => {
                    const isOwnMessage = user && message.username === user.email?.split("@")[0]
                    const showAvatar = index === 0 || messages[index - 1].username !== message.username

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        transition={{
                          duration: 0.4,
                          ease: [0.25, 0.1, 0.25, 1],
                          delay: Math.min(index * 0.03, 0.3),
                        }}
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
                                      "text-white font-bold text-sm rounded-xl",
                                      getAvatarColor(message.user_name || message.username),
                                    )}
                                  >
                                    {(message.user_name || message.username).charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </motion.div>
                            ) : (
                              <div className="w-10 h-10 sm:w-11 sm:h-11"></div>
                            )}
                          </div>
                        )}

                        <div
                          className={cn(
                            "flex flex-col max-w-[80%] sm:max-w-lg",
                            isOwnMessage ? "items-end" : "items-start",
                          )}
                        >
                          {showAvatar && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                "flex items-center gap-2 sm:gap-3 mb-2 px-1",
                                isOwnMessage ? "justify-end" : "justify-start",
                              )}
                            >
                              <span className="text-sm font-bold text-foreground">
                                {isOwnMessage ? "You" : message.user_name || message.username}
                              </span>
                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                {formatTime(message.created_at)}
                              </Badge>
                            </motion.div>
                          )}

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={cn(
                              "px-4 sm:px-5 py-3 sm:py-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md backdrop-blur-sm",
                              isOwnMessage
                                ? "bg-primary text-primary-foreground rounded-br-lg"
                                : "bg-card border rounded-bl-lg",
                            )}
                          >
                            <p className="text-sm sm:text-base leading-relaxed break-words font-medium">
                              {message.content}
                            </p>
                          </motion.div>

                          {!showAvatar && (
                            <Badge
                              variant="ghost"
                              className={cn("text-xs mt-2 px-2", isOwnMessage ? "self-end" : "self-start")}
                            >
                              {formatTime(message.created_at)}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <footer className="sticky bottom-0 z-20 bg-background/80 backdrop-blur-xl border-t">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-end gap-2 sm:gap-3 max-w-4xl mx-auto"
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
          >
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[48px] sm:min-h-[52px] max-h-[120px] resize-none rounded-2xl border-input bg-background/80 backdrop-blur-sm pr-12 sm:pr-14 text-sm sm:text-base"
                rows={1}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-xl"
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
                  className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
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
            <Badge variant="secondary" className="text-xs">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1.5"></div>
              Connected & Encrypted
            </Badge>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}

export default ChatPage
