// chat/_hooks/useAuth.ts
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/client"
import type { User } from "@supabase/supabase-js"

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
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

  return { user }
}

export default useAuth