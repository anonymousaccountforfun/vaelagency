import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { ScheduleRequest } from '@/lib/chatbot/types'
import { createBooking } from '@/lib/chatbot/calendar'
import { getVisitor } from '@/lib/chatbot/profiler'

const scheduleRequestSchema = z.object({
  visitorId: z.string().min(1),
  conversationId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(200),
  preferredDate: z.string().optional(), // ISO date string
  notes: z.string().max(1000).optional(),
})

// POST /api/schedule - Create a booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parseResult = scheduleRequestSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.issues },
        { status: 400 }
      )
    }

    const { visitorId, conversationId, email, name, preferredDate, notes } = parseResult.data

    // Verify visitor exists
    const visitor = await getVisitor(visitorId)
    if (!visitor) {
      return NextResponse.json({ error: 'Visitor not found' }, { status: 404 })
    }

    const scheduleRequest: ScheduleRequest = {
      visitorId,
      conversationId,
      email,
      name,
      preferredDate,
      notes,
    }

    const result = await createBooking(scheduleRequest)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Schedule error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
