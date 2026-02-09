import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security Headers

  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Enable XSS filter in older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Restrict permissions/features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.cal.com", // Required for Next.js + Cal.com
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io",
      "media-src 'self' https://cdn.sanity.io https://*.sanity.io https://player.vimeo.com https://www.youtube.com",
      "frame-src https://player.vimeo.com https://www.youtube.com https://app.cal.com https://cal.com",
      "connect-src 'self' https://*.sanity.io https://cdn.sanity.io https://formspree.io https://api.cal.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  )

  // Strict Transport Security (HTTPS only)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )

  return response
}

// Apply middleware to all routes except static files, API, and Sanity Studio
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|studio|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
