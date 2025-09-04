"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { UserSettings } from '@/app/api/settings/route'

interface SettingsContextType {
  settings: UserSettings
  isLoading: boolean
  error: string | null
  isDefaultSettings: boolean
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<boolean>
  resetSettings: () => Promise<boolean>
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | null>(null)

// Default settings (matches API)
const DEFAULT_SETTINGS: UserSettings = {
  user_role: 'parent',
  experience_level: 'beginner',
  primary_language: 'en',
  timezone: 'UTC',
  show_citations: true,
  show_confidence_scores: true,
  show_clinical_reasoning: true,
  response_detail_level: 'standard',
  confidence_threshold: 0.3,
  max_citations: 5,
  theme: 'system',
  font_size: 'medium',
  font_family: 'geist-sans',
  high_contrast: false,
  reduce_motion: false,
  chat_density: 'comfortable',
  show_timestamps: false,
  show_message_actions: true,
  show_typing_indicator: true,
  save_chat_history: true,
  auto_delete_after_days: 30,
  analytics_enabled: false,
  crash_reporting_enabled: true,
  default_age_unit: 'years',
  weight_unit: 'kg',
  height_unit: 'cm',
  temperature_unit: 'celsius',
  enable_push_notifications: false,
  notify_on_high_risk: true,
  notify_on_specialist_required: true,
}

interface SettingsProviderProps {
  children: React.ReactNode
  sessionId?: string
}

export function SettingsProvider({ children, sessionId }: SettingsProviderProps) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDefaultSettings, setIsDefaultSettings] = useState(true)

  // Generate session ID if not provided
  const [currentSessionId] = useState(() => sessionId || crypto.randomUUID())

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const url = new URL('/api/settings', window.location.origin)
      if (currentSessionId) {
        url.searchParams.set('sessionId', currentSessionId)
      }

      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch settings')
      }

      setSettings(data.settings)
      setIsDefaultSettings(data.isDefaultSettings)

    } catch (err) {
      console.error('[SettingsProvider] Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load settings')
      // Use default settings on error
      setSettings(DEFAULT_SETTINGS)
      setIsDefaultSettings(true)
    } finally {
      setIsLoading(false)
    }
  }, [currentSessionId])

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>): Promise<boolean> => {
    try {
      setError(null)
      
      // Optimistically update local state
      const updatedSettings = { ...settings, ...newSettings }
      setSettings(updatedSettings)

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: updatedSettings,
          sessionId: currentSessionId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update settings')
      }

      setSettings(data.settings)
      setIsDefaultSettings(false)
      
      return true

    } catch (err) {
      console.error('[SettingsProvider] Update error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      
      // Revert optimistic update on error
      await fetchSettings()
      
      return false
    }
  }, [settings, currentSessionId, fetchSettings])

  const resetSettings = useCallback(async (): Promise<boolean> => {
    try {
      setError(null)

      const url = new URL('/api/settings', window.location.origin)
      if (currentSessionId) {
        url.searchParams.set('sessionId', currentSessionId)
      }

      const response = await fetch(url.toString(), {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to reset settings')
      }

      setSettings(data.settings)
      setIsDefaultSettings(true)
      
      return true

    } catch (err) {
      console.error('[SettingsProvider] Reset error:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset settings')
      return false
    }
  }, [currentSessionId])

  const refreshSettings = useCallback(async () => {
    await fetchSettings()
  }, [fetchSettings])

  // Load settings on mount
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Apply theme settings to document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // System theme - use media query
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      
      handleChange({ matches: mediaQuery.matches } as MediaQueryListEvent)
      mediaQuery.addEventListener('change', handleChange)
      
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings.theme])

  // Apply font size settings
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl')
    
    switch (settings.font_size) {
      case 'small':
        root.classList.add('text-sm')
        break
      case 'medium':
        root.classList.add('text-base')
        break
      case 'large':
        root.classList.add('text-lg')
        break
      case 'extra-large':
        root.classList.add('text-xl')
        break
    }
  }, [settings.font_size])

  // Apply reduce motion settings
  useEffect(() => {
    if (settings.reduce_motion) {
      document.documentElement.style.setProperty('--motion-reduce', 'reduce')
    } else {
      document.documentElement.style.removeProperty('--motion-reduce')
    }
  }, [settings.reduce_motion])

  // Apply high contrast settings
  useEffect(() => {
    if (settings.high_contrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [settings.high_contrast])

  const contextValue: SettingsContextType = {
    settings,
    isLoading,
    error,
    isDefaultSettings,
    updateSettings,
    resetSettings,
    refreshSettings,
  }

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// Convenience hooks for specific settings
export function useThemeSettings() {
  const { settings, updateSettings } = useSettings()
  return {
    theme: settings.theme,
    setTheme: (theme: UserSettings['theme']) => updateSettings({ theme }),
    fontSize: settings.font_size,
    setFontSize: (font_size: UserSettings['font_size']) => updateSettings({ font_size }),
    highContrast: settings.high_contrast,
    setHighContrast: (high_contrast: boolean) => updateSettings({ high_contrast }),
    reduceMotion: settings.reduce_motion,
    setReduceMotion: (reduce_motion: boolean) => updateSettings({ reduce_motion }),
  }
}

export function useAISettings() {
  const { settings, updateSettings } = useSettings()
  return {
    showCitations: settings.show_citations,
    setShowCitations: (show_citations: boolean) => updateSettings({ show_citations }),
    showConfidenceScores: settings.show_confidence_scores,
    setShowConfidenceScores: (show_confidence_scores: boolean) => updateSettings({ show_confidence_scores }),
    showClinicalReasoning: settings.show_clinical_reasoning,
    setShowClinicalReasoning: (show_clinical_reasoning: boolean) => updateSettings({ show_clinical_reasoning }),
    responseDetailLevel: settings.response_detail_level,
    setResponseDetailLevel: (response_detail_level: UserSettings['response_detail_level']) => 
      updateSettings({ response_detail_level }),
    confidenceThreshold: settings.confidence_threshold,
    setConfidenceThreshold: (confidence_threshold: number) => updateSettings({ confidence_threshold }),
  }
}

export function usePrivacySettings() {
  const { settings, updateSettings } = useSettings()
  return {
    saveChatHistory: settings.save_chat_history,
    setSaveChatHistory: (save_chat_history: boolean) => updateSettings({ save_chat_history }),
    analyticsEnabled: settings.analytics_enabled,
    setAnalyticsEnabled: (analytics_enabled: boolean) => updateSettings({ analytics_enabled }),
    crashReportingEnabled: settings.crash_reporting_enabled,
    setCrashReportingEnabled: (crash_reporting_enabled: boolean) => updateSettings({ crash_reporting_enabled }),
    autoDeleteAfterDays: settings.auto_delete_after_days,
    setAutoDeleteAfterDays: (auto_delete_after_days: number) => updateSettings({ auto_delete_after_days }),
  }
}