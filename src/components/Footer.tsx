'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-background-secondary border-t border-stone-200" data-version="2026-01-22">
      <div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* Mobile: stacked, Desktop: 3-column grid for centered nav */}
          <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-6">
            {/* Logo - Left */}
            <div className="flex items-center md:justify-start">
              <Link href="/">
                <Image
                  src="/images/vael-creative-logo.png"
                  alt="Vael Creative"
                  width={140}
                  height={18}
                  className="h-4 w-auto"
                />
              </Link>
            </div>

            {/* Navigation - Center */}
            <div className="flex items-center justify-center gap-8">
              <Link href="/" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                About
              </Link>
              <Link href="/services" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                Services
              </Link>
            </div>

            {/* Copyright - Right */}
            <div className="flex items-center justify-center md:justify-end">
              <span className="text-stone-500 text-sm">
                © {new Date().getFullYear()} Vael Creative. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
