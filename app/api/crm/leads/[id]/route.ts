import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { AgentType } from '@/lib/crm'

// GET - Get single lead with notes, tasks, activities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb()
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id: rawId } = await params
    // Ensure ID is a clean string (trim whitespace, handle encoding)
    const id = String(rawId).trim()

    // Validate ID format
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { error: 'Invalid lead ID', receivedId: rawId },
        { status: 400 }
      )
    }

    // Fetch lead from database
    const leads = await db`
      SELECT * FROM crm_leads WHERE id = ${id}
    `

    if (leads.length === 0) {
      // Lead not found - return 404 with the requested ID for debugging
      return NextResponse.json(
        { error: 'Lead not found', requestedId: id },
        { status: 404 }
      )
    }

    const l = leads[0]

    // Fetch related data
    const [notes, tasks, activities] = await Promise.all([
      db`SELECT * FROM crm_lead_notes WHERE lead_id = ${id} ORDER BY created_at DESC`,
      db`SELECT * FROM crm_lead_tasks WHERE lead_id = ${id} ORDER BY created_at DESC`,
      db`SELECT * FROM crm_activities WHERE lead_id = ${id} ORDER BY created_at DESC LIMIT 50`,
    ])

    // Map database fields to API format
    const lead = {
      id: l.id,
      // Basic contact
      companyName: l.company_name,
      contactName: l.contact_name,
      email: l.email || '',
      emailConfidence: l.email_confidence,
      phone: l.phone,
      website: l.website,
      address: l.address,
      industry: l.industry,
      // Person details (Apollo)
      firstName: l.first_name,
      lastName: l.last_name,
      jobTitle: l.job_title,
      linkedinUrl: l.linkedin_url,
      seniority: l.seniority,
      department: l.department,
      personalEmail: l.personal_email,
      mobilePhone: l.mobile_phone,
      corporatePhone: l.corporate_phone,
      twitterUrl: l.twitter_url,
      facebookUrl: l.facebook_url,
      githubUrl: l.github_url,
      contactCity: l.contact_city,
      contactState: l.contact_state,
      contactCountry: l.contact_country,
      photoUrl: l.photo_url,
      // Company details (Apollo)
      employeeCount: l.employee_count,
      companyLinkedin: l.company_linkedin,
      annualRevenue: l.annual_revenue,
      annualRevenueMin: l.annual_revenue_min,
      annualRevenueMax: l.annual_revenue_max,
      foundedYear: l.founded_year,
      companyDescription: l.company_description,
      companyKeywords: l.company_keywords,
      companyPhone: l.company_phone,
      companyCity: l.company_city,
      companyState: l.company_state,
      companyCountry: l.company_country,
      technologies: l.technologies,
      sicCodes: l.sic_codes,
      naicsCodes: l.naics_codes,
      alexaRanking: l.alexa_ranking,
      companyLogoUrl: l.company_logo_url,
      // Apollo metadata
      apolloId: l.apollo_id,
      apolloLastUpdated: l.apollo_last_updated,
      // Pipeline
      stage: l.stage,
      priority: l.priority,
      score: l.score,
      source: l.source,
      sourceDetails: l.source_details,
      rating: l.rating,
      reviews: l.reviews,
      tags: l.tags || [],
      createdAt: l.created_at,
      updatedAt: l.updated_at,
      lastActivityAt: l.last_activity_at || l.updated_at,
    }

    return NextResponse.json({
      ...lead,
      notes: notes.map(n => ({
        id: n.id,
        leadId: n.lead_id,
        content: n.content,
        authorId: n.author,
        authorType: n.author_type,
        authorName: n.author,
        isPrivate: false,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      })),
      tasks: tasks.map(t => ({
        id: t.id,
        leadId: t.lead_id,
        title: t.title,
        description: t.description,
        dueDate: t.due_date,
        priority: t.priority,
        status: t.status,
        assigneeId: t.assignee_id,
        assigneeType: t.assignee_type,
        assigneeName: t.assignee_name,
        createdById: t.assignee_id,
        createdByType: t.assignee_type || 'moto',
        createdByName: t.assignee_name || 'Moto',
        completedAt: t.completed_at,
        createdAt: t.created_at,
        updatedAt: t.created_at,
      })),
      activities: activities.map(a => ({
        id: a.id,
        leadId: a.lead_id,
        type: a.activity_type,
        description: a.description,
        metadata: a.metadata,
        performedById: a.agent,
        performedByType: a.agent_type,
        performedByName: a.agent,
        createdAt: a.created_at,
      })),
    })
  } catch (error) {
    console.error('CRM lead GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    )
  }
}

// PATCH - Update lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb()
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const body = await request.json()

    const { performedById, performedByType, performedByName, ...updates } = body

    // Build update query dynamically
    const result = await db`
      UPDATE crm_leads
      SET
        stage = COALESCE(${updates.stage || null}, stage),
        priority = COALESCE(${updates.priority || null}, priority),
        score = COALESCE(${updates.score || null}, score),
        website = CASE WHEN ${updates.website !== undefined} THEN ${updates.website} ELSE website END,
        phone = CASE WHEN ${updates.phone !== undefined} THEN ${updates.phone} ELSE phone END,
        email = CASE WHEN ${updates.email !== undefined} THEN ${updates.email} ELSE email END,
        updated_at = NOW(),
        last_activity_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Log activity for stage change
    if (updates.stage) {
      await db`
        INSERT INTO crm_activities (lead_id, activity_type, description, agent, agent_type)
        VALUES (${id}, 'stage_changed', ${'Stage updated to ' + updates.stage}, ${performedByName || 'User'}, ${performedByType || 'human'})
      `
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('CRM lead PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}

// DELETE - Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb()
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params

    const result = await db`
      DELETE FROM crm_leads WHERE id = ${id} RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('CRM lead DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    )
  }
}
