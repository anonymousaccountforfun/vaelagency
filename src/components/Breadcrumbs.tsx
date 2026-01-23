'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const pathNames: Record<string, string> = {
  about: 'About',
  services: 'Services',
}

export default function Breadcrumbs() {
  const pathname = usePathname()

  // Don't show breadcrumbs on home page or studio
  if (!pathname || pathname === '/' || pathname.startsWith('/studio')) {
    return null
  }

  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav aria-label="Breadcrumb" className="bg-background border-b border-stone-100">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-3">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link
              href="/"
              className="text-stone-500 hover:text-stone-700 transition-colors"
            >
              Home
            </Link>
          </li>
          {segments.map((segment, index) => {
            const path = '/' + segments.slice(0, index + 1).join('/')
            const isLast = index === segments.length - 1
            const name = pathNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

            return (
              <li key={path} className="flex items-center gap-2">
                <span className="text-stone-300">/</span>
                {isLast ? (
                  <span className="text-stone-900 font-medium">{name}</span>
                ) : (
                  <Link
                    href={path}
                    className="text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    {name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
