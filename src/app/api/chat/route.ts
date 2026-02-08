import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import type { ChatMessage, ChatResponse } from '@/lib/chatbot/types'
import { query } from '@/lib/chatbot/db'
import { generateResponse } from '@/lib/chatbot/ai'
import { searchKnowledge, formatContextForPrompt } from '@/lib/chatbot/knowledge'
import { getOrCreateVisitor, updateVisitorProfile } from '@/lib/chatbot/profiler'
import { syncLeadToCrm, generateConversationSummary, shouldSyncToCrm } from '@/lib/chatbot/crm'

const chatRequestSchema = z.object({
  visitorId: z.string().min(1),
  message: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
  currentPage: z.string().optional(),
})

// POST /api/chat - Send a message and get a response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parseResult = chatRequestSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.issues },
        { status: 400 }
      )
    }

    const { visitorId, message, conversationId: existingConversationId, currentPage } = parseResult.data

    // Get or create visitor profile
    let visitor = await getOrCreateVisitor(visitorId)

    // Update page history if provided
    if (currentPage) {
      visitor = await updateVisitorProfile(visitorId, { currentPage })
    }

    // Get or create conversation
    let conversationId = existingConversationId
    if (!conversationId) {
      const result = await query<{ id: string }>(
        'INSERT INTO conversations (visitor_id) VALUES ($1) RETURNING id',
        [visitorId]
      )
      conversationId = result.rows[0].id
    }

    // Store user message
    const userMessageId = uuidv4()
    await query(
      `INSERT INTO messages (id, conversation_id, role, content)
       VALUES ($1, $2, 'user', $3)`,
      [userMessageId, conversationId, message]
    )

    // Get conversation history
    const historyResult = await query<{
      id: string
      role: string
      content: string
      created_at: Date
      metadata: Record<string, unknown>
    }>(
      `SELECT id, role, content, created_at, metadata
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT 20`,
      [conversationId]
    )

    const messages: ChatMessage[] = historyResult.rows.map((row) => ({
      id: row.id,
      role: row.role as ChatMessage['role'],
      content: row.content,
      timestamp: new Date(row.created_at).getTime(),
      metadata: row.metadata,
    }))

    // Search knowledge base for relevant context
    const knowledgeResults = await searchKnowledge(message)
    const context = formatContextForPrompt(knowledgeResults)

    // Generate AI response
    const aiResult = await generateResponse({ messages, context })

    // Extract profile data and update visitor
    let profileUpdates: Partial<typeof visitor> | undefined
    if (aiResult.profileData) {
      visitor = await updateVisitorProfile(visitorId, aiResult.profileData)
      profileUpdates = aiResult.profileData
    }

    // Store assistant message
    const assistantMessageId = uuidv4()
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: aiResult.content,
      timestamp: Date.now(),
      metadata: {
        sources: knowledgeResults.map((r) => r.chunk.source),
      },
    }

    await query(
      `INSERT INTO messages (id, conversation_id, role, content, metadata)
       VALUES ($1, $2, 'assistant', $3, $4)`,
      [assistantMessageId, conversationId, aiResult.content, assistantMessage.metadata]
    )

    // Sync to CRM if profile is complete enough (must await in serverless)
    if (await shouldSyncToCrm(visitor)) {
      const summary = generateConversationSummary(messages)
      try {
        await syncLeadToCrm(visitor, conversationId, summary)
      } catch (err) {
        console.error('CRM sync failed:', err)
      }
    }

    const response: ChatResponse = {
      conversationId,
      message: assistantMessage,
      profileUpdates,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}
