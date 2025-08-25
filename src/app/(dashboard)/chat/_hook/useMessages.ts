// chat/_hooks/useMessages.ts
"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/client"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"

interface Message {
  id: string
  content: string
  created_at: string
  user_name: string
  username: string
}

const useMessages = (user: User | null) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user) return false

    try {
      const { error } = await supabase.from("messages").insert({
        content: content.trim(),
        user_id: user.id,
      })

      if (error) {
        console.error("Error sending message:", error)
        toast.error("Failed to send message")
        return false
      }

      return true
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
      return false
    }
  }

  return {
    messages,
    isLoading,
    sendMessage,
  }
}

export default useMessages