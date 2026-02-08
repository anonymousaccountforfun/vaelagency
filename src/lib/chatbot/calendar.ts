import { config } from './config'
import type { ScheduleRequest, ScheduleResponse } from './types'

interface CalAvailability {
  busy: Array<{ start: string; end: string }>
  dateRanges: Array<{ start: string; end: string }>
}

interface CalBookingResponse {
  id: number
  uid: string
  title: string
  startTime: string
  endTime: string
  attendees: Array<{ email: string; name: string }>
}

export async function getAvailability(
  dateFrom: string,
  dateTo: string
): Promise<CalAvailability | null> {
  if (!config.cal.apiKey || !config.cal.eventTypeId) {
    console.warn('Cal.com integration not configured')
    return null
  }

  try {
    const url = new URL(`${config.cal.baseUrl}/availability`)
    url.searchParams.set('apiKey', config.cal.apiKey)
    url.searchParams.set('eventTypeId', config.cal.eventTypeId)
    url.searchParams.set('dateFrom', dateFrom)
    url.searchParams.set('dateTo', dateTo)

    const response = await fetch(url.toString())

    if (!response.ok) {
      console.error('Cal.com availability error:', await response.text())
      return null
    }

    return (await response.json()) as CalAvailability
  } catch (error) {
    console.error('Cal.com availability error:', error)
    return null
  }
}

export async function createBooking(request: ScheduleRequest): Promise<ScheduleResponse> {
  if (!config.cal.apiKey || !config.cal.eventTypeId) {
    return { success: false, error: 'Scheduling not configured' }
  }

  try {
    const response = await fetch(`${config.cal.baseUrl}/bookings?apiKey=${config.cal.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventTypeId: parseInt(config.cal.eventTypeId, 10),
        start: request.preferredDate,
        responses: {
          name: request.name,
          email: request.email,
          notes: request.notes || `Scheduled via chat widget. Visitor ID: ${request.visitorId}`,
        },
        metadata: {
          visitorId: request.visitorId,
          conversationId: request.conversationId,
          source: 'chat_widget',
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Cal.com booking error:', error)
      return { success: false, error: 'Failed to create booking' }
    }

    const booking = (await response.json()) as CalBookingResponse

    return {
      success: true,
      bookingId: booking.uid,
      bookingUrl: `https://cal.com/booking/${booking.uid}`,
    }
  } catch (error) {
    console.error('Cal.com booking error:', error)
    return { success: false, error: 'Failed to connect to scheduling service' }
  }
}

export async function getAvailableSlots(
  daysAhead = 14
): Promise<Array<{ date: string; slots: string[] }>> {
  const dateFrom = new Date().toISOString().split('T')[0]
  const dateTo = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const availability = await getAvailability(dateFrom, dateTo)

  if (!availability) {
    return []
  }

  // This is a simplified implementation
  // Real implementation would parse the busy times and return available slots
  return availability.dateRanges.map((range) => ({
    date: range.start.split('T')[0],
    slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
  }))
}
