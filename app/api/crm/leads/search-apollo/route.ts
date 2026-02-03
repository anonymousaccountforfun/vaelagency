import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

// Apollo API response types
interface ApolloOrganization {
  id?: string
  name?: string
  website_url?: string
  linkedin_url?: string
  estimated_num_employees?: number
  annual_revenue_printed?: string
  annual_revenue?: number
  founded_year?: number
  short_description?: string
  industry?: string
  keywords?: string[]
  phone?: string
  city?: string
  state?: string
  country?: string
  technologies?: string[]
  logo_url?: string
}

interface ApolloPhoneNumber {
  raw_number?: string
  sanitized_number?: string
  type?: string
}

interface ApolloPerson {
  id?: string
  first_name?: string
  last_name?: string
  name?: string
  title?: string
  email?: string
  email_status?: string
  linkedin_url?: string
  seniority?: string
  departments?: string[]
  phone_numbers?: ApolloPhoneNumber[]
  personal_emails?: string[]
  twitter_url?: string
  facebook_url?: string
  city?: string
  state?: string
  country?: string
  photo_url?: string
  organization?: ApolloOrganization
}

interface ApolloSearchResponse {
  people?: ApolloPerson[]
  pagination?: {
    page?: number
    per_page?: number
    total_entries?: number
    total_pages?: number
  }
}

// Normalized person for frontend
interface NormalizedPerson {
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

// Default search parameters for e-commerce decision makers
const DEFAULT_INDUSTRIES = [
  'retail',
  'consumer goods',
  'e-commerce',
  'food & beverages',
  'apparel & fashion',
  'cosmetics',
  'health, wellness and fitness',
  'consumer electronics',
  'sporting goods',
  'furniture',
  'luxury goods & jewelry',
]

const DEFAULT_SENIORITIES = ['owner', 'founder', 'c_suite', 'vp', 'director']

// Normalize Apollo person to frontend format
function normalizePerson(person: ApolloPerson): NormalizedPerson {
  const org = person.organization || {}

  return {
    apolloId: person.id || '',
    firstName: person.first_name || null,
    lastName: person.last_name || null,
    name: person.name || null,
    title: person.title || null,
    email: person.email || null,
    emailStatus: person.email_status || null,
    linkedinUrl: person.linkedin_url || null,
    seniority: person.seniority || null,
    departments: person.departments || [],
    phoneNumbers: (person.phone_numbers || [])
      .filter(p => p.sanitized_number)
      .map(p => ({
        number: p.sanitized_number!,
        type: p.type || 'unknown',
      })),
    twitterUrl: person.twitter_url || null,
    facebookUrl: person.facebook_url || null,
    city: person.city || null,
    state: person.state || null,
    country: person.country || null,
    photoUrl: person.photo_url || null,
    company: {
      name: org.name || null,
      website: org.website_url || null,
      linkedinUrl: org.linkedin_url || null,
      employeeCount: org.estimated_num_employees || null,
      annualRevenue: org.annual_revenue_printed || null,
      foundedYear: org.founded_year || null,
      description: org.short_description || null,
      industry: org.industry || null,
      city: org.city || null,
      state: org.state || null,
      country: org.country || null,
      logoUrl: org.logo_url || null,
    },
  }
}

/**
 * POST /api/crm/leads/search-apollo
 *
 * Search Apollo's people database for potential leads.
 * Targets e-commerce brands and decision makers by default.
 *
 * Body params:
 * - organizationIndustries: string[] (default: retail, e-commerce, consumer goods, etc.)
 * - organizationNumEmployeesRanges: string[] (optional, e.g., ["1,10", "11,50"])
 * - personSeniorities: string[] (default: owner, founder, c_suite, vp, director)
 * - personTitles: string[] (optional, e.g., ["CEO", "Marketing Director"])
 * - organizationLocations: string[] (optional, e.g., ["United States"])
 * - page: number (default: 1)
 * - perPage: number (default: 25, max: 100)
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.APOLLO_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'APOLLO_API_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()

    // Build search parameters
    const searchParams: Record<string, unknown> = {
      page: body.page || 1,
      per_page: Math.min(body.perPage || 25, 100),
      // Default to e-commerce related industries
      organization_industries: body.organizationIndustries || DEFAULT_INDUSTRIES,
      // Default to decision makers
      person_seniorities: body.personSeniorities || DEFAULT_SENIORITIES,
    }

    // Optional filters
    if (body.organizationNumEmployeesRanges?.length) {
      searchParams.organization_num_employees_ranges = body.organizationNumEmployeesRanges
    }

    if (body.personTitles?.length) {
      searchParams.person_titles = body.personTitles
    }

    if (body.organizationLocations?.length) {
      searchParams.organization_locations = body.organizationLocations
    }

    // Call Apollo API
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(searchParams),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Apollo Search] API error:', response.status, errorText)
      return NextResponse.json(
        { error: `Apollo API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data: ApolloSearchResponse = await response.json()

    // Normalize people for frontend
    const people = (data.people || []).map(normalizePerson)

    return NextResponse.json({
      people,
      pagination: {
        page: data.pagination?.page || 1,
        perPage: data.pagination?.per_page || 25,
        totalEntries: data.pagination?.total_entries || 0,
        totalPages: data.pagination?.total_pages || 0,
      },
    })
  } catch (error) {
    console.error('[Apollo Search] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    )
  }
}
