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

            {/* Social / Contact - Right */}
            <div className="flex items-center justify-center md:justify-end gap-4">
              <a
                href="mailto:hello@vaelcreative.com"
                className="text-stone-500 hover:text-stone-900 transition-colors text-sm"
              >
                hello@vaelcreative.com
              </a>
              <a
                href="https://www.linkedin.com/company/vaelcreative"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-stone-900 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-stone-200 mt-6 pt-6 text-center">
            <span className="text-stone-500 text-sm">
              © {new Date().getFullYear()} Vael Creative. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
