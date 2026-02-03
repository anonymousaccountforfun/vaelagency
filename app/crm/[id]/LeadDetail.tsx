'use client'

import { useState, useEffect } from 'react'
import { Lead, LeadNote, LeadTask, Activity, PIPELINE_STAGES, LEAD_SOURCES, PipelineStage, SENIORITY_LABELS, DEPARTMENT_LABELS } from '@/lib/crm'
import ActivityFeed from '../ActivityFeed'

interface LeadDetailProps {
  leadId: string
}

interface LeadWithRelations extends Lead {
  notes: LeadNote[]
  tasks: LeadTask[]
  activities: Activity[]
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'hot':
      return <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">Hot Lead</span>
    case 'warm':
      return <span className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">Warm Lead</span>
    default:
      return <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">Cold Lead</span>
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatEmployeeCount(count: number | undefined) {
  if (!count) return null
  if (count <= 10) return '1-10 employees'
  if (count <= 50) return '11-50 employees'
  if (count <= 200) return '51-200 employees'
  if (count <= 500) return '201-500 employees'
  return '500+ employees'
}

function formatRevenue(min?: number, max?: number, display?: string): string | null {
  if (display) return display
  if (!min && !max) return null

  const formatNum = (n: number) => {
    if (n >= 1000000000) return `$${(n / 1000000000).toFixed(1)}B`
    if (n >= 1000000) return `$${(n / 1000000).toFixed(0)}M`
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
    return `$${n}`
  }

  if (min && max) return `${formatNum(min)} - ${formatNum(max)}`
  if (min) return `${formatNum(min)}+`
  if (max) return `Up to ${formatNum(max)}`
  return null
}

function getEmailConfidenceLabel(confidence: number | undefined) {
  if (!confidence) return null
  if (confidence >= 90) return { label: 'Verified', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30', icon: 'check' }
  if (confidence >= 70) return { label: 'Likely', color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30', icon: 'partial' }
  return { label: 'Uncertain', color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700', icon: 'question' }
}

// Copy to clipboard helper
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-gray-500 hover:text-accent hover:bg-gray-100 dark:hover:bg-neutral-800 rounded transition-colors"
      title={`Copy ${label}`}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

// Social link button component
function SocialLinkButton({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${color} transition-transform hover:scale-110`}
      title={label}
    >
      {icon}
    </a>
  )
}

export default function LeadDetail({ leadId }: LeadDetailProps) {
  const [lead, setLead] = useState<LeadWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'tasks' | 'activity'>('overview')
  const [newNote, setNewNote] = useState('')
  const [newTask, setNewTask] = useState({ title: '', dueDate: '' })
  const [submitting, setSubmitting] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteContent, setEditingNoteContent] = useState('')
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)

  useEffect(() => {
    fetchLead()
  }, [leadId])

  async function fetchLead() {
    try {
      setLoading(true)
      const res = await fetch(`/api/crm/leads/${leadId}`)
      if (!res.ok) throw new Error('Lead not found')
      const data = await res.json()
      setLead(data)
    } catch (error) {
      console.error('Failed to fetch lead:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStage(newStage: PipelineStage) {
    if (!lead) return

    try {
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: newStage,
          performedById: 'user',
          performedByType: 'human',
          performedByName: 'User',
        }),
      })

      if (res.ok) {
        fetchLead()
      }
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  async function addNote() {
    if (!newNote.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newNote,
          authorId: 'user',
          authorType: 'human',
          authorName: 'User',
        }),
      })

      if (res.ok) {
        setNewNote('')
        fetchLead()
      }
    } catch (error) {
      console.error('Failed to add note:', error)
    } finally {
      setSubmitting(false)
    }
  }

  async function updateNote(noteId: string) {
    if (!editingNoteContent.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingNoteContent }),
      })

      if (res.ok) {
        setEditingNoteId(null)
        setEditingNoteContent('')
        fetchLead()
      }
    } catch (error) {
      console.error('Failed to update note:', error)
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteNote(noteId: string) {
    if (submitting) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/notes/${noteId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setDeletingNoteId(null)
        fetchLead()
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    } finally {
      setSubmitting(false)
    }
  }

  async function addTask() {
    if (!newTask.title.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          dueDate: newTask.dueDate || undefined,
          priority: 'medium',
          createdById: 'user',
          createdByType: 'human',
          createdByName: 'User',
        }),
      })

      if (res.ok) {
        setNewTask({ title: '', dueDate: '' })
        fetchLead()
      }
    } catch (error) {
      console.error('Failed to add task:', error)
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleTask(taskId: string, completed: boolean) {
    try {
      await fetch(`/api/crm/leads/${leadId}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          status: completed ? 'completed' : 'pending',
          updatedById: 'user',
          updatedByType: 'human',
          updatedByName: 'User',
        }),
      })
      fetchLead()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-neutral-700 rounded w-64 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-48 mb-8"></div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-gray-200 dark:bg-neutral-700 rounded-xl"></div>
          <div className="h-96 bg-gray-200 dark:bg-neutral-700 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Lead not found</h2>
        <p className="text-gray-500 dark:text-gray-400">This lead may have been deleted.</p>
      </div>
    )
  }

  const stage = PIPELINE_STAGES[lead.stage]
  const contactName = lead.firstName || lead.lastName
    ? [lead.firstName, lead.lastName].filter(Boolean).join(' ')
    : lead.contactName
  const emailConfidence = getEmailConfidenceLabel(lead.emailConfidence)
  const formattedRevenue = formatRevenue(lead.annualRevenueMin, lead.annualRevenueMax, lead.annualRevenue)

  return (
    <div>
      {/* Quick Actions Bar */}
      <div className="mb-6 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {lead.email && (
              <>
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </a>
                <CopyButton text={lead.email} label="email" />
              </>
            )}
            {(lead.phone || lead.mobilePhone || lead.corporatePhone) && (
              <>
                <a
                  href={`tel:${lead.phone || lead.mobilePhone || lead.corporatePhone}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call
                </a>
                <CopyButton text={lead.phone || lead.mobilePhone || lead.corporatePhone || ''} label="phone" />
              </>
            )}
            {lead.linkedinUrl && (
              <a
                href={lead.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
            )}
            {lead.website && (
              <a
                href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Header with Contact Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Contact Info Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800">
          <div className="flex items-start gap-4">
            {/* Photo */}
            <div className="flex-shrink-0">
              {lead.photoUrl ? (
                <img src={lead.photoUrl} alt="" className="w-20 h-20 rounded-xl object-cover" />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center text-2xl font-bold text-accent">
                  {(contactName || lead.email || 'C').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                  {contactName || 'Unknown Contact'}
                </h2>
                {getPriorityBadge(lead.priority)}
              </div>

              {lead.jobTitle && (
                <p className="text-gray-600 dark:text-gray-400 mb-1">{lead.jobTitle}</p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {lead.seniority && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {SENIORITY_LABELS[lead.seniority] || lead.seniority}
                  </span>
                )}
                {lead.department && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {DEPARTMENT_LABELS[lead.department] || lead.department}
                  </span>
                )}
              </div>

              {/* Contact Location */}
              {(lead.contactCity || lead.contactState || lead.contactCountry) && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{[lead.contactCity, lead.contactState, lead.contactCountry].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info Grid */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-3">
            {/* Email */}
            {lead.email && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-900 dark:text-white">{lead.email}</span>
                  {emailConfidence && (
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${emailConfidence.color}`}>
                      {emailConfidence.icon === 'check' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {emailConfidence.icon === 'partial' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      {lead.emailConfidence}%
                    </span>
                  )}
                </div>
                <CopyButton text={lead.email} label="email" />
              </div>
            )}

            {/* Phone Numbers */}
            {lead.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-900 dark:text-white">{lead.phone}</span>
                  <span className="text-xs text-gray-400">Primary</span>
                </div>
                <CopyButton text={lead.phone} label="phone" />
              </div>
            )}

            {lead.mobilePhone && lead.mobilePhone !== lead.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-900 dark:text-white">{lead.mobilePhone}</span>
                  <span className="text-xs text-gray-400">Mobile</span>
                </div>
                <CopyButton text={lead.mobilePhone} label="mobile" />
              </div>
            )}

            {lead.corporatePhone && lead.corporatePhone !== lead.phone && lead.corporatePhone !== lead.mobilePhone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-gray-900 dark:text-white">{lead.corporatePhone}</span>
                  <span className="text-xs text-gray-400">Corporate</span>
                </div>
                <CopyButton text={lead.corporatePhone} label="corporate phone" />
              </div>
            )}

            {/* Social Links */}
            {(lead.linkedinUrl || lead.twitterUrl || lead.facebookUrl || lead.githubUrl) && (
              <div className="flex items-center gap-2 pt-2">
                {lead.linkedinUrl && (
                  <SocialLinkButton
                    href={lead.linkedinUrl}
                    label="LinkedIn"
                    color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                    icon={
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    }
                  />
                )}
                {lead.twitterUrl && (
                  <SocialLinkButton
                    href={lead.twitterUrl}
                    label="Twitter/X"
                    color="bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
                    icon={
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    }
                  />
                )}
                {lead.facebookUrl && (
                  <SocialLinkButton
                    href={lead.facebookUrl}
                    label="Facebook"
                    color="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                    icon={
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    }
                  />
                )}
                {lead.githubUrl && (
                  <SocialLinkButton
                    href={lead.githubUrl}
                    label="GitHub"
                    color="bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-700"
                    icon={
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    }
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Company Info Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800">
          <div className="flex items-start gap-4 mb-4">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {lead.companyLogoUrl ? (
                <img src={lead.companyLogoUrl} alt="" className="w-16 h-16 rounded-xl object-cover bg-white" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-xl font-bold text-gray-400">
                  {(lead.companyName || 'C').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Company Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {lead.companyName || 'Unknown Company'}
              </h3>

              <div className="flex items-center gap-2 flex-wrap mt-1">
                {lead.industry && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300">
                    {lead.industry}
                  </span>
                )}
                {lead.employeeCount && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatEmployeeCount(lead.employeeCount)}
                  </span>
                )}
              </div>

              {formattedRevenue && (
                <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{formattedRevenue}</span>
                </div>
              )}

              {lead.foundedYear && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Founded {lead.foundedYear}
                </p>
              )}
            </div>
          </div>

          {/* Company Details Grid */}
          <div className="space-y-3">
            {lead.website && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <a
                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                >
                  {lead.website}
                </a>
              </div>
            )}

            {lead.companyPhone && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">{lead.companyPhone}</span>
              </div>
            )}

            {(lead.companyCity || lead.companyState || lead.companyCountry) && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  {[lead.companyCity, lead.companyState, lead.companyCountry].filter(Boolean).join(', ')}
                </span>
              </div>
            )}

            {lead.companyLinkedin && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <a
                  href={lead.companyLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Company LinkedIn
                </a>
              </div>
            )}

            {/* Company Description */}
            {lead.companyDescription && (
              <div className="pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{lead.companyDescription}</p>
              </div>
            )}

            {/* Technologies */}
            {lead.technologies && (
              <div className="pt-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Technologies</p>
                <div className="flex flex-wrap gap-1.5">
                  {(typeof lead.technologies === 'string' ? lead.technologies.split(',') : []).slice(0, 10).map((tech: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs">
                      {tech.trim()}
                    </span>
                  ))}
                  {(typeof lead.technologies === 'string' ? lead.technologies.split(',') : []).length > 10 && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 rounded text-xs">
                      +{(typeof lead.technologies === 'string' ? lead.technologies.split(',') : []).length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Company Keywords */}
            {lead.companyKeywords && (
              <div className="pt-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {(typeof lead.companyKeywords === 'string' ? lead.companyKeywords.split(',') : []).slice(0, 8).map((keyword: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 rounded text-xs">
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stage selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Pipeline Stage
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PIPELINE_STAGES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => updateStage(key as PipelineStage)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                lead.stage === key
                  ? `${config.bgColor} ${config.color} ring-2 ring-offset-2 ring-accent`
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-neutral-700 mb-6">
        <nav className="flex gap-6">
          {(['overview', 'notes', 'tasks', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'notes' && lead.notes.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-neutral-700 rounded-full text-xs">
                  {lead.notes.length}
                </span>
              )}
              {tab === 'tasks' && lead.tasks.filter(t => t.status !== 'completed').length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs">
                  {lead.tasks.filter(t => t.status !== 'completed').length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Lead Details Card */}
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-neutral-800">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Lead Details</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Source</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{LEAD_SOURCES[lead.source]}</dd>
                  </div>
                  {lead.sourceDetails && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Source Details</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{lead.sourceDetails}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Created</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{formatDate(lead.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Last Activity</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{formatDate(lead.lastActivityAt)}</dd>
                  </div>
                  {lead.rating && (
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Rating</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{lead.rating} ({lead.reviews} reviews)</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Lead Score</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{lead.score}/100</dd>
                  </div>
                </dl>
              </div>

              {/* Apollo Metadata (Subtle) */}
              {(lead.apolloId || lead.apolloLastUpdated) && (
                <div className="bg-gray-50 dark:bg-neutral-900/50 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Apollo Data</h4>
                  </div>
                  <dl className="grid grid-cols-2 gap-4 text-xs">
                    {lead.apolloId && (
                      <div>
                        <dt className="text-gray-400 dark:text-gray-500">Apollo ID</dt>
                        <dd className="text-gray-600 dark:text-gray-400 font-mono truncate" title={lead.apolloId}>{lead.apolloId}</dd>
                      </div>
                    )}
                    {lead.apolloLastUpdated && (
                      <div>
                        <dt className="text-gray-400 dark:text-gray-500">Last Enriched</dt>
                        <dd className="text-gray-600 dark:text-gray-400">{formatDate(lead.apolloLastUpdated)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add note form */}
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full bg-transparent border-none resize-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
                  rows={3}
                />
                <div className="flex justify-end">
                  <button
                    onClick={addNote}
                    disabled={!newNote.trim() || submitting}
                    className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* Notes list */}
              {lead.notes.map((note) => (
                <div key={note.id} className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
                  {editingNoteId === note.id ? (
                    // Edit mode
                    <div>
                      <textarea
                        value={editingNoteContent}
                        onChange={(e) => setEditingNoteContent(e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-neutral-700 rounded-lg p-2 resize-none focus:ring-2 focus:ring-accent/50 text-gray-900 dark:text-white"
                        rows={4}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => {
                            setEditingNoteId(null)
                            setEditingNoteContent('')
                          }}
                          className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateNote(note.id)}
                          disabled={!editingNoteContent.trim() || submitting}
                          className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : deletingNoteId === note.id ? (
                    // Delete confirmation
                    <div className="text-center py-4">
                      <p className="text-gray-700 dark:text-gray-300 mb-4">Delete this note?</p>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setDeletingNoteId(null)}
                          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          disabled={submitting}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">{note.authorName}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500 dark:text-gray-400">{formatDate(note.createdAt)}</span>
                          {note.updatedAt && note.updatedAt !== note.createdAt && (
                            <>
                              <span className="text-gray-400">·</span>
                              <span className="text-gray-400 italic text-xs">edited</span>
                            </>
                          )}
                          {note.authorType !== 'human' && (
                            <span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">
                              {note.authorType}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingNoteId(note.id)
                              setEditingNoteContent(note.content)
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
                            title="Edit note"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingNoteId(note.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
                            title="Delete note"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                    </>
                  )}
                </div>
              ))}

              {lead.notes.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No notes yet
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Add task form */}
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Add a task..."
                    className="flex-1 bg-transparent border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-accent/50"
                  />
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="bg-transparent border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent/50"
                  />
                  <button
                    onClick={addTask}
                    disabled={!newTask.title.trim() || submitting}
                    className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Tasks list */}
              {lead.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800 ${
                    task.status === 'completed' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task.id, task.status !== 'completed')}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 dark:border-neutral-600 hover:border-accent'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>by {task.createdByName}</span>
                        {task.dueDate && (
                          <>
                            <span>·</span>
                            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                          </>
                        )}
                        {task.assigneeName && (
                          <>
                            <span>·</span>
                            <span>Assigned to {task.assigneeName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {lead.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No tasks yet
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <ActivityFeed activities={lead.activities} loading={false} showLeadLink={false} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
            <div className="space-y-2">
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </a>
              )}
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call
                </a>
              )}
              <button className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule Meeting
              </button>
              <button className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Create Proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
