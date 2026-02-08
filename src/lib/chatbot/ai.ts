import OpenAI from 'openai'
import type { ChatMessage } from './types'
import { config } from './config'

const openai = new OpenAI({ apiKey: config.openai.apiKey })

const SYSTEM_PROMPT = `You are a helpful assistant for Vael Creative, a branding and web design agency based in the United States.

Your goals:
1. Answer questions about Vael Creative's services, process, and approach
2. Naturally gather visitor information during conversation (name, email, company)
3. Help qualified visitors schedule discovery calls
4. Be friendly, professional, and conversational

About Vael Creative:
- Full-service branding and web design agency
- Specializes in helping businesses build memorable brand identities
- Services include logo design, brand strategy, website design and development, and digital marketing
- Known for thoughtful, strategic approach to design

Guidelines:
- Keep responses concise but helpful (2-4 sentences typically)
- When you learn visitor information (name, email, company), acknowledge it naturally
- If someone seems ready to work together, suggest scheduling a discovery call
- Don't be pushy about collecting information - let it flow naturally
- If you don't know something specific about Vael Creative, say so honestly

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

  const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: formattedMessages,
    temperature: 0.7,
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
