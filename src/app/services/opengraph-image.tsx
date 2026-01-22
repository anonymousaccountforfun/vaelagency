import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Vael Creative Services - AI-Accelerated Brand Content'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF9F6',
          backgroundImage: 'linear-gradient(135deg, #FAF9F6 0%, #F5F4F0 50%, #E8E4DD 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: '0.2em',
              color: '#1a1a1a',
              marginBottom: 24,
            }}
          >
            VAEL CREATIVE
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 500,
              color: '#1a1a1a',
              lineHeight: 1.2,
              maxWidth: 900,
              marginBottom: 24,
            }}
          >
            Services & Pricing
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#6b6b6b',
              maxWidth: 700,
            }}
          >
            AI-accelerated, human-curated creative packages
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
