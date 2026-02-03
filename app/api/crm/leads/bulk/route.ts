import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import type { PipelineStage } from '@/lib/crm/types'

// DELETE - Bulk delete leads
export async function DELETE(request: NextRequest) {
  try {
    const db = getDb()
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      )
    }

    // Delete leads
    const result = await db`
      DELETE FROM crm_leads WHERE id = ANY(${ids}::text[])
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      deleted: result.length,
      ids: result.map(r => r.id)
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete leads' },
      { status: 500 }
    )
  }
}

// PATCH - Bulk update leads (e.g., change stage)
export async function PATCH(request: NextRequest) {
  try {
    const db = getDb()
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { ids, updates } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      )
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'updates object is required' },
        { status: 400 }
      )
    }

    // Validate stage if provided
    const validStages: PipelineStage[] = [
      'awareness', 'capture', 'nurture', 'qualify', 'propose',
      'close', 'onboard', 'deliver', 'expand'
    ]
    if (updates.stage && !validStages.includes(updates.stage)) {
      return NextResponse.json(
        { error: 'Invalid stage value' },
        { status: 400 }
      )
    }

    // Build update query
    const result = await db`
      UPDATE crm_leads
      SET
        stage = COALESCE(${updates.stage || null}, stage),
        priority = COALESCE(${updates.priority || null}, priority),
        updated_at = NOW(),
        last_activity_at = NOW()
      WHERE id = ANY(${ids}::text[])
      RETURNING id
    `

    // Log activity for each updated lead if stage changed
    if (updates.stage) {
      for (const row of result) {
        await db`
          INSERT INTO crm_activities (lead_id, activity_type, description, agent, agent_type)
          VALUES (${row.id}, 'stage_changed', ${'Stage bulk updated to ' + updates.stage}, 'User', 'human')
        `
      }
    }

    return NextResponse.json({
      success: true,
      updated: result.length,
      ids: result.map(r => r.id)
    })
  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update leads' },
      { status: 500 }
    )
  }
}
