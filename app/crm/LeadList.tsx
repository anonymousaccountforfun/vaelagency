'use client'

import Link from 'next/link'
import { Lead, PIPELINE_STAGES, LeadSortField, SortOrder, SENIORITY_LABELS, DEPARTMENT_LABELS } from '@/lib/crm'

interface LeadListProps {
  leads: Lead[]
  loading: boolean
  onUpdate?: () => void // Optional, kept for backward compatibility
  sortBy: LeadSortField
  sortOrder: SortOrder
  onSort: (field: LeadSortField) => void
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
}

function getEmailConfidenceBadge(confidence: number | undefined, compact = false) {
  if (confidence === undefined || confidence === null) return null
  if (compact) {
    if (confidence >= 80) return <span className="text-green-600 dark:text-green-400" title={`${confidence}% confidence`}>✓</span>
    if (confidence >= 50) return <span className="text-amber-600 dark:text-amber-400" title={`${confidence}% confidence`}>~</span>
    return <span className="text-gray-400" title={`${confidence}% confidence`}>?</span>
  }
  if (confidence >= 80) return <span className="ml-1 text-[10px] text-green-600 dark:text-green-400">({confidence}%)</span>
  if (confidence >= 50) return <span className="ml-1 text-[10px] text-amber-600 dark:text-amber-400">({confidence}%)</span>
  return <span className="ml-1 text-[10px] text-gray-400">({confidence}%)</span>
}

function getContactDisplay(lead: Lead) {
  if (lead.firstName || lead.lastName) {
    return [lead.firstName, lead.lastName].filter(Boolean).join(' ')
  }
  return lead.contactName || null
}

function formatEmployeeCount(count: number | undefined) {
  if (!count) return null
  if (count <= 10) return '1-10'
  if (count <= 50) return '11-50'
  if (count <= 200) return '51-200'
  if (count <= 500) return '201-500'
  return '500+'
}

function getSeniorityBadge(seniority: string | undefined) {
  if (!seniority) return null
  const label = SENIORITY_LABELS[seniority] || seniority
  const colorMap: Record<string, string> = {
    c_suite: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    vp: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    director: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    manager: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    senior: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    entry: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    intern: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  }
  const color = colorMap[seniority] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${color}`}>
      {label}
    </span>
  )
}

function getDepartmentLabel(department: string | undefined) {
  if (!department) return null
  return DEPARTMENT_LABELS[department] || department.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function getBestPhone(lead: Lead): string | null {
  return lead.mobilePhone || lead.corporatePhone || lead.phone || lead.companyPhone || null
}

function getLocation(lead: Lead): { city?: string; state?: string } {
  // Prefer company location, fall back to contact location
  if (lead.companyCity || lead.companyState) {
    return { city: lead.companyCity, state: lead.companyState }
  }
  if (lead.contactCity || lead.contactState) {
    return { city: lead.contactCity, state: lead.contactState }
  }
  return {}
}

function formatLocation(lead: Lead): string | null {
  const loc = getLocation(lead)
  if (!loc.city && !loc.state) return null
  return [loc.city, loc.state].filter(Boolean).join(', ')
}

function formatRelativeTime(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  return `${diffMonths}mo ago`
}

// Sortable column header component
function SortableHeader({
  field,
  label,
  currentSort,
  currentOrder,
  onSort,
  className = '',
}: {
  field: LeadSortField
  label: string
  currentSort: LeadSortField
  currentOrder: SortOrder
  onSort: (field: LeadSortField) => void
  className?: string
}) {
  const isActive = currentSort === field
  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors ${className}`}
    >
      {label}
      <span className="flex flex-col">
        <svg
          className={`w-2 h-2 -mb-0.5 ${isActive && currentOrder === 'asc' ? 'text-accent' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 8 4"
        >
          <path d="M4 0L8 4H0L4 0Z" />
        </svg>
        <svg
          className={`w-2 h-2 ${isActive && currentOrder === 'desc' ? 'text-accent' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 8 4"
        >
          <path d="M4 4L0 0H8L4 4Z" />
        </svg>
      </span>
    </button>
  )
}

export default function LeadList({ leads, loading, sortBy, sortOrder, onSort, selectedIds = [], onSelectionChange }: LeadListProps) {
  const allSelected = leads.length > 0 && selectedIds.length === leads.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < leads.length

  const handleSelectAll = () => {
    if (!onSelectionChange) return
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(leads.map(l => l.id))
    }
  }

  const handleSelectOne = (id: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!onSelectionChange) return
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-100 dark:border-neutral-800 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-neutral-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-12 text-center border border-gray-200 dark:border-neutral-800">
        <div className="mb-4">
          <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No leads found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters or add a new lead</p>
        <Link
          href="/crm/new"
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* Header with sortable columns */}
      <div className="grid grid-cols-[auto_2fr_2fr_1.5fr_1.5fr_1fr_auto] gap-3 px-4 py-3 bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {/* Select All Checkbox */}
        <div className="flex items-center w-6">
          {onSelectionChange && (
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected
              }}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-accent focus:ring-accent cursor-pointer"
            />
          )}
        </div>
        <div>
          <SortableHeader field="companyName" label="Company" currentSort={sortBy} currentOrder={sortOrder} onSort={onSort} />
        </div>
        <div>
          <SortableHeader field="contactName" label="Contact" currentSort={sortBy} currentOrder={sortOrder} onSort={onSort} />
        </div>
        <div>Phone / Email</div>
        <div>Location</div>
        <div>Stage</div>
        <div className="w-6"></div>
      </div>

      {/* Rows - Two-row card layout */}
      {leads.map((lead) => {
        const stage = PIPELINE_STAGES[lead.stage]
        const contactName = getContactDisplay(lead)
        const bestPhone = getBestPhone(lead)
        const location = formatLocation(lead)

        const isSelected = selectedIds.includes(lead.id)

        return (
          <Link
            key={lead.id}
            href={`/crm/${lead.id}`}
            className={`block border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors group ${isSelected ? 'bg-accent/5 dark:bg-accent/10' : ''}`}
          >
            <div className="grid grid-cols-[auto_2fr_2fr_1.5fr_1.5fr_1fr_auto] gap-3 px-4 py-3">
              {/* Row Checkbox */}
              <div className="flex items-center w-6">
                {onSelectionChange && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onClick={(e) => handleSelectOne(lead.id, e)}
                    onChange={() => {}} // Controlled by onClick
                    className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-accent focus:ring-accent cursor-pointer"
                  />
                )}
              </div>
              {/* COMPANY COLUMN */}
              <div className="min-w-0 space-y-1">
                {/* Row 1: Company name + logo */}
                <div className="flex items-center gap-2 min-w-0">
                  {lead.companyLogoUrl ? (
                    <img
                      src={lead.companyLogoUrl}
                      alt=""
                      className="w-8 h-8 rounded object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-100 dark:bg-neutral-700 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {(lead.companyName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {lead.companyName || 'Unknown'}
                    </div>
                    {/* Size + Revenue */}
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {formatEmployeeCount(lead.employeeCount) && (
                        <span className="inline-flex items-center gap-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {formatEmployeeCount(lead.employeeCount)}
                        </span>
                      )}
                      {lead.employeeCount && lead.annualRevenue && <span className="mx-1">·</span>}
                      {lead.annualRevenue && <span>{lead.annualRevenue}</span>}
                    </div>
                  </div>
                </div>
                {/* Row 2: Website */}
                <div className="pl-10">
                  {lead.website ? (
                    <span
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.open(lead.website!.startsWith('http') ? lead.website : `https://${lead.website}`, '_blank')
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate block"
                    >
                      {lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No website</span>
                  )}
                </div>
              </div>

              {/* CONTACT COLUMN */}
              <div className="min-w-0 space-y-1">
                {/* Row 1: Name + Title */}
                {contactName ? (
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{contactName}</span>
                      {getSeniorityBadge(lead.seniority)}
                    </div>
                    {lead.jobTitle && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {lead.jobTitle}
                        {lead.department && <span className="text-gray-400 dark:text-gray-500"> · {getDepartmentLabel(lead.department)}</span>}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">No contact</span>
                )}
                {/* Row 2: Social icons */}
                <div className="flex items-center gap-2">
                  {lead.linkedinUrl && (
                    <span
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.open(lead.linkedinUrl, '_blank')
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                      title="LinkedIn"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </span>
                  )}
                  {lead.twitterUrl && (
                    <span
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.open(lead.twitterUrl, '_blank')
                      }}
                      className="text-gray-500 dark:text-gray-400 hover:text-blue-400 cursor-pointer"
                      title="Twitter/X"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              {/* PHONE / EMAIL COLUMN */}
              <div className="min-w-0 space-y-1">
                {/* Row 1: Phone */}
                {bestPhone ? (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{bestPhone}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">No phone</span>
                )}
                {/* Row 2: Email */}
                {lead.email ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{lead.email}</span>
                    {getEmailConfidenceBadge(lead.emailConfidence, true)}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">No email</span>
                )}
              </div>

              {/* LOCATION COLUMN */}
              <div className="min-w-0 space-y-1">
                {/* Row 1: City, State */}
                {location ? (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{location}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">No location</span>
                )}
                {/* Row 2: Industry + Founded */}
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {lead.industry && <span>{lead.industry}</span>}
                  {lead.industry && lead.foundedYear && <span className="mx-1">·</span>}
                  {lead.foundedYear && <span>Est. {lead.foundedYear}</span>}
                  {!lead.industry && !lead.foundedYear && <span className="text-gray-400 italic">—</span>}
                </div>
              </div>

              {/* STAGE COLUMN */}
              <div className="min-w-0 space-y-1">
                {/* Row 1: Stage badge */}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stage.bgColor} ${stage.color}`}>
                  {stage.label}
                </span>
                {/* Row 2: Last activity */}
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {formatRelativeTime(lead.lastActivityAt || lead.updatedAt)}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center w-6">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
