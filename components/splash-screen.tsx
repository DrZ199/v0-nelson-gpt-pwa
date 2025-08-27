"use client"

import { useEffect, useState } from "react"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 300) // Wait for fade out animation
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black flex items-center justify-center z-50 opacity-0 transition-opacity duration-300 pointer-events-none" />
    )
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-black flex flex-col items-center justify-center z-50 transition-opacity duration-300">
      {/* Logo */}
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white tracking-tight">Nelson-GPT</h1>
      </div>

      {/* Tagline */}
      <p className="text-lg text-black dark:text-white/90 mb-8 text-center max-w-md px-4">
        AI-Powered Pediatric Medical Assistant
      </p>

      {/* Loading dots */}
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
        <div
          className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  )
}
