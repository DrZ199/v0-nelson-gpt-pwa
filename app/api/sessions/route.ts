import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export interface ChatSession {
  id: string
  session_id: string
  title: string
  created_at: string
  updated_at: string
  last_message_at: string
  message_count: number
  is_archived: boolean
  is_starred: boolean
  tags: string[]
  patient_age_years?: number
  patient_age_months?: number
  patient_weight_kg?: number
  primary_symptoms?: string[]
  risk_level?: 'low' | 'medium' | 'high'
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  citations?: Array<{
    page_number: number
    chapter_title: string
    section_title: string
    similarity_score?: number
  }>
  reasoning?: {
    query_decomposition: string[]
    clinical_reasoning: string[]
    confidence_score: number
    risk_level: 'low' | 'medium' | 'high'
    requires_specialist: boolean
    search_queries?: string[]
  }
  message_type?: 'chat' | 'system' | 'error' | 'warning'
  processing_time_ms?: number
  embedding_model?: string
}

/**
 * GET /api/sessions
 * Retrieve chat sessions for user or anonymous sessions
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const url = new URL(request.url)
    
    const sessionId = url.searchParams.get('sessionId')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const includeArchived = url.searchParams.get('includeArchived') === 'true'

    // Try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError && !sessionId) {
      return NextResponse.json(
        { error: "Authentication required or sessionId must be provided" },
        { status: 401 }
      )
    }

    // Build query
    let query = supabase
      .from('chat_sessions')
      .select(`
        id,
        session_id,
        title,
        created_at,
        updated_at,
        last_message_at,
        message_count,
        is_archived,
        is_starred,
        tags,
        patient_age_years,
        patient_age_months,
        patient_weight_kg,
        primary_symptoms,
        risk_level
      `)
      .order('last_message_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    // Filter by user or session
    if (user?.id) {
      query = query.eq('user_id', user.id)
    } else if (sessionId) {
      // For anonymous users, only return the specific session
      query = query.eq('session_id', sessionId)
    } else {
      return NextResponse.json(
        { error: "No user or session identifier provided" },
        { status: 400 }
      )
    }

    // Filter archived sessions
    if (!includeArchived) {
      query = query.eq('is_archived', false)
    }

    const { data: sessions, error } = await query

    if (error) {
      console.error('[Sessions API] Query error:', error)
      return NextResponse.json(
        { 
          error: "Failed to fetch sessions",
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
      total: sessions?.length || 0,
      hasMore: (sessions?.length || 0) === limit,
    })

  } catch (error) {
    console.error('[Sessions API] GET error:', error)
    return NextResponse.json(
      { 
        error: "Failed to fetch sessions",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sessions
 * Create a new chat session or update existing one
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { 
      sessionId,
      title,
      patientAge,
      patientWeight,
      symptoms,
      riskLevel,
      tags
    } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      )
    }

    // Try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Prepare session data
    const sessionData = {
      session_id: sessionId,
      user_id: user?.id || null,
      title: title || 'New Chat',
      patient_age_years: patientAge?.years || null,
      patient_age_months: patientAge?.months || null,
      patient_weight_kg: patientWeight || null,
      primary_symptoms: symptoms || [],
      risk_level: riskLevel || null,
      tags: tags || [],
    }

    // Upsert session
    const { data: session, error } = await supabase
      .from('chat_sessions')
      .upsert(sessionData, {
        onConflict: 'session_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      console.error('[Sessions API] Upsert error:', error)
      return NextResponse.json(
        { 
          error: "Failed to create/update session",
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      session,
      message: "Session created/updated successfully"
    })

  } catch (error) {
    console.error('[Sessions API] POST error:', error)
    return NextResponse.json(
      { 
        error: "Failed to create session",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/sessions/[sessionId]
 * Update session metadata
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')
    
    const { 
      title,
      isArchived,
      isStarred,
      tags,
      patientAge,
      patientWeight,
      symptoms,
      riskLevel
    } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      )
    }

    // Try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Prepare update data (only include non-undefined values)
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (isArchived !== undefined) updateData.is_archived = isArchived
    if (isStarred !== undefined) updateData.is_starred = isStarred
    if (tags !== undefined) updateData.tags = tags
    if (patientAge?.years !== undefined) updateData.patient_age_years = patientAge.years
    if (patientAge?.months !== undefined) updateData.patient_age_months = patientAge.months
    if (patientWeight !== undefined) updateData.patient_weight_kg = patientWeight
    if (symptoms !== undefined) updateData.primary_symptoms = symptoms
    if (riskLevel !== undefined) updateData.risk_level = riskLevel

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }

    // Build update query
    let query = supabase
      .from('chat_sessions')
      .update(updateData)
      .eq('session_id', sessionId)

    // If authenticated, also check user ownership
    if (user?.id) {
      query = query.eq('user_id', user.id)
    }

    const { data: session, error } = await query.select().single()

    if (error) {
      console.error('[Sessions API] Update error:', error)
      return NextResponse.json(
        { 
          error: "Failed to update session",
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      session,
      message: "Session updated successfully"
    })

  } catch (error) {
    console.error('[Sessions API] PUT error:', error)
    return NextResponse.json(
      { 
        error: "Failed to update session",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sessions
 * Delete chat session and all its messages
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      )
    }

    // Try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Delete messages first (due to foreign key constraints)
    let deleteMessagesQuery = supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', sessionId)

    const { error: messagesError } = await deleteMessagesQuery

    if (messagesError) {
      console.error('[Sessions API] Delete messages error:', messagesError)
      return NextResponse.json(
        { 
          error: "Failed to delete session messages",
          details: messagesError.message
        },
        { status: 500 }
      )
    }

    // Delete session
    let deleteSessionQuery = supabase
      .from('chat_sessions')
      .delete()
      .eq('session_id', sessionId)

    // If authenticated, also check user ownership
    if (user?.id) {
      deleteSessionQuery = deleteSessionQuery.eq('user_id', user.id)
    }

    const { error: sessionError } = await deleteSessionQuery

    if (sessionError) {
      console.error('[Sessions API] Delete session error:', sessionError)
      return NextResponse.json(
        { 
          error: "Failed to delete session",
          details: sessionError.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Session and all messages deleted successfully"
    })

  } catch (error) {
    console.error('[Sessions API] DELETE error:', error)
    return NextResponse.json(
      { 
        error: "Failed to delete session",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}