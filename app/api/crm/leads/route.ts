import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import type { LeadSortField, SortOrder } from '@/lib/crm/types'

// Helper to map DB row to Lead object
function mapLead(l: Record<string, unknown>) {
  return {
    id: l.id,
    // Basic contact
    companyName: l.company_name,
    contactName: l.contact_name,
    email: l.email,
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
}

// Map sort field to DB column
function getSortColumn(field: LeadSortField): string {
  const mapping: Record<LeadSortField, string> = {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    lastActivityAt: 'last_activity_at',
    score: 'score',
    companyName: 'company_name',
    contactName: 'contact_name',
    email: 'email',
    employeeCount: 'employee_count',
    source: 'source',
    seniority: 'seniority',
    department: 'department',
    annualRevenueMin: 'annual_revenue_min',
    foundedYear: 'founded_year',
  }
  return mapping[field] || 'created_at'
}

// GET - List leads from database with sorting and filtering
export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const searchParams = request.nextUrl.searchParams

    // Pagination
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Sorting
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as LeadSortField
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as SortOrder

    // Filters
    const search = searchParams.get('search')
    const stages = searchParams.getAll('stages').filter(Boolean)
    const stage = searchParams.get('stage') // Legacy single stage support
    const priorities = searchParams.getAll('priorities').filter(Boolean)
    const priority = searchParams.get('priority') // Legacy single priority support
    const sources = searchParams.getAll('sources').filter(Boolean)
    const hasEmail = searchParams.get('hasEmail')
    const hasPhone = searchParams.get('hasPhone')
    const minConfidence = searchParams.get('minConfidence')
    const createdAfter = searchParams.get('createdAfter')
    const createdBefore = searchParams.get('createdBefore')
    // New Apollo-based filters
    const seniorities = searchParams.getAll('seniorities').filter(Boolean)
    const departments = searchParams.getAll('departments').filter(Boolean)
    const technologies = searchParams.getAll('technologies').filter(Boolean)
    const minEmployees = searchParams.get('minEmployees')
    const maxEmployees = searchParams.get('maxEmployees')
    const minRevenue = searchParams.get('minRevenue')
    const maxRevenue = searchParams.get('maxRevenue')
    const companyCountry = searchParams.get('companyCountry')

    // Build WHERE conditions
    const conditions: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    // Search filter
    if (search) {
      const searchPattern = `%${search}%`
      conditions.push(`(
        company_name ILIKE $${paramIndex} OR
        email ILIKE $${paramIndex} OR
        phone ILIKE $${paramIndex} OR
        contact_name ILIKE $${paramIndex} OR
        first_name ILIKE $${paramIndex} OR
        last_name ILIKE $${paramIndex} OR
        job_title ILIKE $${paramIndex}
      )`)
      values.push(searchPattern)
      paramIndex++
    }

    // Stage filter (support both array and single value for backwards compatibility)
    const allStages = stages.length > 0 ? stages : (stage ? [stage] : [])
    if (allStages.length > 0) {
      conditions.push(`stage = ANY($${paramIndex})`)
      values.push(allStages)
      paramIndex++
    }

    // Priority filter
    const allPriorities = priorities.length > 0 ? priorities : (priority ? [priority] : [])
    if (allPriorities.length > 0) {
      conditions.push(`priority = ANY($${paramIndex})`)
      values.push(allPriorities)
      paramIndex++
    }

    // Source filter
    if (sources.length > 0) {
      conditions.push(`source = ANY($${paramIndex})`)
      values.push(sources)
      paramIndex++
    }

    // Has email filter
    if (hasEmail === 'true') {
      conditions.push(`email IS NOT NULL AND email != ''`)
    } else if (hasEmail === 'false') {
      conditions.push(`(email IS NULL OR email = '')`)
    }

    // Has phone filter
    if (hasPhone === 'true') {
      conditions.push(`(phone IS NOT NULL AND phone != '') OR (mobile_phone IS NOT NULL AND mobile_phone != '') OR (corporate_phone IS NOT NULL AND corporate_phone != '')`)
    } else if (hasPhone === 'false') {
      conditions.push(`(phone IS NULL OR phone = '') AND (mobile_phone IS NULL OR mobile_phone = '') AND (corporate_phone IS NULL OR corporate_phone = '')`)
    }

    // Email confidence
    if (minConfidence) {
      conditions.push(`email_confidence >= $${paramIndex}`)
      values.push(parseInt(minConfidence))
      paramIndex++
    }

    // Date range
    if (createdAfter) {
      conditions.push(`created_at >= $${paramIndex}`)
      values.push(createdAfter)
      paramIndex++
    }
    if (createdBefore) {
      conditions.push(`created_at <= $${paramIndex}`)
      values.push(createdBefore)
      paramIndex++
    }

    // Seniority filter
    if (seniorities.length > 0) {
      conditions.push(`seniority = ANY($${paramIndex})`)
      values.push(seniorities)
      paramIndex++
    }

    // Department filter
    if (departments.length > 0) {
      conditions.push(`department = ANY($${paramIndex})`)
      values.push(departments)
      paramIndex++
    }

    // Technologies filter (search in comma-separated or JSON text)
    if (technologies.length > 0) {
      const techConditions = technologies.map(() => {
        const condition = `technologies ILIKE $${paramIndex}`
        paramIndex++
        return condition
      })
      conditions.push(`(${techConditions.join(' OR ')})`)
      technologies.forEach(tech => values.push(`%${tech}%`))
    }

    // Employee count range
    if (minEmployees) {
      conditions.push(`employee_count >= $${paramIndex}`)
      values.push(parseInt(minEmployees))
      paramIndex++
    }
    if (maxEmployees) {
      conditions.push(`employee_count <= $${paramIndex}`)
      values.push(parseInt(maxEmployees))
      paramIndex++
    }

    // Revenue range (filter on annual_revenue_min)
    if (minRevenue) {
      conditions.push(`annual_revenue_min >= $${paramIndex}`)
      values.push(parseInt(minRevenue))
      paramIndex++
    }
    if (maxRevenue) {
      conditions.push(`(annual_revenue_max <= $${paramIndex} OR (annual_revenue_max IS NULL AND annual_revenue_min <= $${paramIndex}))`)
      values.push(parseInt(maxRevenue))
      paramIndex++
    }

    // Company country filter
    if (companyCountry) {
      conditions.push(`company_country ILIKE $${paramIndex}`)
      values.push(`%${companyCountry}%`)
      paramIndex++
    }

    // Build final query - simpler approach using tagged template literals
    const sortColumn = getSortColumn(sortBy)
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC'

    // Execute query - build WHERE clause dynamically
    type LeadRow = Record<string, unknown>
    type CountRow = Record<string, unknown>
    let leads: LeadRow[]
    let countResult: CountRow[]

    // For simplicity, execute queries based on filter combinations
    // This avoids issues with dynamic parameterization while still supporting all filters
    if (conditions.length === 0) {
      // No filters
      if (sortColumn === 'created_at' && sortDirection === 'DESC') {
        leads = await db`
          SELECT * FROM crm_leads
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (sortColumn === 'score') {
        leads = await db`
          SELECT * FROM crm_leads
          ORDER BY score ${sortDirection === 'ASC' ? db`ASC` : db`DESC`} NULLS LAST, created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (sortColumn === 'company_name') {
        leads = await db`
          SELECT * FROM crm_leads
          ORDER BY company_name ${sortDirection === 'ASC' ? db`ASC` : db`DESC`} NULLS LAST, created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else if (sortColumn === 'employee_count') {
        leads = await db`
          SELECT * FROM crm_leads
          ORDER BY employee_count ${sortDirection === 'ASC' ? db`ASC` : db`DESC`} NULLS LAST, created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        leads = await db`
          SELECT * FROM crm_leads
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }
      countResult = await db`SELECT COUNT(*) as total FROM crm_leads`
    } else {
      // With filters - use parameterized values array approach
      const allStagesArr = allStages.length > 0 ? allStages : null
      const allPrioritiesArr = allPriorities.length > 0 ? allPriorities : null
      const sourcesArr = sources.length > 0 ? sources : null
      const senioritiesArr = seniorities.length > 0 ? seniorities : null
      const departmentsArr = departments.length > 0 ? departments : null
      const searchPattern = search ? `%${search}%` : null
      const minConfVal = minConfidence ? parseInt(minConfidence) : null
      const minEmployeesVal = minEmployees ? parseInt(minEmployees) : null
      const maxEmployeesVal = maxEmployees ? parseInt(maxEmployees) : null
      const minRevenueVal = minRevenue ? parseInt(minRevenue) : null
      const maxRevenueVal = maxRevenue ? parseInt(maxRevenue) : null
      const technologiesPattern = technologies.length > 0 ? technologies.map(t => `%${t}%`) : null
      // Normalize hasEmail: null means no filter, 'yes' means has email, 'no' means no email
      const hasEmailFilter = hasEmail === 'true' ? 'yes' : hasEmail === 'false' ? 'no' : null
      const hasPhoneFilter = hasPhone === 'true' ? 'yes' : hasPhone === 'false' ? 'no' : null

      leads = await db`
        SELECT * FROM crm_leads
        WHERE
          (${searchPattern}::text IS NULL OR (
            company_name ILIKE ${searchPattern} OR
            email ILIKE ${searchPattern} OR
            phone ILIKE ${searchPattern} OR
            contact_name ILIKE ${searchPattern} OR
            first_name ILIKE ${searchPattern} OR
            last_name ILIKE ${searchPattern} OR
            job_title ILIKE ${searchPattern} OR
            seniority ILIKE ${searchPattern} OR
            department ILIKE ${searchPattern} OR
            technologies ILIKE ${searchPattern}
          ))
          AND (${allStagesArr}::text[] IS NULL OR stage = ANY(${allStagesArr}))
          AND (${allPrioritiesArr}::text[] IS NULL OR priority = ANY(${allPrioritiesArr}))
          AND (${sourcesArr}::text[] IS NULL OR source = ANY(${sourcesArr}))
          AND (${senioritiesArr}::text[] IS NULL OR seniority = ANY(${senioritiesArr}))
          AND (${departmentsArr}::text[] IS NULL OR department = ANY(${departmentsArr}))
          AND (CASE
               WHEN ${hasEmailFilter}::text = 'yes' THEN (email IS NOT NULL AND email != '')
               WHEN ${hasEmailFilter}::text = 'no' THEN (email IS NULL OR email = '')
               ELSE TRUE
               END)
          AND (CASE
               WHEN ${hasPhoneFilter}::text = 'yes' THEN (phone IS NOT NULL AND phone != '' OR mobile_phone IS NOT NULL AND mobile_phone != '' OR corporate_phone IS NOT NULL AND corporate_phone != '')
               WHEN ${hasPhoneFilter}::text = 'no' THEN ((phone IS NULL OR phone = '') AND (mobile_phone IS NULL OR mobile_phone = '') AND (corporate_phone IS NULL OR corporate_phone = ''))
               ELSE TRUE
               END)
          AND (${minConfVal}::int IS NULL OR email_confidence >= ${minConfVal})
          AND (${minEmployeesVal}::int IS NULL OR employee_count >= ${minEmployeesVal})
          AND (${maxEmployeesVal}::int IS NULL OR employee_count <= ${maxEmployeesVal})
          AND (${minRevenueVal}::bigint IS NULL OR annual_revenue_min >= ${minRevenueVal})
          AND (${maxRevenueVal}::bigint IS NULL OR (annual_revenue_max <= ${maxRevenueVal} OR (annual_revenue_max IS NULL AND annual_revenue_min <= ${maxRevenueVal})))
          AND (${companyCountry}::text IS NULL OR company_country ILIKE ${companyCountry ? `%${companyCountry}%` : null})
          AND (${createdAfter}::timestamp IS NULL OR created_at >= ${createdAfter}::timestamp)
          AND (${createdBefore}::timestamp IS NULL OR created_at <= ${createdBefore}::timestamp)
          AND (${technologiesPattern}::text[] IS NULL OR (
            technologies ILIKE ANY(${technologiesPattern})
          ))
        ORDER BY
          CASE WHEN ${sortColumn} = 'score' AND ${sortDirection} = 'DESC' THEN score END DESC NULLS LAST,
          CASE WHEN ${sortColumn} = 'score' AND ${sortDirection} = 'ASC' THEN score END ASC NULLS LAST,
          CASE WHEN ${sortColumn} = 'company_name' AND ${sortDirection} = 'DESC' THEN company_name END DESC NULLS LAST,
          CASE WHEN ${sortColumn} = 'company_name' AND ${sortDirection} = 'ASC' THEN company_name END ASC NULLS LAST,
          CASE WHEN ${sortColumn} = 'employee_count' AND ${sortDirection} = 'DESC' THEN employee_count END DESC NULLS LAST,
          CASE WHEN ${sortColumn} = 'employee_count' AND ${sortDirection} = 'ASC' THEN employee_count END ASC NULLS LAST,
          CASE WHEN ${sortColumn} = 'annual_revenue_min' AND ${sortDirection} = 'DESC' THEN annual_revenue_min END DESC NULLS LAST,
          CASE WHEN ${sortColumn} = 'annual_revenue_min' AND ${sortDirection} = 'ASC' THEN annual_revenue_min END ASC NULLS LAST,
          CASE WHEN ${sortColumn} = 'seniority' AND ${sortDirection} = 'DESC' THEN seniority END DESC NULLS LAST,
          CASE WHEN ${sortColumn} = 'seniority' AND ${sortDirection} = 'ASC' THEN seniority END ASC NULLS LAST,
          CASE WHEN ${sortColumn} = 'department' AND ${sortDirection} = 'DESC' THEN department END DESC NULLS LAST,
          CASE WHEN ${sortColumn} = 'department' AND ${sortDirection} = 'ASC' THEN department END ASC NULLS LAST,
          created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      countResult = await db`
        SELECT COUNT(*) as total FROM crm_leads
        WHERE
          (${searchPattern}::text IS NULL OR (
            company_name ILIKE ${searchPattern} OR
            email ILIKE ${searchPattern} OR
            phone ILIKE ${searchPattern} OR
            contact_name ILIKE ${searchPattern} OR
            first_name ILIKE ${searchPattern} OR
            last_name ILIKE ${searchPattern} OR
            job_title ILIKE ${searchPattern} OR
            seniority ILIKE ${searchPattern} OR
            department ILIKE ${searchPattern} OR
            technologies ILIKE ${searchPattern}
          ))
          AND (${allStagesArr}::text[] IS NULL OR stage = ANY(${allStagesArr}))
          AND (${allPrioritiesArr}::text[] IS NULL OR priority = ANY(${allPrioritiesArr}))
          AND (${sourcesArr}::text[] IS NULL OR source = ANY(${sourcesArr}))
          AND (${senioritiesArr}::text[] IS NULL OR seniority = ANY(${senioritiesArr}))
          AND (${departmentsArr}::text[] IS NULL OR department = ANY(${departmentsArr}))
          AND (CASE
               WHEN ${hasEmailFilter}::text = 'yes' THEN (email IS NOT NULL AND email != '')
               WHEN ${hasEmailFilter}::text = 'no' THEN (email IS NULL OR email = '')
               ELSE TRUE
               END)
          AND (CASE
               WHEN ${hasPhoneFilter}::text = 'yes' THEN (phone IS NOT NULL AND phone != '' OR mobile_phone IS NOT NULL AND mobile_phone != '' OR corporate_phone IS NOT NULL AND corporate_phone != '')
               WHEN ${hasPhoneFilter}::text = 'no' THEN ((phone IS NULL OR phone = '') AND (mobile_phone IS NULL OR mobile_phone = '') AND (corporate_phone IS NULL OR corporate_phone = ''))
               ELSE TRUE
               END)
          AND (${minConfVal}::int IS NULL OR email_confidence >= ${minConfVal})
          AND (${minEmployeesVal}::int IS NULL OR employee_count >= ${minEmployeesVal})
          AND (${maxEmployeesVal}::int IS NULL OR employee_count <= ${maxEmployeesVal})
          AND (${minRevenueVal}::bigint IS NULL OR annual_revenue_min >= ${minRevenueVal})
          AND (${maxRevenueVal}::bigint IS NULL OR (annual_revenue_max <= ${maxRevenueVal} OR (annual_revenue_max IS NULL AND annual_revenue_min <= ${maxRevenueVal})))
          AND (${companyCountry}::text IS NULL OR company_country ILIKE ${companyCountry ? `%${companyCountry}%` : null})
          AND (${createdAfter}::timestamp IS NULL OR created_at >= ${createdAfter}::timestamp)
          AND (${createdBefore}::timestamp IS NULL OR created_at <= ${createdBefore}::timestamp)
          AND (${technologiesPattern}::text[] IS NULL OR (
            technologies ILIKE ANY(${technologiesPattern})
          ))
      `
    }

    const total = parseInt(String(countResult[0]?.total || '0'))

    // Get stats for metrics (unfiltered)
    const stats = await db`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN priority = 'hot' THEN 1 END) as hot,
        COUNT(CASE WHEN priority = 'warm' THEN 1 END) as warm,
        COUNT(CASE WHEN priority = 'cold' THEN 1 END) as cold,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email,
        COUNT(CASE WHEN stage = 'close' OR stage = 'onboard' OR stage = 'deliver' THEN 1 END) as converted,
        COALESCE(AVG(score), 0) as avg_score
      FROM crm_leads
    `

    const s = stats[0]
    const totalNum = parseInt(s.total) || 0
    const convertedNum = parseInt(s.converted) || 0

    return NextResponse.json({
      leads: leads.map(mapLead),
      total,
      // CRMMetrics format for MetricsCards
      totalLeads: totalNum,
      hotLeads: parseInt(s.hot) || 0,
      warmLeads: parseInt(s.warm) || 0,
      coldLeads: parseInt(s.cold) || 0,
      withEmail: parseInt(s.with_email) || 0,
      conversionRate: totalNum > 0 ? Math.round((convertedNum / totalNum) * 100) : 0,
      convertedThisMonth: convertedNum,
      averageScore: Math.round(parseFloat(s.avg_score) || 0),
    })
  } catch (error) {
    console.error('Failed to fetch leads:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

// POST - Create new lead
export async function POST(request: NextRequest) {
  try {
    const db = getDb()
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const result = await db`
      INSERT INTO crm_leads (
        id, company_name, contact_name, first_name, last_name, job_title, linkedin_url,
        email, email_confidence, phone, website, address, industry,
        employee_count, company_linkedin,
        stage, priority, score, source, source_details
      ) VALUES (
        ${id},
        ${body.companyName},
        ${body.contactName || null},
        ${body.firstName || null},
        ${body.lastName || null},
        ${body.jobTitle || null},
        ${body.linkedinUrl || null},
        ${body.email || null},
        ${body.emailConfidence || null},
        ${body.phone || null},
        ${body.website || null},
        ${body.address || null},
        ${body.industry || null},
        ${body.employeeCount || null},
        ${body.companyLinkedin || null},
        ${body.stage || 'awareness'},
        ${body.priority || 'warm'},
        ${body.score || 50},
        ${body.source || 'manual'},
        ${body.sourceDetails || null}
      )
      RETURNING *
    `

    return NextResponse.json(mapLead(result[0]), { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create lead' },
      { status: 500 }
    )
  }
}
