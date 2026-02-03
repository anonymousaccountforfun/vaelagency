'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import LeadGenForm from './LeadGenForm'
import LeadGenProgress from './LeadGenProgress'
import LeadGenResults from './LeadGenResults'
import SendToCRMModal from './SendToCRMModal'

interface Lead {
  id: number
  name: string
  website: string | null
  email: string | null
  emailConfidence: number
  phone: string | null
  address: string | null
  rating: number | null
  reviews: number | null
  industry: string | null
  source: string
  importedToCrm: boolean
}

interface JobState {
  id: string
  status: string
  progress: number
  message: string
}

interface PreviewData {
  total: number
  newCount: number
  duplicateCount: number
  newLeads: Array<{ id: number; name: string; email: string | null }>
  duplicates: Array<{ id: number; name: string; email: string | null; duplicateReason: string }>
}

export default function GenerateLeadsPage() {
  const [job, setJob] = useState<JobState | null>(null)
  const [results, setResults] = useState<Lead[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Start SSE connection when job is active
  useEffect(() => {
    if (!job || job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
      return
    }

    const eventSource = new EventSource(`/api/crm/generate/${job.id}/stream`)

    eventSource.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data)
      setJob(prev => prev ? { ...prev, ...data } : null)
    })

    eventSource.addEventListener('results', () => {
      // Fetch latest results
      fetchResults(job.id)
    })

    eventSource.addEventListener('done', (e) => {
      const data = JSON.parse(e.data)
      setJob(prev => prev ? { ...prev, status: data.status, message: data.message, progress: 100 } : null)
      setIsSearching(false)
      fetchResults(job.id)
    })

    eventSource.addEventListener('error', () => {
      eventSource.close()
    })

    return () => {
      eventSource.close()
    }
  }, [job?.id, job?.status])

  const fetchResults = async (jobId: string) => {
    try {
      const response = await fetch(`/api/crm/generate/${jobId}`)
      const data = await response.json()
      if (data.results) {
        setResults(data.results)
      }
    } catch (error) {
      console.error('Failed to fetch results:', error)
    }
  }

  const handleSearch = async (params: {
    query: string
    location: string
    count: number
    industryCategory?: string
    targetState?: string
    locationType?: string
    radius?: number
  }) => {
    setIsSearching(true)
    setResults([])
    setJob(null)

    try {
      const response = await fetch('/api/crm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      const data = await response.json()

      if (data.success && data.jobId) {
        setJob({
          id: data.jobId,
          status: 'pending',
          progress: 0,
          message: 'Starting search...',
        })
      } else {
        setIsSearching(false)
        alert(data.error || 'Failed to start search')
      }
    } catch (error) {
      setIsSearching(false)
      console.error('Search failed:', error)
      alert('Failed to start search')
    }
  }

  const handleSendToCRM = async (ids: number[]) => {
    setSelectedIds(ids)

    // Get preview first
    try {
      const response = await fetch('/api/crm/generate/send-to-crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultIds: ids, preview: true }),
      })

      const data = await response.json()

      if (data.preview) {
        setPreviewData(data)
        setShowModal(true)
      }
    } catch (error) {
      console.error('Failed to preview:', error)
      alert('Failed to prepare import')
    }
  }

  const handleConfirmImport = useCallback(async (updateDuplicates: boolean) => {
    const response = await fetch('/api/crm/generate/send-to-crm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resultIds: selectedIds,
        preview: false,
        updateDuplicates,
      }),
    })

    const data = await response.json()

    // Refresh results to update imported status
    if (job?.id) {
      fetchResults(job.id)
    }

    return data
  }, [selectedIds, job?.id])

  const handleCloseModal = () => {
    setShowModal(false)
    setPreviewData(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Link href="/crm" className="hover:text-accent">Sales CRM</Link>
            <span>/</span>
            <span>Scrappy Search</span>
          </div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-gray-100">Scrappy Search</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Find businesses using Google Places, Yelp, and Foursquare
          </p>
        </div>
        <Link
          href="/crm"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-accent transition-colors px-4 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to CRM
        </Link>
      </div>

      <div className="space-y-6">
        {/* Search form */}
        <LeadGenForm onSubmit={handleSearch} isLoading={isSearching} />

        {/* Progress */}
        {job && job.status !== 'completed' && (
          <LeadGenProgress
            progress={job.progress}
            message={job.message}
            status={job.status}
            resultCount={results.length}
          />
        )}

        {/* Results */}
        {(results.length > 0 || job?.status === 'completed') && (
          <LeadGenResults
            results={results}
            onSendToCRM={handleSendToCRM}
            isSending={false}
          />
        )}
      </div>

      {/* Send to CRM Modal */}
      <SendToCRMModal
        isOpen={showModal}
        onClose={handleCloseModal}
        previewData={previewData}
        onConfirm={handleConfirmImport}
      />
    </div>
  )
}
