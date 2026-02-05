import { ImageResponse } from 'next/og'
import { getInsightBySlug } from '@/lib/insights-api'

export const runtime = 'edge'

export const alt = 'Vael Creative Insights'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let title = 'Insights'
  let category = 'Article'
  let author = 'Vael Creative'

  try {
    const post = await getInsightBySlug(slug)
    if (post) {
      title = post.title
      category = post.categories?.[0] || 'Article'
      author = post.author?.name || 'Vael Creative'
    }
  } catch (error) {
    console.error('Error fetching post for OG image:', error)
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FAF9F6',
          backgroundImage: 'linear-gradient(135deg, #FAF9F6 0%, #F5F4F0 50%, #E8E4DD 100%)',
          padding: '60px',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: '#1a1a1a',
            }}
          >
            VAEL CREATIVE
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: '#ffffff',
              backgroundColor: '#1a1a1a',
              padding: '8px 16px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {category}
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: title.length > 60 ? 42 : 52,
              fontWeight: 500,
              color: '#1a1a1a',
              lineHeight: 1.2,
              maxWidth: '100%',
              marginBottom: '32px',
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#e5e5e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 600,
              color: '#6b6b6b',
            }}
          >
            {author.split(' ').map(n => n[0]).join('')}
          </div>
          <div
            style={{
              fontSize: 18,
              color: '#6b6b6b',
            }}
          >
            {author}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
