'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { MediaObject } from '@/lib/types'

interface MediaRendererProps {
  media?: MediaObject
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
    const imageUrl = media?.image?.url || fallbackUrl

    const imageAlt = media?.image?.alt || alt

    // Guard: if no image URL available, render a styled placeholder instead of broken <Image src="">
    if (!imageUrl) {
      return (
        <div
          className={`bg-gradient-to-br from-stone-100 to-stone-200 ${fill ? 'absolute inset-0' : ''} ${className}`}
          style={!fill ? { width: width || 2070, height: height || 1380 } : undefined}
          role="img"
          aria-label={imageAlt || 'Image placeholder'}
        />
      )
    }

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
    const posterUrl = media.videoPoster?.url || undefined

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
        className={`bg-gradient-to-br from-stone-100 to-stone-200 ${fill ? 'absolute inset-0' : ''} ${className}`}
        style={!fill ? { width: width || 2070, height: height || 1380 } : undefined}
        role="img"
        aria-label={alt || 'Image placeholder'}
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
  const containerRef = useRef<HTMLDivElement>(null)

  // Observe the container (not the video) for intersection
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

    if (containerRef.current) {
      observer.observe(containerRef.current)
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
    <div
      ref={containerRef}
      className={fill ? 'absolute inset-0' : 'relative'}
    >
      {/* Next.js optimized poster — gets AVIF/WebP, priority preload, responsive sizing */}
      {posterUrl && (
        <Image
          src={posterUrl}
          alt=""
          fill
          className={`object-cover transition-opacity duration-150 ease-out ${isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          priority={priority}
          sizes="100vw"
        />
      )}
      <video
        ref={videoRef}
        src={shouldLoad ? videoUrl : undefined}
        autoPlay={shouldLoad && autoPlay}
        muted
        loop={loop}
        playsInline
        preload={priority ? 'auto' : (isInView ? 'auto' : 'metadata')}
        onCanPlayThrough={handleReady}
        className={`${fill ? 'w-full h-full object-cover' : ''} ${className}`}
        style={{
          // GPU layer promotion during load — releases GPU memory after ready
          willChange: isReady ? 'auto' : 'opacity',
          opacity: isReady ? 1 : 0,
          transition: 'opacity 150ms ease-out',
        }}
      />
    </div>
  )
}
