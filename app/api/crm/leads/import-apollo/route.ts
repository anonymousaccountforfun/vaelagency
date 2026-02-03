import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const maxDuration = 120

// Person data from Apollo search results (normalized format)
interface ApolloPersonImport {
  apolloId: string
  firstName: string | null
  lastName: string | null
  name: string | null
  title: string | null
  email: string | null
  emailStatus: string | null
  linkedinUrl: string | null
  seniority: string | null
  departments: string[]
  phoneNumbers: Array<{ number: string; type: string }>
  twitterUrl: string | null
  facebookUrl: string | null
  city: string | null
  state: string | null
  country: string | null
  photoUrl: string | null
  company: {
    name: string | null
    website: string | null
    linkedinUrl: string | null
    employeeCount: number | null
    annualRevenue: string | null
    foundedYear: number | null
    description: string | null
    industry: string | null
    city: string | null
    state: string | null
    country: string | null
    logoUrl: string | null
  }
}

interface ImportResult {
  imported: number
  skipped: number
  errors: number
  details: Array<{
    apolloId: string
    name: string
    company: string
    status: 'imported' | 'skipped' | 'error'
    reason?: string
  }>
}

// Parse revenue string to min/max values
function parseRevenue(revenueStr: string | null): { min: number | null; max: number | null } {
  if (!revenueStr) return { min: null, max: null }

  // Handle ranges like "$10M - $50M" or "10000000-50000000"
  const rangeMatch = revenueStr.match(/\$?([\d.]+)\s*([KMB])?\s*[-–]\s*\$?([\d.]+)\s*([KMB])?/i)
  if (rangeMatch) {
    const parseNum = (num: string, suffix?: string): number => {
      const n = parseFloat(num)
      if (suffix?.toUpperCase() === 'K') return n * 1000
      if (suffix?.toUpperCase() === 'M') return n * 1000000
      if (suffix?.toUpperCase() === 'B') return n * 1000000000
      return n
    }
    return {
      min: parseNum(rangeMatch[1], rangeMatch[2]),
      max: parseNum(rangeMatch[3], rangeMatch[4]),
    }
  }

  // Handle single values
  const singleMatch = revenueStr.match(/\$?([\d.]+)\s*([KMB])?/i)
  if (singleMatch) {
    const multiplier =
      singleMatch[2]?.toUpperCase() === 'K'
        ? 1000
        : singleMatch[2]?.toUpperCase() === 'M'
          ? 1000000
          : singleMatch[2]?.toUpperCase() === 'B'
            ? 1000000000
            : 1
    return { min: parseFloat(singleMatch[1]) * multiplier, max: null }
  }

  return { min: null, max: null }
}

// Calculate email confidence based on email status
function getEmailConfidence(emailStatus: string | null, hasEmail: boolean): number | null {
  if (!hasEmail) return null
  if (emailStatus === 'verified') return 95
  if (emailStatus === 'valid') return 85
  return 70 // Has email but unknown verification status
}

/**
 * POST /api/crm/leads/import-apollo
 *
 * Import selected people from Apollo search results as CRM leads.
 * Prevents duplicates by checking apollo_id and email.
 *
 * Body: { people: ApolloPersonImport[] }
 *
 * For each person:
 * 1. Check if exists by apollo_id
 * 2. Check if exists by email (if apollo_id not found)
 * 3. If not exists, insert into crm_leads
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDb()
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const people: ApolloPersonImport[] = body.people

    if (!Array.isArray(people) || people.length === 0) {
      return NextResponse.json(
        { error: 'No people provided for import' },
        { status: 400 }
      )
    }

    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: 0,
      details: [],
    }

    for (const person of people) {
      const personName = person.name || `${person.firstName || ''} ${person.lastName || ''}`.trim() || 'Unknown'
      const companyName = person.company?.name || 'Unknown Company'

      try {
        // Check if already exists by apollo_id
        if (person.apolloId) {
          const existingByApolloId = await db`
            SELECT id FROM crm_leads WHERE apollo_id = ${person.apolloId} LIMIT 1
          `
          if (existingByApolloId.length > 0) {
            result.skipped++
            result.details.push({
              apolloId: person.apolloId,
              name: personName,
              company: companyName,
              status: 'skipped',
              reason: 'Apollo ID already exists',
            })
            continue
          }
        }

        // Check if already exists by email
        if (person.email) {
          const existingByEmail = await db`
            SELECT id FROM crm_leads WHERE email = ${person.email} LIMIT 1
          `
          if (existingByEmail.length > 0) {
            result.skipped++
            result.details.push({
              apolloId: person.apolloId,
              name: personName,
              company: companyName,
              status: 'skipped',
              reason: 'Email already exists',
            })
            continue
          }
        }

        // Parse revenue
        const revenue = parseRevenue(person.company?.annualRevenue || null)

        // Get phone numbers
        const mobilePhone = person.phoneNumbers?.find(p => p.type === 'mobile')?.number || null
        const corporatePhone = person.phoneNumbers?.find(p => p.type === 'work' || p.type === 'corporate')?.number || null
        const primaryPhone = mobilePhone || corporatePhone || person.phoneNumbers?.[0]?.number || null

        // Calculate email confidence
        const emailConfidence = getEmailConfidence(person.emailStatus, !!person.email)

        // Generate unique ID (same pattern as other lead routes)
        const id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Insert new lead
        await db`
          INSERT INTO crm_leads (
            id,
            company_name,
            contact_name,
            first_name,
            last_name,
            job_title,
            email,
            email_confidence,
            phone,
            website,
            industry,
            linkedin_url,
            seniority,
            department,
            mobile_phone,
            corporate_phone,
            twitter_url,
            facebook_url,
            contact_city,
            contact_state,
            contact_country,
            photo_url,
            employee_count,
            company_linkedin,
            annual_revenue,
            annual_revenue_min,
            annual_revenue_max,
            founded_year,
            company_description,
            company_city,
            company_state,
            company_country,
            company_logo_url,
            apollo_id,
            apollo_last_updated,
            source,
            stage,
            priority,
            score
          ) VALUES (
            ${id},
            ${person.company?.name || 'Unknown Company'},
            ${personName},
            ${person.firstName},
            ${person.lastName},
            ${person.title},
            ${person.email},
            ${emailConfidence},
            ${primaryPhone},
            ${person.company?.website},
            ${person.company?.industry},
            ${person.linkedinUrl},
            ${person.seniority},
            ${person.departments?.[0] || null},
            ${mobilePhone},
            ${corporatePhone},
            ${person.twitterUrl},
            ${person.facebookUrl},
            ${person.city},
            ${person.state},
            ${person.country},
            ${person.photoUrl},
            ${person.company?.employeeCount},
            ${person.company?.linkedinUrl},
            ${person.company?.annualRevenue},
            ${revenue.min},
            ${revenue.max},
            ${person.company?.foundedYear},
            ${person.company?.description},
            ${person.company?.city},
            ${person.company?.state},
            ${person.company?.country},
            ${person.company?.logoUrl},
            ${person.apolloId},
            ${new Date().toISOString()},
            ${'apollo_search'},
            ${'awareness'},
            ${'cold'},
            ${50}
          )
        `

        result.imported++
        result.details.push({
          apolloId: person.apolloId,
          name: personName,
          company: companyName,
          status: 'imported',
        })
      } catch (error) {
        result.errors++
        result.details.push({
          apolloId: person.apolloId,
          name: personName,
          company: companyName,
          status: 'error',
          reason: error instanceof Error ? error.message : 'Unknown error',
        })
        console.error(`[Apollo Import] Error importing ${personName}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors,
      details: result.details,
    })
  } catch (error) {
    console.error('[Apollo Import] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    )
  }
}
