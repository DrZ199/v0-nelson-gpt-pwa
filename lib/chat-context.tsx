"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ChatMessage, ChatSession } from '@/app/api/sessions/route'

interface ChatContextType {
  // Current session
  currentSession: ChatSession | null
  sessionId: string
  
  // Messages
  messages: ChatMessage[]
  isLoadingMessages: boolean
  
  // Session management
  sessions: ChatSession[]
  isLoadingSessions: boolean
  
  // Actions
  sendMessage: (content: string) => Promise<ChatMessage | null>
  loadSession: (sessionId: string) => Promise<void>
  createNewSession: () => string
  updateSessionMetadata: (updates: Partial<ChatSession>) => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
  
  // Message actions
  editMessage: (messageId: string, newContent: string) => Promise<void>
  rateMessage: (messageId: string, rating: number, feedback?: string) => Promise<void>
  
  // State
  isProcessing: boolean
  error: string | null
}

const ChatContext = createContext<ChatContextType | null>(null)

interface ChatProviderProps {
  children: React.ReactNode
  initialSessionId?: string
}

export function ChatProvider({ children, initialSessionId }: ChatProviderProps) {
  // State
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [sessionId, setSessionId] = useState(() => initialSessionId || crypto.randomUUID())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  
  // Loading states
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)

  // Load chat sessions
  const loadSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true)
      setError(null)

      const url = new URL('/api/sessions', window.location.origin)
      url.searchParams.set('sessionId', sessionId)
      url.searchParams.set('limit', '20')

      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load sessions')
      }

      setSessions(data.sessions)

    } catch (err) {
      console.error('[ChatProvider] Load sessions error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setIsLoadingSessions(false)
    }
  }, [sessionId])

  // Load messages for current session
  const loadMessages = useCallback(async (targetSessionId: string) => {
    try {
      setIsLoadingMessages(true)
      setError(null)

      const url = new URL('/api/messages', window.location.origin)
      url.searchParams.set('sessionId', targetSessionId)
      url.searchParams.set('limit', '50')

      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load messages')
      }

      setMessages(data.messages)
      
      // Update current session info if available
      if (data.session) {
        setCurrentSession(prev => prev ? { ...prev, ...data.session } : null)
      }

    } catch (err) {
      console.error('[ChatProvider] Load messages error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load messages')
      setMessages([]) // Clear messages on error
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  // Send a message (user message + get AI response)
  const sendMessage = useCallback(async (content: string): Promise<ChatMessage | null> => {
    try {
      setIsProcessing(true)
      setError(null)

      // Create user message locally first
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        session_id: sessionId,
        role: 'user',
        content: content.trim(),
        created_at: new Date().toISOString(),
        message_type: 'chat'
      }

      // Add user message to local state
      setMessages(prev => [...prev, userMessage])

      // Create/update session if needed
      await createOrUpdateSession(sessionId)

      // Send to chat API (this will handle saving both user message and AI response)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId: sessionId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // The chat API automatically saves messages, so we need to reload them
      await loadMessages(sessionId)

      // Return the last message (AI response)
      const lastMessage = messages.find(m => m.role === 'assistant' && m.created_at > userMessage.created_at)
      return lastMessage || null

    } catch (err) {
      console.error('[ChatProvider] Send message error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        session_id: sessionId,
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your message. Please try again.',
        created_at: new Date().toISOString(),
        message_type: 'error'
      }
      
      setMessages(prev => [...prev, errorMessage])
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [sessionId, loadMessages, messages])

  // Create or update session
  const createOrUpdateSession = useCallback(async (targetSessionId: string, metadata?: Partial<ChatSession>) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: targetSessionId,
          title: metadata?.title || 'New Chat',
          symptoms: metadata?.primary_symptoms || [],
          riskLevel: metadata?.risk_level || null,
          tags: metadata?.tags || [],
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create/update session')
      }

      setCurrentSession(data.session)
      
      // Reload sessions list
      await loadSessions()

    } catch (err) {
      console.error('[ChatProvider] Create/update session error:', err)
      // Don't throw here as this is often called automatically
    }
  }, [loadSessions])

  // Load a specific session
  const loadSession = useCallback(async (targetSessionId: string) => {
    setSessionId(targetSessionId)
    await Promise.all([
      loadMessages(targetSessionId),
      loadSessions()
    ])
  }, [loadMessages, loadSessions])

  // Create new session
  const createNewSession = useCallback(() => {
    const newSessionId = crypto.randomUUID()
    setSessionId(newSessionId)
    setMessages([])
    setCurrentSession(null)
    setError(null)
    return newSessionId
  }, [])

  // Update session metadata
  const updateSessionMetadata = useCallback(async (updates: Partial<ChatSession>) => {
    try {
      const url = new URL('/api/sessions', window.location.origin)
      url.searchParams.set('sessionId', sessionId)

      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update session')
      }

      setCurrentSession(data.session)
      await loadSessions() // Refresh sessions list

    } catch (err) {
      console.error('[ChatProvider] Update session error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update session')
    }
  }, [sessionId, loadSessions])

  // Delete session
  const deleteSession = useCallback(async (targetSessionId: string) => {
    try {
      const url = new URL('/api/sessions', window.location.origin)
      url.searchParams.set('sessionId', targetSessionId)

      const response = await fetch(url.toString(), {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete session')
      }

      // If we deleted the current session, create a new one
      if (targetSessionId === sessionId) {
        createNewSession()
      }

      await loadSessions() // Refresh sessions list

    } catch (err) {
      console.error('[ChatProvider] Delete session error:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete session')
    }
  }, [sessionId, createNewSession, loadSessions])

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      const url = new URL('/api/messages', window.location.origin)
      url.searchParams.set('messageId', messageId)

      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newContent,
          isEdited: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to edit message')
      }

      // Update local messages
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, is_edited: true, edit_count: (msg.edit_count || 0) + 1 }
          : msg
      ))

    } catch (err) {
      console.error('[ChatProvider] Edit message error:', err)
      setError(err instanceof Error ? err.message : 'Failed to edit message')
    }
  }, [])

  // Rate message
  const rateMessage = useCallback(async (messageId: string, rating: number, feedback?: string) => {
    try {
      const url = new URL('/api/messages', window.location.origin)
      url.searchParams.set('messageId', messageId)

      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackRating: rating,
          feedbackText: feedback,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to rate message')
      }

      // Update local messages
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedback_rating: rating, feedback_text: feedback }
          : msg
      ))

    } catch (err) {
      console.error('[ChatProvider] Rate message error:', err)
      setError(err instanceof Error ? err.message : 'Failed to rate message')
    }
  }, [])

  // Load initial data
  useEffect(() => {
    loadSessions()
    if (sessionId) {
      loadMessages(sessionId)
    }
  }, [loadSessions, loadMessages, sessionId])

  const contextValue: ChatContextType = {
    currentSession,
    sessionId,
    messages,
    isLoadingMessages,
    sessions,
    isLoadingSessions,
    sendMessage,
    loadSession,
    createNewSession,
    updateSessionMetadata,
    deleteSession,
    editMessage,
    rateMessage,
    isProcessing,
    error,
  }

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

// Convenience hooks for specific functionality
export function useChatMessages() {
  const { messages, isLoadingMessages, sendMessage, editMessage, rateMessage } = useChat()
  return {
    messages,
    isLoading: isLoadingMessages,
    sendMessage,
    editMessage,
    rateMessage,
  }
}

export function useChatSessions() {
  const { 
    sessions, 
    currentSession, 
    isLoadingSessions, 
    loadSession, 
    createNewSession, 
    updateSessionMetadata, 
    deleteSession 
  } = useChat()
  
  return {
    sessions,
    currentSession,
    isLoading: isLoadingSessions,
    loadSession,
    createNewSession,
    updateSessionMetadata,
    deleteSession,
  }
}