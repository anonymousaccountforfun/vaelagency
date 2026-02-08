import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/chatbot/calendar'

// GET /api/schedule/availability - Get available time slots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const daysAhead = parseInt(searchParams.get('days') || '14', 10)

    const slots = await getAvailableSlots(Math.min(daysAhead, 30))

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Get availability error:', error)
    return NextResponse.json({ error: 'Failed to get availability' }, { status: 500 })
  }
}
