import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getOrCreateVisitor,
  updateVisitorProfile,
  getProfileCompleteness,
} from '@/lib/chatbot/profiler'

const visitorCreateSchema = z.object({
  visitorId: z.string().min(1),
  currentPage: z.string().optional(),
})

// POST /api/visitors - Create or get visitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parseResult = visitorCreateSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.issues },
        { status: 400 }
      )
    }

    const { visitorId, currentPage } = parseResult.data

    let visitor = await getOrCreateVisitor(visitorId)

    if (currentPage) {
      visitor = await updateVisitorProfile(visitorId, { currentPage })
    }

    return NextResponse.json({
      ...visitor,
      completeness: getProfileCompleteness(visitor),
    })
  } catch (error) {
    console.error('Create visitor error:', error)
    return NextResponse.json({ error: 'Failed to create visitor' }, { status: 500 })
  }
}
