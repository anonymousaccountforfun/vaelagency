import { NextRequest, NextResponse } from 'next/server'
import type { ChatMessage } from '@/lib/chatbot/types'
import { query } from '@/lib/chatbot/db'

// GET /api/chat/conversations/[id] - Get conversation history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify conversation exists
    const convResult = await query<{ id: string; visitor_id: string }>(
      'SELECT id, visitor_id FROM conversations WHERE id = $1',
      [id]
    )

    if (convResult.rows.length === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Get messages
    const messagesResult = await query<{
      id: string
      role: string
      content: string
      created_at: Date
      metadata: Record<string, unknown>
    }>(
      `SELECT id, role, content, created_at, metadata
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [id]
    )

    const messages: ChatMessage[] = messagesResult.rows.map((row) => ({
      id: row.id,
      role: row.role as ChatMessage['role'],
      content: row.content,
      timestamp: new Date(row.created_at).getTime(),
      metadata: row.metadata,
    }))

    return NextResponse.json({
      conversationId: id,
      visitorId: convResult.rows[0].visitor_id,
      messages,
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json({ error: 'Failed to get conversation' }, { status: 500 })
  }
}
