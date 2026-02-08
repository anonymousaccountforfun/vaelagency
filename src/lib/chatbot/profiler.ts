import { query } from './db'
import type { VisitorProfile } from './types'

interface ProfileUpdate {
  email?: string
  firstName?: string
  lastName?: string
  company?: string
  phone?: string
  interests?: string[]
  currentPage?: string
}

export async function getOrCreateVisitor(visitorId: string): Promise<VisitorProfile> {
  // Try to get existing visitor
  const existing = await query<{
    id: string
    email: string | null
    first_name: string | null
    last_name: string | null
    company: string | null
    phone: string | null
    interests: string[]
    page_history: string[]
    crm_lead_id: string | null
    created_at: Date
    updated_at: Date
  }>('SELECT * FROM visitors WHERE id = $1', [visitorId])

  if (existing.rows[0]) {
    const row = existing.rows[0]
    return {
      visitorId: row.id,
      email: row.email || undefined,
      firstName: row.first_name || undefined,
      lastName: row.last_name || undefined,
      company: row.company || undefined,
      phone: row.phone || undefined,
      interests: row.interests || [],
      pageHistory: row.page_history || [],
      crmLeadId: row.crm_lead_id || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  // Create new visitor
  await query(
    `INSERT INTO visitors (id) VALUES ($1) ON CONFLICT (id) DO NOTHING`,
    [visitorId]
  )

  return {
    visitorId,
    interests: [],
    pageHistory: [],
  }
}

export async function updateVisitorProfile(
  visitorId: string,
  updates: ProfileUpdate
): Promise<VisitorProfile> {
  const setClauses: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  if (updates.email) {
    setClauses.push(`email = $${paramIndex++}`)
    values.push(updates.email)
  }

  if (updates.firstName) {
    setClauses.push(`first_name = $${paramIndex++}`)
    values.push(updates.firstName)
  }

  if (updates.lastName) {
    setClauses.push(`last_name = $${paramIndex++}`)
    values.push(updates.lastName)
  }

  if (updates.company) {
    setClauses.push(`company = $${paramIndex++}`)
    values.push(updates.company)
  }

  if (updates.phone) {
    setClauses.push(`phone = $${paramIndex++}`)
    values.push(updates.phone)
  }

  if (updates.interests && updates.interests.length > 0) {
    setClauses.push(`interests = array_cat(interests, $${paramIndex++}::text[])`)
    values.push(updates.interests)
  }

  if (updates.currentPage) {
    setClauses.push(`page_history = array_append(page_history, $${paramIndex++})`)
    values.push(updates.currentPage)
  }

  if (setClauses.length === 0) {
    return getOrCreateVisitor(visitorId)
  }

  values.push(visitorId)

  await query(
    `UPDATE visitors SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`,
    values
  )

  return getOrCreateVisitor(visitorId)
}

export async function getVisitor(visitorId: string): Promise<VisitorProfile | null> {
  const result = await query<{
    id: string
    email: string | null
    first_name: string | null
    last_name: string | null
    company: string | null
    phone: string | null
    interests: string[]
    page_history: string[]
    crm_lead_id: string | null
    created_at: Date
    updated_at: Date
  }>('SELECT * FROM visitors WHERE id = $1', [visitorId])

  if (!result.rows[0]) {
    return null
  }

  const row = result.rows[0]
  return {
    visitorId: row.id,
    email: row.email || undefined,
    firstName: row.first_name || undefined,
    lastName: row.last_name || undefined,
    company: row.company || undefined,
    phone: row.phone || undefined,
    interests: row.interests || [],
    pageHistory: row.page_history || [],
    crmLeadId: row.crm_lead_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function setCrmLeadId(visitorId: string, crmLeadId: string): Promise<void> {
  await query('UPDATE visitors SET crm_lead_id = $1 WHERE id = $2', [crmLeadId, visitorId])
}

export function isProfileComplete(profile: VisitorProfile): boolean {
  return !!(profile.email && profile.firstName)
}

export function getProfileCompleteness(profile: VisitorProfile): number {
  let score = 0
  if (profile.email) score += 30
  if (profile.firstName) score += 20
  if (profile.lastName) score += 10
  if (profile.company) score += 20
  if (profile.phone) score += 10
  if (profile.interests.length > 0) score += 10
  return score
}
