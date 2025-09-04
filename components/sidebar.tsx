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
  Star,
  StarOff,
  ChevronRight,
  User,
  Type,
  Palette,
  Monitor,
  Loader2,
  AlertTriangle,
  Calendar,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatSessions } from "@/lib/chat-context"
import type { ChatSession } from "@/app/api/sessions/route"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPage: string
  onPageChange: (page: string) => void
  onNewChat: () => void
}

export function Sidebar({ isOpen, onClose, currentPage, onPageChange, onNewChat }: SidebarProps) {
  const { 
    sessions, 
    currentSession, 
    isLoading, 
    loadSession, 
    createNewSession, 
    updateSessionMetadata,
    deleteSession 
  } = useChatSessions()
  
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    // Format as date if older than a week
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const handleNewChat = () => {
    const newSessionId = createNewSession()
    onNewChat()
    onClose()
  }

  const handleLoadSession = async (session: ChatSession) => {
    try {
      await loadSession(session.session_id)
      onPageChange('chat')
      onClose()
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  const handleEditTitle = (session: ChatSession) => {
    setEditingSessionId(session.id)
    setEditTitle(session.title)
  }

  const handleSaveTitle = async (session: ChatSession) => {
    if (editTitle.trim() && editTitle !== session.title) {
      try {
        await updateSessionMetadata({ title: editTitle.trim() })
      } catch (error) {
        console.error('Failed to update session title:', error)
      }
    }
    setEditingSessionId(null)
    setEditTitle("")
  }

  const handleCancelEdit = () => {
    setEditingSessionId(null)
    setEditTitle("")
  }

  const handleToggleStar = async (session: ChatSession, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await updateSessionMetadata({ is_starred: !session.is_starred })
    } catch (error) {
      console.error('Failed to toggle star:', error)
    }
  }

  const handleDeleteSession = async (session: ChatSession, event: React.MouseEvent) => {
    event.stopPropagation()
    if (confirm(`Are you sure you want to delete "${session.title}"? This action cannot be undone.`)) {
      try {
        await deleteSession(session.session_id)
      } catch (error) {
        console.error('Failed to delete session:', error)
      }
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
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
                          handleNewChat()
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-black/70 dark:text-white/70">Recent Chats</h3>
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin text-black/50 dark:text-white/50" />}
                </div>
                
                <div className="space-y-2">
                  {sessions.length === 0 && !isLoading ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-black/30 dark:text-white/30 mx-auto mb-3" />
                      <p className="text-sm text-black/60 dark:text-white/60 mb-2">No chat history yet</p>
                      <p className="text-xs text-black/50 dark:text-white/50 mb-4">
                        Start a new conversation to see your chat history here
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNewChat}
                        className="border-black/20 dark:border-white/20"
                      >
                        <MessageSquarePlus className="h-4 w-4 mr-2" />
                        New Chat
                      </Button>
                    </div>
                  ) : (
                    // Sort sessions: starred first, then by last message time
                    [...sessions]
                      .sort((a, b) => {
                        if (a.is_starred && !b.is_starred) return -1
                        if (!a.is_starred && b.is_starred) return 1
                        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
                      })
                      .map((session) => (
                        <div
                          key={session.id}
                          className={cn(
                            "group p-3 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors",
                            currentSession?.session_id === session.session_id 
                              ? "border-black dark:border-white bg-black/5 dark:bg-white/5" 
                              : "border-black/10 dark:border-[#333333]"
                          )}
                          onClick={() => handleLoadSession(session)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {editingSessionId === session.id ? (
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveTitle(session)
                                    if (e.key === 'Escape') handleCancelEdit()
                                  }}
                                  onBlur={() => handleSaveTitle(session)}
                                  className="w-full text-sm font-medium bg-transparent border-b border-black/20 dark:border-white/20 focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  {session.is_starred && (
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  )}
                                  <p className="text-sm font-medium text-black dark:text-white truncate">
                                    {session.title}
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-black/50 dark:text-white/50">
                                  {formatTimestamp(session.last_message_at)}
                                </p>
                                
                                {session.message_count > 0 && (
                                  <>
                                    <span className="text-xs text-black/30 dark:text-white/30">•</span>
                                    <p className="text-xs text-black/50 dark:text-white/50">
                                      {session.message_count} message{session.message_count !== 1 ? 's' : ''}
                                    </p>
                                  </>
                                )}

                                {session.risk_level && (
                                  <>
                                    <span className="text-xs text-black/30 dark:text-white/30">•</span>
                                    <p className={cn("text-xs", getRiskLevelColor(session.risk_level))}>
                                      {session.risk_level} risk
                                    </p>
                                  </>
                                )}
                              </div>

                              {session.primary_symptoms && session.primary_symptoms.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {session.primary_symptoms.slice(0, 3).map((symptom, index) => (
                                    <span
                                      key={index}
                                      className="text-xs px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded text-black/70 dark:text-white/70"
                                    >
                                      {symptom}
                                    </span>
                                  ))}
                                  {session.primary_symptoms.length > 3 && (
                                    <span className="text-xs text-black/50 dark:text-white/50">
                                      +{session.primary_symptoms.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-black/50 dark:text-white/50 hover:text-yellow-500"
                                onClick={(e) => handleToggleStar(session, e)}
                                title={session.is_starred ? "Remove from favorites" : "Add to favorites"}
                              >
                                {session.is_starred ? (
                                  <StarOff className="h-3 w-3" />
                                ) : (
                                  <Star className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditTitle(session)
                                }}
                                title="Edit title"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-black/50 dark:text-white/50 hover:text-red-500"
                                onClick={(e) => handleDeleteSession(session, e)}
                                title="Delete chat"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {sessions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNewChat}
                      className="w-full border-black/20 dark:border-white/20 text-black dark:text-white"
                    >
                      <MessageSquarePlus className="h-4 w-4 mr-2" />
                      New Chat
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
