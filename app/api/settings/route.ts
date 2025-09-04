import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Type definitions for user settings
export interface UserSettings {
  id?: string
  user_id?: string
  session_id?: string
  
  // Profile settings
  user_role?: 'parent' | 'healthcare_provider' | 'medical_student' | 'researcher'
  experience_level?: 'beginner' | 'intermediate' | 'advanced'
  primary_language?: string
  timezone?: string
  
  // AI Response preferences
  show_citations?: boolean
  show_confidence_scores?: boolean
  show_clinical_reasoning?: boolean
  response_detail_level?: 'brief' | 'standard' | 'detailed'
  confidence_threshold?: number
  max_citations?: number
  
  // Appearance settings
  theme?: 'light' | 'dark' | 'system'
  font_size?: 'small' | 'medium' | 'large' | 'extra-large'
  font_family?: 'geist-sans' | 'geist-mono' | 'system'
  high_contrast?: boolean
  reduce_motion?: boolean
  
  // Display settings
  chat_density?: 'compact' | 'comfortable' | 'spacious'
  show_timestamps?: boolean
  show_message_actions?: boolean
  show_typing_indicator?: boolean
  
  // Data & Privacy settings
  save_chat_history?: boolean
  auto_delete_after_days?: number
  analytics_enabled?: boolean
  crash_reporting_enabled?: boolean
  
  // Medical-specific settings
  default_age_unit?: 'days' | 'weeks' | 'months' | 'years'
  weight_unit?: 'kg' | 'lbs'
  height_unit?: 'cm' | 'inches'
  temperature_unit?: 'celsius' | 'fahrenheit'
  
  // Notification preferences
  enable_push_notifications?: boolean
  notify_on_high_risk?: boolean
  notify_on_specialist_required?: boolean
}

// Default settings
const DEFAULT_SETTINGS: Partial<UserSettings> = {
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

/**
 * GET /api/settings
 * Retrieve user settings for authenticated user or session
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')
    
    // Try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError && !sessionId) {
      return NextResponse.json(
        { error: "Authentication required or sessionId must be provided" },
        { status: 401 }
      )
    }

    let settings: UserSettings | null = null

    // Try to get settings from database
    if (user?.id) {
      // Authenticated user - get by user_id
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (!error && data) {
        settings = data
      }
    } else if (sessionId) {
      // Anonymous user - get by session_id
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('session_id', sessionId)
        .single()
      
      if (!error && data) {
        settings = data
      }
    }

    // Merge with defaults if settings exist, otherwise return defaults
    const finalSettings = settings 
      ? { ...DEFAULT_SETTINGS, ...settings }
      : DEFAULT_SETTINGS

    return NextResponse.json({
      success: true,
      settings: finalSettings,
      isDefaultSettings: !settings,
      userId: user?.id || null,
      sessionId: sessionId || null,
    })

  } catch (error) {
    console.error('[Settings API] GET error:', error)
    return NextResponse.json(
      { 
        error: "Failed to retrieve settings",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/settings
 * Create or update user settings
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { settings, sessionId } = body as { settings: UserSettings; sessionId?: string }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: "Settings object is required" },
        { status: 400 }
      )
    }

    // Try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError && !sessionId) {
      return NextResponse.json(
        { error: "Authentication required or sessionId must be provided" },
        { status: 401 }
      )
    }

    // Validate settings values
    const validationError = validateSettings(settings)
    if (validationError) {
      return NextResponse.json(
        { error: "Invalid settings", details: validationError },
        { status: 400 }
      )
    }

    // Prepare settings object for database
    const settingsToSave: UserSettings = {
      ...settings,
      user_id: user?.id || undefined,
      session_id: sessionId || undefined,
    }

    // Remove undefined values
    Object.keys(settingsToSave).forEach(key => {
      if ((settingsToSave as any)[key] === undefined) {
        delete (settingsToSave as any)[key]
      }
    })

    // Upsert settings
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(settingsToSave, {
        onConflict: user?.id ? 'user_id' : 'session_id'
      })
      .select()
      .single()

    if (error) {
      console.error('[Settings API] Upsert error:', error)
      return NextResponse.json(
        { 
          error: "Failed to save settings",
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      settings: data,
      message: "Settings saved successfully"
    })

  } catch (error) {
    console.error('[Settings API] POST error:', error)
    return NextResponse.json(
      { 
        error: "Failed to save settings",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/settings
 * Reset settings to defaults (delete custom settings)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')
    
    // Try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError && !sessionId) {
      return NextResponse.json(
        { error: "Authentication required or sessionId must be provided" },
        { status: 401 }
      )
    }

    // Delete settings
    let query = supabase.from('user_settings').delete()
    
    if (user?.id) {
      query = query.eq('user_id', user.id)
    } else if (sessionId) {
      query = query.eq('session_id', sessionId)
    } else {
      return NextResponse.json(
        { error: "No user or session identifier provided" },
        { status: 400 }
      )
    }

    const { error } = await query

    if (error) {
      console.error('[Settings API] Delete error:', error)
      return NextResponse.json(
        { 
          error: "Failed to reset settings",
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS,
      message: "Settings reset to defaults"
    })

  } catch (error) {
    console.error('[Settings API] DELETE error:', error)
    return NextResponse.json(
      { 
        error: "Failed to reset settings",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * Validate settings object
 */
function validateSettings(settings: UserSettings): string | null {
  // Validate user_role
  if (settings.user_role && !['parent', 'healthcare_provider', 'medical_student', 'researcher'].includes(settings.user_role)) {
    return 'Invalid user_role value'
  }

  // Validate experience_level
  if (settings.experience_level && !['beginner', 'intermediate', 'advanced'].includes(settings.experience_level)) {
    return 'Invalid experience_level value'
  }

  // Validate confidence_threshold
  if (settings.confidence_threshold !== undefined && (settings.confidence_threshold < 0 || settings.confidence_threshold > 1)) {
    return 'confidence_threshold must be between 0 and 1'
  }

  // Validate max_citations
  if (settings.max_citations !== undefined && (settings.max_citations < 1 || settings.max_citations > 20)) {
    return 'max_citations must be between 1 and 20'
  }

  // Validate theme
  if (settings.theme && !['light', 'dark', 'system'].includes(settings.theme)) {
    return 'Invalid theme value'
  }

  // Validate font_size
  if (settings.font_size && !['small', 'medium', 'large', 'extra-large'].includes(settings.font_size)) {
    return 'Invalid font_size value'
  }

  // Validate response_detail_level
  if (settings.response_detail_level && !['brief', 'standard', 'detailed'].includes(settings.response_detail_level)) {
    return 'Invalid response_detail_level value'
  }

  // Validate auto_delete_after_days
  if (settings.auto_delete_after_days !== undefined && settings.auto_delete_after_days <= 0) {
    return 'auto_delete_after_days must be greater than 0'
  }

  return null
}