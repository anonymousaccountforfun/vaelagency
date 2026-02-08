import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getVisitor,
  updateVisitorProfile,
  getProfileCompleteness,
} from '@/lib/chatbot/profiler'

const visitorUpdateSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  company: z.string().min(1).max(255).optional(),
  phone: z.string().min(1).max(50).optional(),
  interests: z.array(z.string()).optional(),
})

// GET /api/visitors/[id] - Get visitor profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const visitor = await getVisitor(id)

    if (!visitor) {
      return NextResponse.json({ error: 'Visitor not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...visitor,
      completeness: getProfileCompleteness(visitor),
    })
  } catch (error) {
    console.error('Get visitor error:', error)
    return NextResponse.json({ error: 'Failed to get visitor' }, { status: 500 })
  }
}

// PATCH /api/visitors/[id] - Update visitor profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parseResult = visitorUpdateSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.issues },
        { status: 400 }
      )
    }

    const existing = await getVisitor(id)
    if (!existing) {
      return NextResponse.json({ error: 'Visitor not found' }, { status: 404 })
    }

    const visitor = await updateVisitorProfile(id, parseResult.data)

    return NextResponse.json({
      ...visitor,
      completeness: getProfileCompleteness(visitor),
    })
  } catch (error) {
    console.error('Update visitor error:', error)
    return NextResponse.json({ error: 'Failed to update visitor' }, { status: 500 })
  }
}
