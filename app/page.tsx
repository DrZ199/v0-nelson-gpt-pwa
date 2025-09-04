"use client"

import { useState } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { ChatInterface } from "@/components/chat-interface"
import { Sidebar } from "@/components/sidebar"
import { SettingsPage } from "@/components/pages/settings-page"
import { AboutPage } from "@/components/pages/about-page"
import { ProfileSettingsPage } from "@/components/pages/profile-settings-page"
import { AppearanceSettingsPage } from "@/components/pages/appearance-settings-page"
import { TypographySettingsPage } from "@/components/pages/typography-settings-page"
import { DisplaySettingsPage } from "@/components/pages/display-settings-page"
import { AIResponsesSettingsPage } from "@/components/pages/ai-responses-settings-page"
import { DataPrivacySettingsPage } from "@/components/pages/data-privacy-settings-page"
import { InstallPrompt } from "@/components/install-prompt"
import { ConnectionStatus } from "@/components/connection-status"
import { SettingsProvider } from "@/lib/settings-context"
import { ChatProvider } from "@/lib/chat-context"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState("chat")
  const [sessionId] = useState(() => crypto.randomUUID())

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const handleMenuClick = () => {
    setSidebarOpen(true)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
    setSidebarOpen(false)
  }

  const handleNewChat = () => {
    setCurrentPage("chat")
    // The ChatProvider will handle creating a new session
  }

  const handleBackToChat = () => {
    setCurrentPage("chat")
  }

  const handleBackToSettings = () => {
    setCurrentPage("settings")
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  return (
    <SettingsProvider sessionId={sessionId}>
      <ChatProvider initialSessionId={sessionId}>
        <div className="relative">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={handleSidebarClose}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onNewChat={handleNewChat}
          />

          {currentPage === "chat" && <ChatInterface onMenuClick={handleMenuClick} />}

          {currentPage === "settings" && <SettingsPage onBack={handleBackToChat} />}

          {currentPage === "about" && <AboutPage onBack={handleBackToChat} />}

          {currentPage === "history" && <ChatInterface onMenuClick={handleMenuClick} />}

          {currentPage === "profile" && <ProfileSettingsPage onBack={handleBackToSettings} />}

          {currentPage === "appearance" && <AppearanceSettingsPage onBack={handleBackToSettings} />}

          {currentPage === "typography" && <TypographySettingsPage onBack={handleBackToSettings} />}

          {currentPage === "display" && <DisplaySettingsPage onBack={handleBackToSettings} />}

          {currentPage === "ai-responses" && <AIResponsesSettingsPage onBack={handleBackToSettings} />}

          {currentPage === "data-privacy" && <DataPrivacySettingsPage onBack={handleBackToSettings} />}

          <InstallPrompt />
          <ConnectionStatus />
        </div>
      </ChatProvider>
    </SettingsProvider>
  )
}
