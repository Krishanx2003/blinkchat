// chat/_components/LoadingScreen.tsx
"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

export const LoadingScreen: React.FC = () => {
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