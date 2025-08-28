"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { MessageCircle, Users, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import ActiveChat from "./_components/ActiveChat"
import UserDiscovery from "./_components/UserDiscovery"
import UserProfile from "./_components/UserProfile"
import { supabase } from "@/lib/client"
import { cn } from "@/lib/utils"

// Updated interface to match the SQL function return type and UserDiscovery component
export interface OnlineUser {
  user_id: string
  name: string
  username: string
  gender: string
  age: number
  country: string
  city: string
  last_seen: string
  // Optional properties for UI state management
  is_online?: boolean
  looking_for_chat?: boolean
  updated_at?: string
}

export interface ChatRoom {
  id: string
  user1_id: string
  user2_id: string
  status: string
  created_at: string
  ended_at?: string
}

const ChatPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null)
  const [chatPartner, setChatPartner] = useState<OnlineUser | null>(null)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showChatList, setShowChatList] = useState(true)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check for mobile/tablet view
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobileView(width < 1024) // lg breakpoint

      // Auto-show profile on larger screens when chatting
      if (width >= 1280 && activeChat) {
        // xl breakpoint
        setShowUserProfile(true)
      } else if (width < 1280) {
        setShowUserProfile(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [activeChat])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for current user
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error("Auth error:", error)
          router.push("/auth")
          return
        }

        if (!currentUser) {
          router.push("/auth")
          return
        }

        setUser(currentUser)
        await updateUserPresence(currentUser.id, true, true)
      } catch (error) {
        console.error("Initialization error:", error)
        router.push("/auth")
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        if (user) {
          await updateUserPresence(user.id, false, false)
        }
        router.push("/auth")
      } else if (event === "SIGNED_IN" && session.user) {
        setUser(session.user)
        await updateUserPresence(session.user.id, true, true)
      }
    })

    return () => {
      subscription.unsubscribe()
      if (user) {
        updateUserPresence(user.id, false, false)
      }
    }
  }, [router])

  const updateUserPresence = async (userId: string, isOnline: boolean, lookingForChat = false) => {
    try {
      const { error } = await supabase.from("user_presence").upsert(
        {
          user_id: userId,
          is_online: isOnline,
          looking_for_chat: lookingForChat,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )

      if (error) {
        console.error("Error updating presence:", error)
      }
    } catch (error) {
      console.error("Error updating presence:", error)
    }
  }

  const handleUserSelect = async (selectedUser: OnlineUser) => {
    if (!user) {
      toast.error("User not authenticated")
      return
    }

    try {
      // Check for existing chat room between users
      const { data: existingRooms, error: searchError } = await supabase
        .from("chat_rooms")
        .select("*")
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${selectedUser.user_id}),and(user1_id.eq.${selectedUser.user_id},user2_id.eq.${user.id})`,
        )
        .eq("status", "active")

      if (searchError) {
        console.error("Error searching for existing room:", searchError)
        toast.error("Failed to search for existing chat")
        return
      }

      let chatRoom: ChatRoom

      if (existingRooms && existingRooms.length > 0) {
        // Use existing room
        chatRoom = existingRooms[0] as ChatRoom
      } else {
        // Create new room
        const { data: newRoom, error: createError } = await supabase
          .from("chat_rooms")
          .insert({
            user1_id: user.id,
            user2_id: selectedUser.user_id,
            status: "active",
          })
          .select()
          .single()

        if (createError || !newRoom) {
          console.error("Error creating chat room:", createError)
          toast.error("Failed to create chat room")
          return
        }
        chatRoom = newRoom as ChatRoom
      }

      setActiveChat(chatRoom)
      setChatPartner(selectedUser)

      if (window.innerWidth >= 1280) {
        setShowUserProfile(true)
      }

      if (isMobileView) {
        setShowChatList(false)
      }

      toast.success(`Connected with ${selectedUser.name}`)
    } catch (error) {
      console.error("Error creating/finding chat room:", error)
      toast.error("Failed to start chat")
    }
  }

  const handleBackToDiscovery = () => {
    setActiveChat(null)
    setChatPartner(null)
    setShowChatList(true)
    setShowUserProfile(false)
  }

  const handleEndChat = async () => {
    if (!activeChat) return

    try {
      const { error } = await supabase
        .from("chat_rooms")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", activeChat.id)

      if (error) {
        console.error("Error ending chat:", error)
        toast.error("Failed to end chat")
        return
      }

      setActiveChat(null)
      setChatPartner(null)
      setShowChatList(true)
      setShowUserProfile(false)
      toast.success("Chat ended")
    } catch (error) {
      console.error("Error ending chat:", error)
      toast.error("Failed to end chat")
    }
  }

  // Loading state
  if (loading || !user) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-foreground text-lg font-medium">Loading your chat...</p>
          <p className="text-muted-foreground text-sm mt-1">Connecting to conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* User Discovery Sidebar */}
      <div
        className={cn(
          "flex-shrink-0 border-r border-sidebar-border bg-sidebar shadow-sm transition-all duration-300",
          // Mobile: full width when showing list, completely hidden when chatting
          isMobileView 
            ? (showChatList ? "w-full" : "w-0 overflow-hidden opacity-0") 
            : "w-80 lg:w-96",
          "h-full flex flex-col",
        )}
      >
        {/* Only render content when visible */}
        {(!isMobileView || showChatList) && (
          <>
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-sidebar-border bg-sidebar">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sidebar-primary rounded-xl">
                  <Users className="w-5 h-5 text-sidebar-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sidebar-foreground">Discover</h2>
                  <p className="text-xs text-sidebar-foreground/60">Find people to chat with</p>
                </div>
              </div>
            </div>

            {/* User Discovery Content */}
            <div className="flex-1 overflow-hidden">
              <UserDiscovery
                currentUser={user}
                onUserSelect={handleUserSelect}
                isMobileView={isMobileView}
                selectedUserId={chatPartner?.user_id}
              />
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div
        className={cn(
          "flex h-full bg-card min-w-0",
          // Mobile: take full width when chat is active, hidden when showing discovery
          isMobileView 
            ? (showChatList ? "w-0 overflow-hidden opacity-0" : "w-full flex-1") 
            : "flex-1 flex"
        )}
      >
        {/* Only render chat content when visible */}
        {(!isMobileView || !showChatList) && (
          <>
            {/* Chat Interface */}
            <div
              className={cn(
                "flex-1 flex flex-col h-full min-w-0",
                showUserProfile && !isMobileView ? "xl:flex-1" : "flex-1",
              )}
            >
              {activeChat && chatPartner ? (
                <>
                  {/* Mobile Back Button */}
                  {isMobileView && (
                    <div className="flex-shrink-0 p-3 border-b border-border bg-card">
                      <button
                        onClick={handleBackToDiscovery}
                        className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Discovery
                      </button>
                    </div>
                  )}
                  <ActiveChat
                    chatRoom={activeChat}
                    chatPartner={chatPartner}
                    currentUser={user}
                    onBack={handleBackToDiscovery}
                    onEndChat={handleEndChat}
                    isMobileView={isMobileView}
                  />
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
                  <div className="max-w-md text-center">
                    <div className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Connect?</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Choose someone from the discovery panel to start a meaningful conversation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Panel - Discord-like right sidebar */}
            {showUserProfile && chatPartner && !isMobileView && (
              <UserProfile
                user={chatPartner}
                onClose={() => setShowUserProfile(false)}
                onBlock={() => {
                  toast.info("Block user functionality to be implemented")
                }}
                onReport={() => {
                  toast.info("Report user functionality to be implemented")
                }}
                className="w-80 xl:w-96 flex-shrink-0"
              />
            )}
          </>
        )}
      </div>

      {/* Mobile Profile Modal */}
      {showUserProfile && chatPartner && isMobileView && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <UserProfile
              user={chatPartner}
              onClose={() => setShowUserProfile(false)}
              onBlock={() => {
                setShowUserProfile(false)
                toast.info("Block user functionality to be implemented")
              }}
              onReport={() => {
                setShowUserProfile(false)
                toast.info("Report user functionality to be implemented")
              }}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPage