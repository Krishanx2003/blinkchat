"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { Search, Filter, UserIcon, Users, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabase } from "@/lib/client"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface OnlineUser {
  user_id: string
  name: string
  username: string
  gender: string
  age: number
  country: string
  city: string
  last_seen: string
  is_online?: boolean
  looking_for_chat?: boolean
  updated_at?: string
}

interface UserDiscoveryProps {
  currentUser: User
  onUserSelect: (user: OnlineUser) => Promise<void>
  isMobileView: boolean
  selectedUserId?: string
}

const UserDiscovery = ({ currentUser, onUserSelect, isMobileView, selectedUserId }: UserDiscoveryProps) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<OnlineUser[]>([])
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [genderFilter, setGenderFilter] = useState("")
  const [countryFilter, setCountryFilter] = useState("")
  const [cityFilter, setCityFilter] = useState("") // Declare cityFilter and setCityFilter
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadOnlineUsers()

    updateUserPresence(true, true)

    const presenceChannel = supabase
      .channel("user_presence_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
        },
        () => {
          loadOnlineUsers()
        },
      )
      .subscribe()

    const messagesChannel = supabase
      .channel("private_messages_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "private_messages",
        },
        (payload) => {
          loadUnreadCounts()
        },
      )
      .subscribe()

    return () => {
      updateUserPresence(false, false)
      supabase.removeChannel(presenceChannel)
      supabase.removeChannel(messagesChannel)
    }
  }, [])

  useEffect(() => {
    loadOnlineUsers()
    loadUnreadCounts()
  }, [genderFilter, countryFilter, cityFilter]) // Include cityFilter in the dependency array

  useEffect(() => {
    applyFilters()
  }, [onlineUsers, searchQuery])

  const updateUserPresence = async (isOnline: boolean, lookingForChat: boolean) => {
    try {
      await supabase.from("user_presence").upsert({
        user_id: currentUser.id,
        is_online: isOnline,
        looking_for_chat: lookingForChat,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error updating presence:", error)
    }
  }

  const loadOnlineUsers = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase.rpc("get_available_users_for_matching", {
        filter_gender: genderFilter || null,
        filter_country: countryFilter || null,
        filter_city: cityFilter || null, // Use cityFilter in the RPC call
      })

      if (error) {
        console.error("Error loading users:", error)
        toast.error("Failed to load online users")
      } else {
        const typedData: OnlineUser[] = (data || []).map((user: any) => ({
          user_id: user.user_id,
          name: user.name || "Unknown",
          username: user.username || "unknown",
          gender: user.gender || "not specified",
          age: user.age || 0,
          country: user.country || "Unknown",
          city: user.city || "Unknown",
          last_seen: user.last_seen || new Date().toISOString(),
          is_online: true,
          looking_for_chat: true,
        }))
        setOnlineUsers(typedData)
        loadUnreadCounts()
      }
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("Failed to load online users")
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCounts = async () => {
    try {
      const { data: rooms } = await supabase
        .from("chat_rooms")
        .select("id, user1_id, user2_id")
        .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
        .eq("status", "active")

      if (!rooms) return

      const unreadCountsMap: Record<string, number> = {}

      for (const room of rooms) {
        const otherUserId = room.user1_id === currentUser.id ? room.user2_id : room.user1_id

        const { count, error } = await supabase
          .from("private_messages")
          .select("*", { count: "exact", head: true })
          .eq("chat_room_id", room.id)
          .neq("sender_id", currentUser.id)

        if (!error && count !== null) {
          unreadCountsMap[otherUserId] = count
        }
      }

      setUnreadCounts(unreadCountsMap)
    } catch (error) {
      console.error("Error loading unread counts:", error)
    }
  }

  const applyFilters = () => {
    let filtered = [...onlineUsers]

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredUsers(filtered)
  }

  const clearFilters = () => {
    setGenderFilter("")
    setCountryFilter("")
    setCityFilter("") // Clear cityFilter
    setSearchQuery("")
  }

  const hasActiveFilters = genderFilter || countryFilter || cityFilter // Include cityFilter in the condition

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-violet-500 to-purple-600",
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-600",
      "from-amber-500 to-orange-500",
      "from-rose-500 to-pink-600",
      "from-indigo-500 to-blue-600",
    ]
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  return (
    <div className="h-full flex flex-col bg-sidebar">
      {/* Header with Search & Filters */}
      <div className="sticky top-0 z-10 bg-sidebar/95 backdrop-blur-xl border-b border-sidebar-border">
        {/* Search Bar */}
        <div className="p-4 pb-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-sidebar-foreground/60 group-focus-within:text-sidebar-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-12 py-3 text-sm bg-sidebar-accent border border-sidebar-border rounded-lg placeholder-sidebar-foreground/60 focus:outline-none focus:ring-2 focus:ring-sidebar-primary/20 focus:border-sidebar-primary transition-all duration-200 text-sidebar-foreground"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
              }`}
            >
              <div className="relative">
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-sidebar-primary rounded-full animate-pulse" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden border-t border-sidebar-border"
            >
              <div className="p-4 bg-sidebar-accent/30">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-sidebar-foreground">Gender</Label>
                    <div className="relative">
                      <select
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value)}
                        className="w-full appearance-none bg-sidebar border border-sidebar-border rounded-lg px-3 py-2 text-sm text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-primary/20 focus:border-sidebar-primary transition-all"
                      >
                        <option value="">Any gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/60 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-sidebar-foreground">Country</Label>
                    <input
                      type="text"
                      placeholder="Any country"
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="w-full bg-sidebar border border-sidebar-border rounded-lg px-3 py-2 text-sm text-sidebar-foreground placeholder-sidebar-foreground/60 focus:outline-none focus:ring-2 focus:ring-sidebar-primary/20 focus:border-sidebar-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-sidebar-foreground">City</Label>
                    <input
                      type="text"
                      placeholder="Any city"
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="w-full bg-sidebar border border-sidebar-border rounded-lg px-3 py-2 text-sm text-sidebar-foreground placeholder-sidebar-foreground/60 focus:outline-none focus:ring-2 focus:ring-sidebar-primary/20 focus:border-sidebar-primary transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-sidebar-foreground/70">
                    Showing people who are online and looking for chat
                  </div>

                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      variant="ghost"
                      size="sm"
                      className="text-sidebar-foreground/70 hover:text-sidebar-foreground h-8 px-3"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Online Status Bar */}
        <div className="px-4 py-3 bg-green-500/10 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <Users className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-sm font-medium text-green-300">
                {filteredUsers.length} {filteredUsers.length === 1 ? "person" : "people"} available
              </span>
            </div>
            {searchQuery && (
              <Badge variant="secondary" className="bg-sidebar-primary/20 text-sidebar-primary text-xs">
                "{searchQuery}"
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-sidebar-accent border-t-sidebar-primary rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-sidebar-primary/60 rounded-full animate-spin"
                style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-sidebar-foreground">Discovering people</p>
              <p className="text-xs text-sidebar-foreground/60 mt-1">Finding amazing conversations...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
            <div className="w-16 h-16 bg-sidebar-accent rounded-2xl flex items-center justify-center mb-4">
              <UserIcon className="w-8 h-8 text-sidebar-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold text-sidebar-foreground mb-2">No one available</h3>
            <p className="text-sm text-sidebar-foreground/60 max-w-xs">
              {searchQuery || hasActiveFilters
                ? "Try adjusting your search or filters to find more people"
                : "No one is currently looking for chat. Check back later!"}
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  layout
                >
                  <button
                    onClick={() => onUserSelect(user)}
                    className={`w-full p-4 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                      selectedUserId === user.user_id
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg scale-[1.02]"
                        : "bg-sidebar-accent/50 hover:bg-sidebar-accent border border-sidebar-border hover:border-sidebar-primary/30 hover:shadow-md hover:scale-[1.01]"
                    }`}
                  >
                    {/* Background decoration for selected user */}
                    {selectedUserId === user.user_id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-50"></div>
                    )}

                    <div className="flex items-center gap-4 relative z-10">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300 ${
                            selectedUserId === user.user_id
                              ? "bg-white/20 shadow-xl"
                              : `bg-gradient-to-br ${getAvatarColor(user.name)} group-hover:shadow-xl group-hover:scale-110`
                          }`}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Online status indicator */}
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                            selectedUserId === user.user_id
                              ? "border-sidebar-primary bg-green-400"
                              : "border-sidebar bg-green-500"
                          } animate-pulse`}
                        ></div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-semibold text-base truncate ${
                              selectedUserId === user.user_id
                                ? "text-sidebar-primary-foreground"
                                : "text-sidebar-foreground"
                            }`}
                          >
                            {user.name}
                          </h3>
                          {user.age > 0 && (
                            <span
                              className={`text-xs px-2 py-1 rounded-lg font-medium ${
                                selectedUserId === user.user_id
                                  ? "bg-white/20 text-sidebar-primary-foreground"
                                  : "bg-sidebar-accent text-sidebar-foreground/80"
                              }`}
                            >
                              {user.age}
                            </span>
                          )}

                          {/* Unread message count */}
                          {unreadCounts[user.user_id] > 0 && (
                            <div
                              className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                                selectedUserId === user.user_id
                                  ? "bg-white text-sidebar-primary"
                                  : "bg-red-500 text-white"
                              } animate-pulse`}
                            >
                              {unreadCounts[user.user_id] > 99 ? "99+" : unreadCounts[user.user_id]}
                            </div>
                          )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 mb-2">
                          <span
                            className={`text-xs truncate ${
                              selectedUserId === user.user_id
                                ? "text-sidebar-primary-foreground/80"
                                : "text-sidebar-foreground/70"
                            }`}
                          >
                            {user.city}, {user.country}
                          </span>
                        </div>

                        {/* Status badges */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                              selectedUserId === user.user_id
                                ? "bg-white/20 text-sidebar-primary-foreground"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
                            Ready to chat
                          </span>

                          {/* New messages indicator */}
                          {unreadCounts[user.user_id] && unreadCounts[user.user_id] > 0 && (
                            <span
                              className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                                selectedUserId === user.user_id
                                  ? "bg-white/20 text-sidebar-primary-foreground"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
                              New messages
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Last seen */}
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <span
                            className={`text-xs ${
                              selectedUserId === user.user_id
                                ? "text-sidebar-primary-foreground/80"
                                : "text-sidebar-foreground/50"
                            }`}
                          >
                            Last seen: {new Date(user.last_seen).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDiscovery
