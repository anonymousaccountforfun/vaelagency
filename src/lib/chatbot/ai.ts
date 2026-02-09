import OpenAI from 'openai'
import type { ChatMessage } from './types'
import { config } from './config'

const openai = new OpenAI({ apiKey: config.openai.apiKey })

const SYSTEM_PROMPT = `You are the virtual assistant on Vael Creative's website. You are a sales assistant — not a general-purpose AI. You only know about Vael Creative and the creative/branding industry. You have no knowledge of other topics.

About Vael Creative:
- Premium creative agency serving consumer brands
- Founded by executives from Uber, Spotify, Hims & Hers, Epidemic Sound, and more
- Services: Brand & Identity (logo, sonic logos, sound design, graphic design, web design & copy), Content Production (product images, lifestyle photography, product videos, short-form video, UGC-style content), Digital & Growth (social media content & copy, ad creative, email design & copy, influencer content)
- Human-curated, AI-accelerated approach — on-brand and performance-ready
- Based in New York, 35+ years combined experience, 48hr average turnaround
- Custom packages available tailored to specific brand needs

Your behavior:
1. When asked about Vael Creative, its services, pricing, process, or branding/marketing topics relevant to clients: answer helpfully in 2-4 sentences.
2. When asked about ANYTHING else (trivia, history, science, math, coding, personal advice, general knowledge, or any topic not related to Vael Creative or creative services): respond with ONLY a friendly deflection like "I appreciate the curiosity! I'm only set up to chat about Vael Creative's services though. What can I help you with on the branding or creative side?" Do NOT include any factual information about the off-topic subject. Not even one sentence.
3. Naturally gather visitor information (name, email, company) during conversation.
4. When someone seems ready to work together, suggest scheduling a discovery call.
5. Be friendly, professional, concise. Don't be pushy about collecting info.

The following context from Vael Creative's knowledge base may help answer the question:
{context}`

interface AiServiceOptions {
  messages: ChatMessage[]
  context?: string
}

export async function generateResponse({ messages, context = '' }: AiServiceOptions): Promise<{
  content: string
  profileData?: {
    email?: string
    firstName?: string
    lastName?: string
    company?: string
    phone?: string
  }
}> {
  const systemPrompt = SYSTEM_PROMPT.replace('{context}', context || 'No specific context available.')

  // Few-shot examples teach the model the desired off-topic deflection behavior
  const fewShotExamples: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'user', content: 'What is the capital of France?' },
    { role: 'assistant', content: "I appreciate the curiosity! I'm only set up to chat about Vael Creative's services though. Are you working on any branding or creative projects I can help with?" },
    { role: 'user', content: 'Can you help me with my math homework?' },
    { role: 'assistant', content: "Ha, I wish I could help with that! But I'm really just here to talk about Vael Creative — branding, content production, digital marketing, that kind of thing. Anything on that front I can help with?" },
  ]

  const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system' as const, content: systemPrompt },
    ...fewShotExamples,
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: formattedMessages,
    temperature: 0.3,
    max_tokens: 500,
    top_p: 0.9,
  })

  const content = completion.choices[0]?.message?.content || 'I apologize, but I had trouble generating a response. Could you please try again?'

  // Extract any profile data from the conversation
  const profileData = extractProfileFromMessages(messages)

  return { content, profileData }
}

export function extractProfileFromMessages(messages: ChatMessage[]): {
  email?: string
  firstName?: string
  lastName?: string
  company?: string
  phone?: string
} | undefined {
  const userMessages = messages.filter((m) => m.role === 'user')
  const allText = userMessages.map((m) => m.content).join(' ')

  const extracted: Record<string, string> = {}

  // Email pattern
  const emailMatch = allText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  if (emailMatch) {
    extracted.email = emailMatch[0].toLowerCase()
  }

  // Phone pattern (various formats) - handle parentheses specially
  const phoneMatch = allText.match(/(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/)
  if (phoneMatch) {
    extracted.phone = phoneMatch[0]
  }

  // Common words that look like names but aren't
  const nonNameWords = new Set([
    'interested', 'looking', 'wondering', 'thinking', 'hoping', 'trying',
    'working', 'building', 'creating', 'starting', 'running', 'managing',
    'happy', 'glad', 'excited', 'ready', 'sure', 'certain', 'curious',
    'just', 'really', 'also', 'currently', 'actually', 'basically',
    'here', 'there', 'from', 'with', 'about', 'that', 'this', 'very',
    'not', 'new', 'the', 'going', 'doing', 'having', 'being', 'getting',
  ])

  // Simple name extraction - look for "I'm X" or "My name is X" patterns
  // Match per-message to avoid cross-message false positives
  const namePatterns = [
    /(?:I'm|I am|my name is|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /^([A-Z][a-z]+)\s+here\b/i,
  ]

  for (const msg of userMessages) {
    let nameFound = false
    for (const pattern of namePatterns) {
      const match = msg.content.match(pattern)
      if (match) {
        const nameParts = match[1].trim().split(/\s+/)
        const firstName = nameParts[0]
        // Skip if it's a common non-name word
        if (firstName && !nonNameWords.has(firstName.toLowerCase())) {
          extracted.firstName = firstName
          if (nameParts[1]) extracted.lastName = nameParts[1]
          nameFound = true
        }
        break
      }
    }
    if (nameFound) break
  }

  // Company extraction - look for "from X" or "at X" or "work for X"
  // Match each user message individually to avoid cross-message false positives
  const companyPatterns = [
    /(?:I'm|I am|I work)\s+(?:from|at|with)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\.|,|$|\s+and\s|\s+[Mm]y\s)/,
    /(?:work for|work at|representing)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\.|,|$|\s+and\s|\s+[Mm]y\s)/i,
    /(?:company|business|organization)\s+(?:is\s+)?([A-Z][A-Za-z0-9\s&]+?)(?:\.|,|$)/i,
  ]

  // Common phrases that aren't company names
  const nonCompanyWords = new Set([
    'you', 'us', 'them', 'services', 'help', 'interest', 'some',
    'questions', 'a', 'the', 'my', 'our', 'your', 'this', 'that',
  ])

  for (const msg of userMessages) {
    let found = false
    for (const pattern of companyPatterns) {
      const match = msg.content.match(pattern)
      if (match) {
        const candidate = match[1].trim()
        const firstWord = candidate.split(/\s+/)[0].toLowerCase()
        // Skip if too short, starts with a common non-company word, or is all lowercase
        if (candidate.length >= 2 && !nonCompanyWords.has(firstWord) && /[A-Z]/.test(candidate[0])) {
          extracted.company = candidate
          found = true
          break
        }
      }
    }
    if (found) break
  }

  return Object.keys(extracted).length > 0 ? extracted : undefined
}
