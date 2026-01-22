'use client'

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
    // Request full resolution from Sanity - no width constraint
    const imageUrl = media?.image
      ? urlFor(media.image)
          .quality(100)
          .auto('format')
          .url()
      : fallbackUrl

    const imageAlt = media?.image?.alt || alt

    if (fill) {
      return (
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className={className}
          priority={priority}
          sizes={sizes}
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
        sizes={sizes}
      />
    )
  }

  // Video type
  if (media.type === 'video') {
    const videoUrl = media.videoUrl
    // Only use poster if explicitly set in Sanity, never fall back to legacy images
    const posterUrl = media.videoPoster
      ? urlFor(media.videoPoster).width(width || 2070).quality(80).url()
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

    // Direct video file
    return (
      <video
        src={videoUrl}
        poster={posterUrl}
        autoPlay={media.autoplay ?? true}
        muted
        loop={media.loop ?? true}
        playsInline
        className={`${fill ? 'absolute inset-0 w-full h-full object-cover' : ''} ${className}`}
        style={{ backgroundColor: '#1a1a1a' }}
      />
    )
  }

  // Fallback to image
  if (fill) {
    return (
      <Image
        src={fallbackUrl}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
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
      sizes={sizes}
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
