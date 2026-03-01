/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob Storage (for images from the dashboard insights API)
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    // Enable AVIF for better compression (30-50% smaller than WebP)
    formats: ['image/avif', 'image/webp'],
    // Optimize for common device widths
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Smaller sizes for thumbnails and icons
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize layout shift
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
