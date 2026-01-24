'use client'

import { useState, useEffect } from 'react'
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
      />
    )
  }

  // Fallback to image
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
}: {
  videoUrl?: string
  posterUrl?: string
  autoPlay: boolean
  loop: boolean
  fill: boolean
  className: string
}) {
  const [isReady, setIsReady] = useState(false)
  const [isInView, setIsInView] = useState(false)

  // Only start loading video when it's close to viewport
  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' } // Start loading 200px before entering viewport
    )

    // Small delay to let the ref attach
    const timer = setTimeout(() => {
      const video = document.querySelector(`video[data-src="${videoUrl}"]`)
      if (video) observer.observe(video)
    }, 0)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [videoUrl])

  const handleReady = () => setIsReady(true)

  return (
    <video
      // Only set src when in view to defer loading
      src={isInView ? videoUrl : undefined}
      data-src={videoUrl}
      poster={posterUrl}
      autoPlay={isInView && autoPlay}
      muted
      loop={loop}
      playsInline
      // preload="metadata" loads only video dimensions/duration, not content
      preload={isInView ? 'auto' : 'none'}
      onCanPlay={handleReady}
      onLoadedData={handleReady}
      onPlaying={handleReady}
      className={`${fill ? 'absolute inset-0 w-full h-full object-cover' : ''} ${className} transition-opacity duration-300`}
      style={{
        backgroundColor: '#FAF9F6',
        opacity: isReady ? 1 : 0,
      }}
    />
  )
}
