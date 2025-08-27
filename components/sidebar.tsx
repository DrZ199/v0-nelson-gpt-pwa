"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  MessageSquarePlus,
  History,
  Settings,
  Info,
  X,
  Trash2,
  Edit3,
  Pin,
  ChevronRight,
  User,
  Type,
  Palette,
  Monitor,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPage: string
  onPageChange: (page: string) => void
  onNewChat: () => void
}

interface ChatHistoryItem {
  id: string
  title: string
  timestamp: Date
  isPinned: boolean
}

export function Sidebar({ isOpen, onClose, currentPage, onPageChange, onNewChat }: SidebarProps) {
  // Mock chat history data
  const [chatHistory] = useState<ChatHistoryItem[]>([
    {
      id: "1",
      title: "Pneumonia treatment guidelines",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isPinned: true,
    },
    {
      id: "2",
      title: "Ceftriaxone dosing calculation",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isPinned: false,
    },
    {
      id: "3",
      title: "Typhoid fever resistance patterns",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isPinned: false,
    },
  ])

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const settingsItems = [
    { id: "profile", label: "Profile & Age", icon: User, description: "Personal information and age settings" },
    { id: "appearance", label: "Appearance", icon: Palette, description: "Theme, colors, and visual preferences" },
    { id: "typography", label: "Typography", icon: Type, description: "Font size, type, and text settings" },
    { id: "display", label: "Display", icon: Monitor, description: "Screen and layout preferences" },
    { id: "ai-responses", label: "AI Responses", icon: Settings, description: "Response settings and citations" },
    { id: "data-privacy", label: "Data & Privacy", icon: Info, description: "Data management and privacy controls" },
  ]

  const menuItems = [
    { id: "new-chat", label: "New Chat", icon: MessageSquarePlus },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings, hasSubmenu: true },
    { id: "about", label: "About Nelson-GPT", icon: Info },
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-white dark:bg-black border-r border-black dark:border-[#333333] z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-black dark:border-[#333333]">
            <h2 className="text-lg font-semibold text-black dark:text-white">Nelson-GPT</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  currentPage === item.id || (item.id === "settings" && settingsItems.some((s) => currentPage === s.id))

                return (
                  <div key={item.id}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10",
                        isActive && "bg-black/10 dark:bg-white/10 border-l-2 border-black dark:border-white",
                      )}
                      onClick={() => {
                        if (item.id === "new-chat") {
                          onNewChat()
                          onClose()
                        } else {
                          onPageChange(item.id)
                        }
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {item.hasSubmenu && <ChevronRight className="h-4 w-4 ml-auto" />}
                    </Button>

                    {item.id === "settings" &&
                      (currentPage === "settings" || settingsItems.some((s) => currentPage === s.id)) && (
                        <div className="ml-4 mt-2 space-y-1 border-l border-black/20 dark:border-white/20 pl-4">
                          {settingsItems.map((settingItem) => {
                            const SettingIcon = settingItem.icon
                            const isSettingActive = currentPage === settingItem.id

                            return (
                              <Button
                                key={settingItem.id}
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start gap-3 h-auto p-3 text-left text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5",
                                  isSettingActive &&
                                    "bg-black/5 dark:bg-white/5 border-l-2 border-black dark:border-white",
                                )}
                                onClick={() => onPageChange(settingItem.id)}
                              >
                                <SettingIcon className="h-4 w-4 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium">{settingItem.label}</div>
                                  <div className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                                    {settingItem.description}
                                  </div>
                                </div>
                              </Button>
                            )
                          })}
                        </div>
                      )}
                  </div>
                )
              })}
            </div>

            {/* Chat History (shown when on history page) */}
            {currentPage === "history" && (
              <div className="px-4 pb-4">
                <h3 className="text-sm font-medium text-black/70 dark:text-white/70 mb-3">Recent Chats</h3>
                <div className="space-y-2">
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className="group p-3 rounded-lg border border-black/10 dark:border-[#333333] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {chat.isPinned && <Pin className="h-3 w-3 text-black/50 dark:text-white/50" />}
                            <p className="text-sm font-medium text-black dark:text-white truncate">{chat.title}</p>
                          </div>
                          <p className="text-xs text-black/50 dark:text-white/50 mt-1">
                            {formatTimestamp(chat.timestamp)}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-black/50 dark:text-white/50 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
