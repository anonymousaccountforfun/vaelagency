import { Suspense } from 'react'
import Link from 'next/link'
import CRMDashboard from './CRMDashboard'
import { LoadingCard } from '../components/Loading'

export const dynamic = 'force-dynamic'

export default function CRMPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-gray-100">Sales CRM</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Agent-driven lead management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/crm/search"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
          >
            Apollo Search
          </Link>
          <Link
            href="/crm/generate"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
          >
            Scrappy Search
          </Link>
          <Link
            href="/crm/new"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
          >
            Add Lead
          </Link>
        </div>
      </div>

      <Suspense fallback={<LoadingCard />}>
        <CRMDashboard />
      </Suspense>
    </div>
  )
}
