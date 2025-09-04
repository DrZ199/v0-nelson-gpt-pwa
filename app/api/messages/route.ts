import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import type { ChatMessage } from "../sessions/route"

/**
 * GET /api/messages
 * Retrieve chat messages for a specific session
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const url = new URL(request.url)
    
    const sessionId = url.searchParams.get('sessionId')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const beforeMessageId = url.searchParams.get('beforeMessageId')

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      )
    }

    // Try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Build query
    let query = supabase
      .from('chat_messages')
      .select(`
        id,
        session_id,
        role,
        content,
        created_at,
        citations,
        reasoning,
        message_type,
        processing_time_ms,
        embedding_model,
        is_edited,
        edit_count,
        feedback_rating,
        feedback_text
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    // Pagination support
    if (beforeMessageId) {
      // Get messages before a specific message (for loading older messages)
      const { data: beforeMessage } = await supabase
        .from('chat_messages')
        .select('created_at')
        .eq('id', beforeMessageId)
        .single()
      
      if (beforeMessage) {
        query = query.lt('created_at', beforeMessage.created_at)
      }
    }

    query = query.limit(limit)

    if (offset > 0) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('[Messages API] Query error:', error)
      return NextResponse.json(
        { 
          error: "Failed to fetch messages",
          details: error.message
        },
        { status: 500 }
      )
    }

    // Get session info to verify access
    let sessionQuery = supabase
      .from('chat_sessions')
      .select('id, user_id, title')
      .eq('session_id', sessionId)
      .single()

    const { data: session, error: sessionError } = await sessionQuery

    if (sessionError) {
      console.error('[Messages API] Session query error:', sessionError)
      return NextResponse.json(
        { error: "Session not found or access denied" },
        { status: 404 }
      )
    }

    // Check access permissions
    if (session.user_id && user?.id !== session.user_id) {
      return NextResponse.json(
        { error: "Access denied to this session" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
      session: {
        id: session.id,
        title: session.title,
        sessionId: sessionId
      },
      pagination: {
        limit,
        offset,
        hasMore: (messages?.length || 0) === limit,
      }
    })

  } catch (error) {
    console.error('[Messages API] GET error:', error)
    return NextResponse.json(
      { 
        error: "Failed to fetch messages",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/messages
 * Add a new message to a chat session
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { 
      sessionId,
      role,
      content,
      citations,
      reasoning,
      messageType = 'chat',
      processingTimeMs,
      embeddingModel
    } = body

    if (!sessionId || !role || !content) {
      return NextResponse.json(
        { error: "sessionId, role, and content are required" },
        { status: 400 }
      )
    }

    if (!['user', 'assistant'].includes(role)) {
      return NextResponse.json(
        { error: "role must be 'user' or 'assistant'" },
        { status: 400 }
      )
    }

    // Try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Verify session exists and user has access
    let sessionQuery = supabase
      .from('chat_sessions')
      .select('id, user_id')
      .eq('session_id', sessionId)
      .single()

    const { data: session, error: sessionError } = await sessionQuery

    if (sessionError) {
      console.error('[Messages API] Session verification error:', sessionError)
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Check access permissions for authenticated users
    if (session.user_id && user?.id && user.id !== session.user_id) {
      return NextResponse.json(
        { error: "Access denied to this session" },
        { status: 403 }
      )
    }

    // Prepare message data
    const messageData = {
      session_id: sessionId,
      role,
      content,
      citations: citations || null,
      reasoning: reasoning || null,
      message_type: messageType,
      processing_time_ms: processingTimeMs || null,
      embedding_model: embeddingModel || null,
    }

    // Insert message
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single()

    if (error) {
      console.error('[Messages API] Insert error:', error)
      return NextResponse.json(
        { 
          error: "Failed to save message",
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message,
      messageText: "Message saved successfully"
    })

  } catch (error) {
    console.error('[Messages API] POST error:', error)
    return NextResponse.json(
      { 
        error: "Failed to save message",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/messages
 * Update an existing message (for editing, feedback, etc.)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const url = new URL(request.url)
    
    const messageId = url.searchParams.get('messageId')
    const { 
      content,
      feedbackRating,
      feedbackText,
      isEdited
    } = body

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 }
      )
    }

    // Try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Get the message and verify access
    const { data: existingMessage, error: messageError } = await supabase
      .from('chat_messages')
      .select(`
        id,
        session_id,
        role,
        content,
        edit_count,
        chat_sessions!inner(user_id)
      `)
      .eq('id', messageId)
      .single()

    if (messageError) {
      console.error('[Messages API] Message query error:', messageError)
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      )
    }

    // Check access permissions
    const sessionUserId = (existingMessage.chat_sessions as any).user_id
    if (sessionUserId && user?.id && user.id !== sessionUserId) {
      return NextResponse.json(
        { error: "Access denied to this message" },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (content !== undefined && content !== existingMessage.content) {
      updateData.content = content
      updateData.is_edited = true
      updateData.edit_count = (existingMessage.edit_count || 0) + 1
    }
    if (feedbackRating !== undefined) updateData.feedback_rating = feedbackRating
    if (feedbackText !== undefined) updateData.feedback_text = feedbackText
    if (isEdited !== undefined) updateData.is_edited = isEdited

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }

    // Update message
    const { data: updatedMessage, error } = await supabase
      .from('chat_messages')
      .update(updateData)
      .eq('id', messageId)
      .select()
      .single()

    if (error) {
      console.error('[Messages API] Update error:', error)
      return NextResponse.json(
        { 
          error: "Failed to update message",
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: updatedMessage,
      messageText: "Message updated successfully"
    })

  } catch (error) {
    console.error('[Messages API] PUT error:', error)
    return NextResponse.json(
      { 
        error: "Failed to update message",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/messages
 * Delete a specific message
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const url = new URL(request.url)
    const messageId = url.searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 }
      )
    }

    // Try to get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Verify message exists and user has access
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .select(`
        id,
        session_id,
        chat_sessions!inner(user_id)
      `)
      .eq('id', messageId)
      .single()

    if (messageError) {
      console.error('[Messages API] Message verification error:', messageError)
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      )
    }

    // Check access permissions
    const sessionUserId = (message.chat_sessions as any).user_id
    if (sessionUserId && user?.id && user.id !== sessionUserId) {
      return NextResponse.json(
        { error: "Access denied to this message" },
        { status: 403 }
      )
    }

    // Delete message
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId)

    if (error) {
      console.error('[Messages API] Delete error:', error)
      return NextResponse.json(
        { 
          error: "Failed to delete message",
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully"
    })

  } catch (error) {
    console.error('[Messages API] DELETE error:', error)
    return NextResponse.json(
      { 
        error: "Failed to delete message",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}