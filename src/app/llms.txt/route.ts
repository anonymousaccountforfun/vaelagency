export async function GET() {
  const content = `# Vael Creative

> Boutique AI marketing agency for hotels, hospitality, and fashion brands

## What is Vael Creative?

Vael Creative is a boutique AI marketing agency specializing in hotels, hospitality brands, fashion labels, and boutiques. We combine human creative direction with AI-accelerated production to deliver premium brand content with rapid turnaround.

## Services

- AI-powered brand photography and visual content
- Social media content creation and strategy
- Hotel and property marketing campaigns
- Fashion brand lookbooks and seasonal content
- Marketing strategy for hospitality businesses
- Content production with 48-hour turnaround

## Industries We Serve

- Hotels and resorts
- Hospitality and travel brands
- Fashion labels and designers
- Boutiques and luxury retail
- Property management companies

## Products

- **Vael Spaces** — AI image studio for hotels and properties (https://spaces.vaelcreative.com)

## URL

https://vaelcreative.com

## Contact

hello@vaelcreative.com
`

  return new Response(content, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
