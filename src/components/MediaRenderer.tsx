'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { urlFor } from '../../sanity/lib/client'
import type { SanityMedia } from '../../sanity/lib/types'

interface MediaRendererProps {
  media?: SanityMedia
  fallbackUrl: string
  alt?: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
}

// Default responsive sizes for common layouts
const DEFAULT_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
const HERO_SIZES = '100vw'

export default function MediaRenderer({
  media,
  fallbackUrl,
  alt = '',
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  sizes,
}: MediaRendererProps) {
  // If no media or media is image type
  if (!media || media.type === 'image' || !media.type) {
    // Quality 85 is visually indistinguishable from 100 but 40-60% smaller
    // auto('format') lets Sanity serve AVIF/WebP based on browser support
    const imageUrl = media?.image
      ? urlFor(media.image)
          .quality(85)
          .auto('format')
          .url()
      : fallbackUrl

    // If no valid image source exists, render a styled placeholder
    if (!imageUrl) {
      return (
        <div
          className={`bg-gradient-to-br from-stone-100 to-stone-200 ${className}`}
          style={{ width: '100%', height: '100%' }}
        />
      )
    }

    const imageAlt = media?.image?.alt || alt

    // Use appropriate sizes based on whether it's a fill image (likely hero) or fixed
    const imageSizes = sizes || (fill ? HERO_SIZES : DEFAULT_SIZES)

    if (fill) {
      return (
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className={className}
          priority={priority}
          sizes={imageSizes}
        />
      )
    }

    return (
      <Image
        src={imageUrl}
        alt={imageAlt}
        width={width || 2070}
        height={height || 1380}
        className={className}
        priority={priority}
        sizes={imageSizes}
      />
    )
  }

  // Video type
  if (media.type === 'video') {
    const videoUrl = media.videoUrl
    // Poster image: use responsive width based on device, quality 80 is good for posters
    const posterUrl = media.videoPoster
      ? urlFor(media.videoPoster)
          .width(width || 1920)
          .quality(80)
          .auto('format')
          .url()
      : undefined

    // Check if it's a YouTube URL
    if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))) {
      const videoId = extractYouTubeId(videoUrl)
      return (
        <div className={`relative ${fill ? 'absolute inset-0' : ''} ${className}`}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=${media.autoplay ? 1 : 0}&mute=1&loop=${media.loop ? 1 : 0}&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
          />
        </div>
      )
    }

    // Check if it's a Vimeo URL
    if (videoUrl && videoUrl.includes('vimeo.com')) {
      const videoId = extractVimeoId(videoUrl)
      return (
        <div className={`relative ${fill ? 'absolute inset-0' : ''} ${className}`}>
          <iframe
            src={`https://player.vimeo.com/video/${videoId}?autoplay=${media.autoplay ? 1 : 0}&muted=1&loop=${media.loop ? 1 : 0}&background=1`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
          />
        </div>
      )
    }

    // Direct video file - render with VideoPlayer component for smooth loading
    return (
      <VideoPlayer
        videoUrl={videoUrl}
        posterUrl={posterUrl}
        autoPlay={media.autoplay ?? true}
        loop={media.loop ?? true}
        fill={fill}
        className={className}
        priority={priority}
      />
    )
  }

  // Fallback to image — guard against empty fallbackUrl
  if (!fallbackUrl) {
    return (
      <div
        className={`bg-gradient-to-br from-stone-100 to-stone-200 ${className}`}
        style={{ width: '100%', height: '100%' }}
      />
    )
  }

  const fallbackSizes = sizes || (fill ? HERO_SIZES : DEFAULT_SIZES)

  if (fill) {
    return (
      <Image
        src={fallbackUrl}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={fallbackSizes}
      />
    )
  }

  return (
    <Image
      src={fallbackUrl}
      alt={alt}
      width={width || 2070}
      height={height || 1380}
      className={className}
      priority={priority}
      sizes={fallbackSizes}
    />
  )
}

function extractYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : ''
}

function extractVimeoId(url: string): string {
  const regExp = /vimeo\.com\/(?:.*\/)?(\d+)/
  const match = url.match(regExp)
  return match ? match[1] : ''
}

// Video player component with optimized loading
function VideoPlayer({
  videoUrl,
  posterUrl,
  autoPlay,
  loop,
  fill,
  className,
  priority = false,
}: {
  videoUrl?: string
  posterUrl?: string
  autoPlay: boolean
  loop: boolean
  fill: boolean
  className: string
  priority?: boolean
}) {
  const [isReady, setIsReady] = useState(false)
  const [isInView, setIsInView] = useState(priority) // Priority videos start "in view"
  const videoRef = useRef<HTMLVideoElement>(null)

  // Only use intersection observer for non-priority videos
  useEffect(() => {
    if (priority || typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px' } // Increased margin for earlier loading
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  // Single handler - only use onCanPlayThrough for true readiness
  const handleReady = () => {
    if (!isReady) setIsReady(true)
  }

  // For priority videos, start loading immediately and show poster while loading
  const shouldLoad = priority || isInView

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? videoUrl : undefined}
      poster={posterUrl}
      autoPlay={shouldLoad && autoPlay}
      muted
      loop={loop}
      playsInline
      preload={priority ? 'auto' : (isInView ? 'auto' : 'metadata')}
      onCanPlayThrough={handleReady}
      className={`${fill ? 'absolute inset-0 w-full h-full object-cover' : ''} ${className}`}
      style={{
        // Show poster immediately via CSS background while video loads
        backgroundImage: posterUrl ? `url(${posterUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // Faster, smoother opacity transition
        opacity: isReady ? 1 : 0,
        transition: 'opacity 150ms ease-out',
      }}
    />
  )
}
