'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lead, CRMMetrics, PIPELINE_STAGES, LEAD_SOURCES, PipelineStage, LeadSource, LeadSortField, SortOrder } from '@/lib/crm'
import LeadList from './LeadList'
import ActivityFeed from './ActivityFeed'
import MetricsCards from './MetricsCards'
import ImportModal from './ImportModal'

// Confirmation Modal Component
function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}: {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  confirmVariant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              confirmVariant === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-accent text-white hover:bg-accent/90'
            } disabled:opacity-50`}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// Bulk Action Toolbar Component
function BulkActionToolbar({
  selectedCount,
  onDelete,
  onChangeStage,
  onClearSelection,
  loading = false,
}: {
  selectedCount: number
  onDelete: () => void
  onChangeStage: (stage: PipelineStage) => void
  onClearSelection: () => void
  loading?: boolean
}) {
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false)

  if (selectedCount === 0) return null

  return (
    <div className="sticky top-0 z-30 bg-accent text-white rounded-xl shadow-lg p-4 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-medium">
          {selectedCount} lead{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <button
          onClick={onClearSelection}
          className="text-white/80 hover:text-white text-sm underline"
        >
          Clear selection
        </button>
      </div>
      <div className="flex items-center gap-3">
        {/* Change Stage Dropdown */}
        <div className="relative">
          <button
            onClick={() => setStageDropdownOpen(!stageDropdownOpen)}
            disabled={loading}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            Change Stage
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {stageDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStageDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 min-w-[180px] max-h-64 overflow-y-auto">
                {(Object.keys(PIPELINE_STAGES) as PipelineStage[]).map((stage) => (
                  <button
                    key={stage}
                    onClick={() => {
                      onChangeStage(stage)
                      setStageDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                  >
                    <span className={`w-2 h-2 rounded-full ${PIPELINE_STAGES[stage].bgColor}`}></span>
                    {PIPELINE_STAGES[stage].label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
          Delete Selected
        </button>
      </div>
    </div>
  )
}

interface Filters {
  search: string
  stages: PipelineStage[]
  priorities: string[]
  sources: LeadSource[]
  hasEmail: 'any' | 'yes' | 'no'
}

const defaultFilters: Filters = {
  search: '',
  stages: [],
  priorities: [],
  sources: [],
  hasEmail: 'any',
}

// Filter chip component
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:bg-accent/20 rounded-full p-0.5">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}

// Multi-select dropdown component
function MultiSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
  getLabel,
}: {
  label: string
  options: T[]
  selected: T[]
  onChange: (selected: T[]) => void
  getLabel: (value: T) => string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`px-3 py-2 bg-white dark:bg-neutral-900 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 flex items-center gap-2 ${
          selected.length > 0 ? 'border-accent text-accent' : 'border-gray-200 dark:border-neutral-700'
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {selected.length}
          </span>
        )}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 min-w-[160px] max-h-64 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selected, option])
                    } else {
                      onChange(selected.filter((s) => s !== option))
                    }
                  }}
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
                {getLabel(option)}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function CRMDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [leads, setLeads] = useState<Lead[]>([])
  const [metrics, setMetrics] = useState<CRMMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'activity'>('list')
  const [importModalOpen, setImportModalOpen] = useState(false)

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Apollo enrichment state
  const [enrichmentStatus, setEnrichmentStatus] = useState<{
    loading: boolean
    message: string | null
    needsEnrichment: number
    enriched: number
    totalEnriched: number
    shouldStop: boolean
  }>({ loading: false, message: null, needsEnrichment: 0, enriched: 0, totalEnriched: 0, shouldStop: false })

  // Website discovery state
  const [discoveryStatus, setDiscoveryStatus] = useState<{
    loading: boolean
    message: string | null
    needsDiscovery: number
    totalDiscovered: number
    shouldStop: boolean
  }>({ loading: false, message: null, needsDiscovery: 0, totalDiscovered: 0, shouldStop: false })

  // Google Places location enrichment state
  const [placesStatus, setPlacesStatus] = useState<{
    loading: boolean
    message: string | null
    needsEnrichment: number
    totalEnriched: number
    shouldStop: boolean
  }>({ loading: false, message: null, needsEnrichment: 0, totalEnriched: 0, shouldStop: false })

  // Initialize filters from URL
  const [filters, setFilters] = useState<Filters>(() => {
    const stages = searchParams.getAll('stages').filter(Boolean) as PipelineStage[]
    const priorities = searchParams.getAll('priorities').filter(Boolean)
    const sources = searchParams.getAll('sources').filter(Boolean) as LeadSource[]

    return {
      search: searchParams.get('search') || '',
      stages,
      priorities,
      sources,
      hasEmail: (searchParams.get('hasEmail') as 'any' | 'yes' | 'no') || 'any',
    }
  })

  // Sorting state
  const [sortBy, setSortBy] = useState<LeadSortField>(
    (searchParams.get('sortBy') as LeadSortField) || 'createdAt'
  )
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    (searchParams.get('sortOrder') as SortOrder) || 'desc'
  )

  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 50,
    total: 0,
  })

  // Update URL when filters change
  const updateUrl = useCallback((newFilters: Filters, newSortBy: LeadSortField, newSortOrder: SortOrder) => {
    const params = new URLSearchParams()

    if (newFilters.search) params.set('search', newFilters.search)
    newFilters.stages.forEach(s => params.append('stages', s))
    newFilters.priorities.forEach(p => params.append('priorities', p))
    newFilters.sources.forEach(s => params.append('sources', s))
    if (newFilters.hasEmail !== 'any') params.set('hasEmail', newFilters.hasEmail)
    if (newSortBy !== 'createdAt') params.set('sortBy', newSortBy)
    if (newSortOrder !== 'desc') params.set('sortOrder', newSortOrder)

    const queryString = params.toString()
    router.replace(queryString ? `/crm?${queryString}` : '/crm', { scroll: false })
  }, [router])

  // Fetch data when filters or sorting changes
  useEffect(() => {
    fetchData()
  }, [filters, sortBy, sortOrder, pagination.page, pagination.perPage])

  // Fetch Apollo enrichment stats on mount
  useEffect(() => {
    fetchEnrichmentStats()
    fetchDiscoveryStats()
    fetchPlacesStats()
  }, [])

  async function fetchDiscoveryStats() {
    try {
      const res = await fetch('/api/crm/leads/discover-websites')
      if (res.ok) {
        const data = await res.json()
        setDiscoveryStatus(prev => ({
          ...prev,
          needsDiscovery: data.needsDiscovery || 0,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch discovery stats:', error)
    }
  }

  async function triggerWebsiteDiscovery() {
    setDiscoveryStatus(prev => ({
      ...prev,
      loading: true,
      message: 'Finding websites...',
      totalDiscovered: 0,
      shouldStop: false
    }))

    let totalDiscovered = 0
    let totalProcessed = 0
    let remaining = discoveryStatus.needsDiscovery
    let batchNumber = 0

    try {
      // Loop until no more leads or user stops
      while (remaining > 0) {
        // Check if user requested stop
        const currentStatus = await new Promise<boolean>(resolve => {
          setDiscoveryStatus(prev => {
            resolve(prev.shouldStop)
            return prev
          })
        })

        if (currentStatus) {
          setDiscoveryStatus(prev => ({
            ...prev,
            loading: false,
            message: `Stopped. Found ${totalDiscovered} websites for ${totalProcessed} leads. ${remaining} remaining.`,
          }))
          break
        }

        batchNumber++
        setDiscoveryStatus(prev => ({
          ...prev,
          message: `Batch ${batchNumber}: Processing... (${totalDiscovered} found so far, ${remaining} remaining)`,
        }))

        const res = await fetch('/api/crm/leads/discover-websites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 20 }),
        })
        const data = await res.json()

        if (!data.success) {
          setDiscoveryStatus(prev => ({
            ...prev,
            loading: false,
            message: `Error in batch ${batchNumber}: ${data.error || 'Failed to discover websites'}. Found ${totalDiscovered} websites total.`,
          }))
          break
        }

        totalDiscovered += data.discovered || 0
        totalProcessed += (data.discovered || 0) + (data.notFound || 0)
        remaining = data.remaining || 0

        setDiscoveryStatus(prev => ({
          ...prev,
          needsDiscovery: remaining,
          totalDiscovered,
          message: `Batch ${batchNumber} complete: ${data.discovered} found. Total: ${totalDiscovered} websites found. ${remaining} remaining...`,
        }))

        // Small delay between batches to avoid overwhelming the API
        if (remaining > 0) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      // Final status
      if (remaining === 0) {
        setDiscoveryStatus(prev => ({
          ...prev,
          loading: false,
          needsDiscovery: 0,
          message: `Complete! Found ${totalDiscovered} websites for ${totalProcessed} leads.`,
        }))
      }

      // Refresh data and enrichment stats
      fetchData()
      fetchEnrichmentStats()

      // Clear message after 15 seconds
      setTimeout(() => {
        setDiscoveryStatus(prev => ({ ...prev, message: null }))
      }, 15000)

    } catch (error) {
      setDiscoveryStatus(prev => ({
        ...prev,
        loading: false,
        message: `Error: ${error instanceof Error ? error.message : 'Failed to discover websites'}. Found ${totalDiscovered} websites before error.`,
      }))
    }
  }

  function stopWebsiteDiscovery() {
    setDiscoveryStatus(prev => ({ ...prev, shouldStop: true, message: 'Stopping after current batch...' }))
  }

  async function fetchPlacesStats() {
    try {
      const res = await fetch('/api/crm/leads/enrich-places')
      if (res.ok) {
        const data = await res.json()
        setPlacesStatus(prev => ({
          ...prev,
          needsEnrichment: data.needsEnrichment || 0,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch places stats:', error)
    }
  }

  async function triggerPlacesEnrichment() {
    setPlacesStatus(prev => ({
      ...prev,
      loading: true,
      message: 'Finding locations via Google Places...',
      totalEnriched: 0,
      shouldStop: false
    }))

    let totalEnriched = 0
    let totalProcessed = 0
    let remaining = placesStatus.needsEnrichment
    let batchNumber = 0

    try {
      while (remaining > 0) {
        const currentStatus = await new Promise<boolean>(resolve => {
          setPlacesStatus(prev => {
            resolve(prev.shouldStop)
            return prev
          })
        })

        if (currentStatus) {
          setPlacesStatus(prev => ({
            ...prev,
            loading: false,
            message: `Stopped. Found ${totalEnriched} locations. ${remaining} remaining.`,
          }))
          break
        }

        batchNumber++
        setPlacesStatus(prev => ({
          ...prev,
          message: `Batch ${batchNumber}: Processing... (${totalEnriched} found so far, ${remaining} remaining)`,
        }))

        const res = await fetch('/api/crm/leads/enrich-places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 20 }),
        })
        const data = await res.json()

        if (!data.success) {
          setPlacesStatus(prev => ({
            ...prev,
            loading: false,
            message: `Error in batch ${batchNumber}: ${data.error || 'Failed to find locations'}. Found ${totalEnriched} locations total.`,
          }))
          break
        }

        totalEnriched += data.enriched || 0
        totalProcessed += (data.enriched || 0) + (data.notFound || 0)
        remaining = data.remaining || 0

        setPlacesStatus(prev => ({
          ...prev,
          needsEnrichment: remaining,
          totalEnriched,
          message: `Batch ${batchNumber} complete: ${data.enriched} found. Total: ${totalEnriched} locations. ${remaining} remaining...`,
        }))

        if (remaining > 0) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      if (remaining === 0) {
        setPlacesStatus(prev => ({
          ...prev,
          loading: false,
          needsEnrichment: 0,
          message: `Complete! Found ${totalEnriched} locations for ${totalProcessed} leads.`,
        }))
      }

      fetchData()

      setTimeout(() => {
        setPlacesStatus(prev => ({ ...prev, message: null }))
      }, 15000)

    } catch (error) {
      setPlacesStatus(prev => ({
        ...prev,
        loading: false,
        message: `Error: ${error instanceof Error ? error.message : 'Failed to find locations'}. Found ${totalEnriched} locations before error.`,
      }))
    }
  }

  function stopPlacesEnrichment() {
    setPlacesStatus(prev => ({ ...prev, shouldStop: true, message: 'Stopping after current batch...' }))
  }

  async function fetchEnrichmentStats() {
    try {
      const res = await fetch('/api/crm/leads/enrich-apollo')
      if (res.ok) {
        const data = await res.json()
        setEnrichmentStatus(prev => ({
          ...prev,
          needsEnrichment: data.needsEnrichment || 0,
          enriched: data.enriched || 0,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch enrichment stats:', error)
    }
  }

  async function triggerApolloEnrichment() {
    setEnrichmentStatus(prev => ({
      ...prev,
      loading: true,
      message: 'Enriching leads with Apollo data...',
      totalEnriched: 0,
      shouldStop: false
    }))

    let totalEnriched = 0
    let totalProcessed = 0
    let remaining = enrichmentStatus.needsEnrichment
    let batchNumber = 0

    try {
      // Loop until no more leads or user stops
      while (remaining > 0) {
        // Check if user requested stop
        const currentStatus = await new Promise<boolean>(resolve => {
          setEnrichmentStatus(prev => {
            resolve(prev.shouldStop)
            return prev
          })
        })

        if (currentStatus) {
          setEnrichmentStatus(prev => ({
            ...prev,
            loading: false,
            message: `Stopped. Enriched ${totalEnriched} leads. ${remaining} remaining.`,
          }))
          break
        }

        batchNumber++
        setEnrichmentStatus(prev => ({
          ...prev,
          message: `Batch ${batchNumber}: Processing... (${totalEnriched} enriched so far, ${remaining} remaining)`,
        }))

        const res = await fetch('/api/crm/leads/enrich-apollo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 10 }), // 10 at a time due to Apollo rate limits
        })
        const data = await res.json()

        if (!data.success) {
          setEnrichmentStatus(prev => ({
            ...prev,
            loading: false,
            message: `Error in batch ${batchNumber}: ${data.error || 'Failed to enrich'}. Enriched ${totalEnriched} leads total.`,
          }))
          break
        }

        totalEnriched += data.enriched || 0
        totalProcessed += (data.enriched || 0) + (data.errors || 0)
        remaining = data.remaining || 0

        setEnrichmentStatus(prev => ({
          ...prev,
          needsEnrichment: remaining,
          totalEnriched,
          message: `Batch ${batchNumber} complete: ${data.enriched} enriched. Total: ${totalEnriched}. ${remaining} remaining...`,
        }))

        // Small delay between batches
        if (remaining > 0) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      // Final status
      if (remaining === 0) {
        setEnrichmentStatus(prev => ({
          ...prev,
          loading: false,
          needsEnrichment: 0,
          message: `Complete! Enriched ${totalEnriched} leads with Apollo data.`,
        }))
      }

      // Refresh data
      fetchData()

      // Clear message after 15 seconds
      setTimeout(() => {
        setEnrichmentStatus(prev => ({ ...prev, message: null }))
      }, 15000)

    } catch (error) {
      setEnrichmentStatus(prev => ({
        ...prev,
        loading: false,
        message: `Error: ${error instanceof Error ? error.message : 'Failed to enrich'}. Enriched ${totalEnriched} before error.`,
      }))
    }
  }

  function stopApolloEnrichment() {
    setEnrichmentStatus(prev => ({ ...prev, shouldStop: true, message: 'Stopping after current batch...' }))
  }

  async function fetchData() {
    try {
      setLoading(true)

      // Build query params
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      filters.stages.forEach(s => params.append('stages', s))
      filters.priorities.forEach(p => params.append('priorities', p))
      filters.sources.forEach(s => params.append('sources', s))
      if (filters.hasEmail === 'yes') params.set('hasEmail', 'true')
      if (filters.hasEmail === 'no') params.set('hasEmail', 'false')
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)
      params.set('limit', pagination.perPage.toString())
      params.set('offset', ((pagination.page - 1) * pagination.perPage).toString())

      const leadsRes = await fetch(`/api/crm/leads?${params}`)
      const data = await leadsRes.json()

      setLeads(data.leads || [])
      setPagination(prev => ({ ...prev, total: data.totalLeads || data.total || 0 }))
      // Metrics are included in the same response
      setMetrics({
        totalLeads: data.totalLeads || data.total || 0,
        hotLeads: data.hotLeads || 0,
        warmLeads: data.warmLeads || 0,
        coldLeads: data.coldLeads || 0,
        conversionRate: data.conversionRate || 0,
        convertedThisMonth: data.convertedThisMonth || 0,
        averageScore: data.averageScore || 0,
        // Default values for other required fields
        leadsByStage: {} as Record<string, number>,
        leadsBySource: {} as Record<string, number>,
        avgTimeToConvert: 0,
        recentActivities: [],
        topPerformingAgents: [],
      } as CRMMetrics)
    } catch (error) {
      console.error('Failed to fetch CRM data:', error)
    } finally {
      setLoading(false)
      // Clear selection when data changes
      setSelectedIds([])
    }
  }

  // Handle filter updates
  const updateFilters = (newFilters: Partial<Filters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to page 1
    updateUrl(updated, sortBy, sortOrder)
  }

  // Handle sort
  const handleSort = (field: LeadSortField) => {
    const newOrder: SortOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc'
    setSortBy(field)
    setSortOrder(newOrder)
    updateUrl(filters, field, newOrder)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters(defaultFilters)
    setSortBy('createdAt')
    setSortOrder('desc')
    router.replace('/crm', { scroll: false })
  }

  // Check if any filters are active
  const hasActiveFilters =
    filters.search ||
    filters.stages.length > 0 ||
    filters.priorities.length > 0 ||
    filters.sources.length > 0 ||
    filters.hasEmail !== 'any'

  // Bulk delete handler
  async function handleBulkDelete() {
    if (selectedIds.length === 0) return

    setBulkActionLoading(true)
    try {
      const res = await fetch('/api/crm/leads/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      const data = await res.json()

      if (!res.ok) {
        console.error('Bulk delete failed:', data.error)
        return
      }

      // Refresh data (which also clears selection)
      fetchData()
    } catch (error) {
      console.error('Bulk delete error:', error)
    } finally {
      setBulkActionLoading(false)
      setDeleteConfirmOpen(false)
    }
  }

  // Bulk stage change handler
  async function handleBulkStageChange(stage: PipelineStage) {
    if (selectedIds.length === 0) return

    setBulkActionLoading(true)
    try {
      const res = await fetch('/api/crm/leads/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, updates: { stage } }),
      })
      const data = await res.json()

      if (!res.ok) {
        console.error('Bulk update failed:', data.error)
        return
      }

      // Refresh data (which also clears selection)
      fetchData()
    } catch (error) {
      console.error('Bulk update error:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <MetricsCards metrics={metrics} loading={loading} />

      {/* View toggle and filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 w-64"
              />
            </div>

            {/* Stage multi-select */}
            <MultiSelect
              label="Stage"
              options={Object.keys(PIPELINE_STAGES) as PipelineStage[]}
              selected={filters.stages}
              onChange={(stages) => updateFilters({ stages })}
              getLabel={(stage) => PIPELINE_STAGES[stage].label}
            />

            {/* Priority filter */}
            <MultiSelect
              label="Priority"
              options={['hot', 'warm', 'cold']}
              selected={filters.priorities}
              onChange={(priorities) => updateFilters({ priorities })}
              getLabel={(p) => p === 'hot' ? 'Hot' : p === 'warm' ? 'Warm' : 'Cold'}
            />

            {/* Source multi-select */}
            <MultiSelect
              label="Source"
              options={Object.keys(LEAD_SOURCES) as LeadSource[]}
              selected={filters.sources}
              onChange={(sources) => updateFilters({ sources })}
              getLabel={(source) => LEAD_SOURCES[source]}
            />

            {/* Has Email toggle */}
            <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-1">
              {(['any', 'yes', 'no'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => updateFilters({ hasEmail: value })}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    filters.hasEmail === value
                      ? 'bg-accent text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  {value === 'any' ? 'Any' : value === 'yes' ? 'Has Email' : 'No Email'}
                </button>
              ))}
            </div>

          </div>

          {/* Import, Export, Enrich, Find Websites, and View toggle */}
          <div className="flex items-center gap-3">
            {/* Find Websites Button */}
            {(discoveryStatus.needsDiscovery > 0 || discoveryStatus.loading) && (
              <>
                {discoveryStatus.loading ? (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm font-medium">{discoveryStatus.totalDiscovered} found</span>
                    </div>
                    <button
                      onClick={stopWebsiteDiscovery}
                      className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20"
                      title="Stop website discovery"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Stop
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={triggerWebsiteDiscovery}
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                    title={`Find websites for ${discoveryStatus.needsDiscovery} leads`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Find All Websites ({discoveryStatus.needsDiscovery})
                  </button>
                )}
              </>
            )}
            {/* Find Locations Button (Google Places) */}
            {(placesStatus.needsEnrichment > 0 || placesStatus.loading) && (
              <>
                {placesStatus.loading ? (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 px-3 py-2 border border-emerald-300 dark:border-emerald-700 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm font-medium">{placesStatus.totalEnriched} found</span>
                    </div>
                    <button
                      onClick={stopPlacesEnrichment}
                      className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20"
                      title="Stop location search"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Stop
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={triggerPlacesEnrichment}
                    className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors px-4 py-2 border border-emerald-300 dark:border-emerald-700 rounded-lg bg-emerald-50 dark:bg-emerald-900/20"
                    title={`Find locations for ${placesStatus.needsEnrichment} leads`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Find Locations ({placesStatus.needsEnrichment})
                  </button>
                )}
              </>
            )}
            {/* Apollo Enrich Button */}
            {(enrichmentStatus.needsEnrichment > 0 || enrichmentStatus.loading) && (
              <>
                {enrichmentStatus.loading ? (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 px-3 py-2 border border-purple-300 dark:border-purple-700 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm font-medium">{enrichmentStatus.totalEnriched} enriched</span>
                    </div>
                    <button
                      onClick={stopApolloEnrichment}
                      className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20"
                      title="Stop enrichment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Stop
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={triggerApolloEnrichment}
                    className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors px-4 py-2 border border-purple-300 dark:border-purple-700 rounded-lg bg-purple-50 dark:bg-purple-900/20"
                    title={`Enrich ${enrichmentStatus.needsEnrichment} leads with Apollo data`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Enrich All ({enrichmentStatus.needsEnrichment})
                  </button>
                )}
              </>
            )}
            <Link
              href="/crm/search"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-accent transition-colors px-4 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg"
            >
              Apollo Search
            </Link>
            <button
              onClick={() => setImportModalOpen(true)}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-accent transition-colors px-4 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Import
            </button>
            <a
              href={`/api/crm/leads/export?${new URLSearchParams({
                ...(filters.stages[0] && { stage: filters.stages[0] }),
                ...(filters.priorities[0] && { priority: filters.priorities[0] }),
              }).toString()}`}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-accent transition-colors px-4 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </a>
            <div className="flex items-center bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Leads
              </button>
              <button
                onClick={() => setView('activity')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'activity'
                    ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Activity
              </button>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.search && (
              <FilterChip label={`Search: "${filters.search}"`} onRemove={() => updateFilters({ search: '' })} />
            )}
            {filters.stages.map((stage) => (
              <FilterChip
                key={stage}
                label={`Stage: ${PIPELINE_STAGES[stage].label}`}
                onRemove={() => updateFilters({ stages: filters.stages.filter((s) => s !== stage) })}
              />
            ))}
            {filters.priorities.map((priority) => (
              <FilterChip
                key={priority}
                label={`Priority: ${priority}`}
                onRemove={() => updateFilters({ priorities: filters.priorities.filter((p) => p !== priority) })}
              />
            ))}
            {filters.sources.map((source) => (
              <FilterChip
                key={source}
                label={`Source: ${LEAD_SOURCES[source]}`}
                onRemove={() => updateFilters({ sources: filters.sources.filter((s) => s !== source) })}
              />
            ))}
            {filters.hasEmail !== 'any' && (
              <FilterChip
                label={filters.hasEmail === 'yes' ? 'Has Email' : 'No Email'}
                onRemove={() => updateFilters({ hasEmail: 'any' })}
              />
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-accent underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Website Discovery Status Message */}
      {discoveryStatus.message && (
        <div className={`p-4 rounded-lg ${
          discoveryStatus.message.startsWith('Error')
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            {!discoveryStatus.message.startsWith('Error') && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            {discoveryStatus.message}
          </div>
        </div>
      )}

      {/* Enrichment Status Message */}
      {enrichmentStatus.message && (
        <div className={`p-4 rounded-lg ${
          enrichmentStatus.message.startsWith('Error')
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
        }`}>
          <div className="flex items-center gap-2">
            {!enrichmentStatus.message.startsWith('Error') && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            {enrichmentStatus.message}
          </div>
        </div>
      )}

      {/* Places Location Status Message */}
      {placesStatus.message && (
        <div className={`p-4 rounded-lg ${
          placesStatus.message.startsWith('Error')
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {!placesStatus.message.startsWith('Error') && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {placesStatus.message}
          </div>
        </div>
      )}

      {/* Content */}
      {view === 'list' ? (
        <>
          {/* Bulk Action Toolbar */}
          <BulkActionToolbar
            selectedCount={selectedIds.length}
            onDelete={() => setDeleteConfirmOpen(true)}
            onChangeStage={handleBulkStageChange}
            onClearSelection={() => setSelectedIds([])}
            loading={bulkActionLoading}
          />

          <LeadList
            leads={leads}
            loading={loading}
            onUpdate={fetchData}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {Math.min((pagination.page - 1) * pagination.perPage + 1, pagination.total)}-{Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} leads
                </span>
                <select
                  value={pagination.perPage}
                  onChange={(e) => setPagination({ ...pagination, perPage: parseInt(e.target.value), page: 1 })}
                  className="px-2 py-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.perPage) || 1}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.perPage)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <ActivityFeed activities={metrics?.recentActivities || []} loading={loading} />
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Selected Leads"
        message={`Are you sure you want to delete ${selectedIds.length} lead${selectedIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        loading={bulkActionLoading}
      />
    </div>
  )
}
// Force rebuild 1770079037
