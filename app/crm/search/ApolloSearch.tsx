'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

// Types matching the API response
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

interface SearchPagination {
  page: number
  perPage: number
  totalEntries: number
  totalPages: number
}

interface ImportDetail {
  apolloId: string
  name: string
  company: string
  status: 'imported' | 'skipped' | 'error'
  reason?: string
}

// Filter options
const INDUSTRY_OPTIONS = [
  { value: 'retail', label: 'Retail' },
  { value: 'consumer goods', label: 'Consumer Goods' },
  { value: 'e-commerce', label: 'E-Commerce' },
  { value: 'food & beverages', label: 'Food & Beverages' },
  { value: 'apparel & fashion', label: 'Apparel & Fashion' },
  { value: 'cosmetics', label: 'Cosmetics' },
  { value: 'health, wellness and fitness', label: 'Health & Wellness' },
  { value: 'consumer electronics', label: 'Consumer Electronics' },
  { value: 'sporting goods', label: 'Sporting Goods' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'luxury goods & jewelry', label: 'Luxury Goods & Jewelry' },
]

const COMPANY_SIZE_OPTIONS = [
  { value: '1,10', label: '1-10 employees' },
  { value: '11,50', label: '11-50 employees' },
  { value: '51,200', label: '51-200 employees' },
  { value: '201,500', label: '201-500 employees' },
  { value: '501,1000', label: '501-1,000 employees' },
  { value: '1001,5000', label: '1,001-5,000 employees' },
  { value: '5001,10000', label: '5,000+ employees' },
]

const SENIORITY_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'founder', label: 'Founder' },
  { value: 'c_suite', label: 'C-Suite' },
  { value: 'vp', label: 'VP' },
  { value: 'director', label: 'Director' },
  { value: 'manager', label: 'Manager' },
  { value: 'senior', label: 'Senior' },
]

// Default filters for e-commerce decision makers
const DEFAULT_INDUSTRIES = [
  'retail',
  'consumer goods',
  'e-commerce',
  'food & beverages',
  'apparel & fashion',
]

const DEFAULT_SENIORITIES = ['owner', 'founder', 'c_suite', 'vp', 'director']

// Multi-select dropdown component
function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: Array<{ value: string; label: string }>
  selected: string[]
  onChange: (selected: string[]) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-3 py-2 bg-white dark:bg-neutral-900 border rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-accent/50 flex items-center justify-between ${
          selected.length > 0 ? 'border-accent' : 'border-gray-200 dark:border-neutral-700'
        }`}
      >
        <span className="truncate">
          {selected.length === 0
            ? 'Select...'
            : selected.length === 1
              ? options.find(o => o.value === selected[0])?.label
              : `${selected.length} selected`}
        </span>
        <svg className="w-4 h-4 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 max-h-64 overflow-y-auto">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-neutral-700 flex gap-2">
              <button
                type="button"
                onClick={() => onChange(options.map(o => o.value))}
                className="text-xs text-accent hover:underline"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-gray-500 hover:underline"
              >
                Clear
              </button>
            </div>
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selected, option.value])
                    } else {
                      onChange(selected.filter((s) => s !== option.value))
                    }
                  }}
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
                {option.label}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Person card component
function PersonCard({
  person,
  selected,
  onToggle,
}: {
  person: NormalizedPerson
  selected: boolean
  onToggle: () => void
}) {
  const displayName = person.name || `${person.firstName || ''} ${person.lastName || ''}`.trim() || 'Unknown'
  const location = [person.city, person.state, person.country].filter(Boolean).join(', ')
  const companyLocation = [person.company.city, person.company.state, person.company.country].filter(Boolean).join(', ')

  return (
    <div
      className={`bg-white dark:bg-neutral-900 border rounded-lg p-4 transition-all ${
        selected
          ? 'border-accent ring-2 ring-accent/20'
          : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Selection checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-1 rounded border-gray-300 text-accent focus:ring-accent"
        />

        {/* Photo or placeholder */}
        <div className="flex-shrink-0">
          {person.photoUrl ? (
            <img
              src={person.photoUrl}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Person info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">{displayName}</h3>
            {person.linkedinUrl && (
              <a
                href={person.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
                title="View LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
          </div>

          {person.title && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{person.title}</p>
          )}

          {/* Email with verification badge */}
          {person.email && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{person.email}</span>
              {person.emailStatus === 'verified' && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Verified
                </span>
              )}
              {person.emailStatus === 'valid' && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Valid
                </span>
              )}
            </div>
          )}

          {location && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{location}</p>
          )}
        </div>
      </div>

      {/* Company info */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          {person.company.logoUrl ? (
            <img
              src={person.company.logoUrl}
              alt={person.company.name || ''}
              className="w-6 h-6 rounded object-contain bg-white"
            />
          ) : (
            <div className="w-6 h-6 rounded bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                {(person.company.name || 'C').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {person.company.name || 'Unknown Company'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
          {person.company.industry && (
            <span className="bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
              {person.company.industry}
            </span>
          )}
          {person.company.employeeCount && (
            <span className="bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
              {person.company.employeeCount.toLocaleString()} employees
            </span>
          )}
          {companyLocation && (
            <span className="bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
              {companyLocation}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ApolloSearch() {
  // Filter state
  const [filtersExpanded, setFiltersExpanded] = useState(true)
  const [industries, setIndustries] = useState<string[]>(DEFAULT_INDUSTRIES)
  const [companySizes, setCompanySizes] = useState<string[]>([])
  const [seniorities, setSeniorities] = useState<string[]>(DEFAULT_SENIORITIES)
  const [titleSearch, setTitleSearch] = useState('')

  // Search state
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [results, setResults] = useState<NormalizedPerson[]>([])
  const [pagination, setPagination] = useState<SearchPagination | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Import state
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    imported: number
    skipped: number
    errors: number
    details: ImportDetail[]
  } | null>(null)

  const performSearch = useCallback(async (page: number = 1) => {
    setSearching(true)
    setSearchError(null)
    setCurrentPage(page)

    try {
      const response = await fetch('/api/crm/leads/search-apollo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationIndustries: industries.length > 0 ? industries : undefined,
          organizationNumEmployeesRanges: companySizes.length > 0 ? companySizes : undefined,
          personSeniorities: seniorities.length > 0 ? seniorities : undefined,
          personTitles: titleSearch ? [titleSearch] : undefined,
          page,
          perPage: 25,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Search failed')
      }

      const data = await response.json()
      setResults(data.people || [])
      setPagination(data.pagination)
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Search failed')
      setResults([])
      setPagination(null)
    } finally {
      setSearching(false)
    }
  }, [industries, companySizes, seniorities, titleSearch])

  const handleSearch = () => {
    setSelectedIds(new Set())
    setImportResult(null)
    performSearch(1)
  }

  const handlePageChange = (page: number) => {
    performSearch(page)
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    setSelectedIds(new Set(results.map(p => p.apolloId)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleImport = async () => {
    if (selectedIds.size === 0) return

    setImporting(true)
    setImportResult(null)

    try {
      const selectedPeople = results.filter(p => selectedIds.has(p.apolloId))

      const response = await fetch('/api/crm/leads/import-apollo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ people: selectedPeople }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Import failed')
      }

      const data = await response.json()
      setImportResult({
        success: true,
        imported: data.imported,
        skipped: data.skipped,
        errors: data.errors,
        details: data.details,
      })

      // Clear selection of successfully imported
      const importedIds = new Set(
        data.details
          .filter((d: ImportDetail) => d.status === 'imported')
          .map((d: ImportDetail) => d.apolloId)
      )
      setSelectedIds(new Set([...selectedIds].filter(id => !importedIds.has(id))))
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: 1,
        details: [{
          apolloId: '',
          name: '',
          company: '',
          status: 'error',
          reason: error instanceof Error ? error.message : 'Import failed',
        }],
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back to CRM link */}
      <Link
        href="/crm"
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to CRM
      </Link>

      {/* Filters section */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg">
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium text-gray-900 dark:text-white">Search Filters</span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {filtersExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <MultiSelect
                label="Industry"
                options={INDUSTRY_OPTIONS}
                selected={industries}
                onChange={setIndustries}
              />

              <MultiSelect
                label="Company Size"
                options={COMPANY_SIZE_OPTIONS}
                selected={companySizes}
                onChange={setCompanySizes}
              />

              <MultiSelect
                label="Seniority"
                options={SENIORITY_OPTIONS}
                selected={seniorities}
                onChange={setSeniorities}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title Contains
                </label>
                <input
                  type="text"
                  value={titleSearch}
                  onChange={(e) => setTitleSearch(e.target.value)}
                  placeholder="e.g., Marketing, CEO"
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSearch}
                disabled={searching}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searching ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Apollo
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIndustries(DEFAULT_INDUSTRIES)
                  setCompanySizes([])
                  setSeniorities(DEFAULT_SENIORITIES)
                  setTitleSearch('')
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {searchError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {searchError}
          </div>
        </div>
      )}

      {/* Import result message */}
      {importResult && (
        <div
          className={`p-4 rounded-lg border ${
            importResult.success && importResult.errors === 0
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
              : importResult.errors > 0
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Imported: {importResult.imported} | Skipped: {importResult.skipped} | Errors: {importResult.errors}
              </span>
            </div>
            <button
              onClick={() => setImportResult(null)}
              className="text-current hover:opacity-70"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Results section */}
      {results.length > 0 && (
        <>
          {/* Selection controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={selectAll}
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                Select All ({results.length})
              </button>
              <button
                onClick={deselectAll}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Deselect All
              </button>
              {selectedIds.size > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedIds.size} selected
                </span>
              )}
            </div>

            <button
              onClick={handleImport}
              disabled={importing || selectedIds.size === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import Selected ({selectedIds.size})
                </>
              )}
            </button>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((person) => (
              <PersonCard
                key={person.apolloId}
                person={person}
                selected={selectedIds.has(person.apolloId)}
                onToggle={() => toggleSelection(person.apolloId)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {pagination.totalPages} ({pagination.totalEntries.toLocaleString()} results)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || searching}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages || searching}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!searching && results.length === 0 && pagination === null && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Search for Leads</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Configure your filters above and click Search to find e-commerce decision makers
          </p>
        </div>
      )}

      {/* No results state */}
      {!searching && results.length === 0 && pagination !== null && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Results Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your filters to broaden your search
          </p>
        </div>
      )}
    </div>
  )
}
