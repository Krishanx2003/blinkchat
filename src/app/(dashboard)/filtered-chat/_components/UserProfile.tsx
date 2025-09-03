"use client"

import type React from "react"
import { X, MapPin, Calendar, User, Shield, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { OnlineUser } from "../page"

interface UserProfileProps {
  user: OnlineUser
  onClose: () => void
  onBlock?: () => void
  onReport?: () => void
  className?: string
}

function formatLastSeen(lastSeen: string | Date) {
  const date = new Date(lastSeen)
  const now = new Date()

  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)

  if (isToday) {
    return `today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  } else {
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onClose, onBlock, onReport, className = "" }) => {
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

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-violet-500 to-purple-600",
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-600",
      "from-amber-500 to-orange-500",
      "from-rose-500 to-pink-600",
      "from-indigo-500 to-blue-600",
      "from-teal-500 to-emerald-600",
      "from-purple-500 to-violet-600",
    ]
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  return (
    <div className={`bg-card border-l border-border flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-card-foreground">Profile</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-muted">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Profile Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Avatar and Basic Info */}
        <div className="text-center">
          <div className="relative mx-auto mb-4">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg bg-gradient-to-br ${getAvatarColor(
                user.name
              )}`}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-card bg-green-500"></div>
          </div>

          <h2 className="text-xl font-bold text-card-foreground mb-1">{user.name}</h2>
          <p className="text-sm text-muted-foreground">@{user.username}</p>

          {/* Last seen */}
          <p className="text-xs text-muted-foreground mt-2">
            last seen {formatLastSeen(user.last_seen)}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-card-foreground">Age</p>
                <p className="text-sm text-muted-foreground">{user.age} years old</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-card-foreground">Location</p>
                <p className="text-sm text-muted-foreground">
                  {getCountryFlag(user.country)} {user.city}, {user.country}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-card-foreground">Gender</p>
                <p className="text-sm text-muted-foreground capitalize">{user.gender}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-border">
          {onBlock && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBlock}
              className="w-full justify-start text-muted-foreground hover:text-foreground bg-transparent"
            >
              <Shield className="h-4 w-4 mr-2" />
              Block User
            </Button>
          )}

          {onReport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReport}
              className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
            >
              <Flag className="h-4 w-4 mr-2" />
              Report User
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile
