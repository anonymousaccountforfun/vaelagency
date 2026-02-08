import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config as dotenvConfig } from 'dotenv'

dotenvConfig()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knowledge')

// Dynamically import the chatbot services after env is loaded
async function main() {
  const { insertKnowledgeChunk, clearKnowledge } = await import(
    '../src/lib/chatbot/knowledge'
  )
  const { pool } = await import('../src/lib/chatbot/db')

  console.log('Starting knowledge embedding...')

  // Clear existing knowledge
  console.log('Clearing existing knowledge...')
  const deleted = await clearKnowledge()
  console.log(`Deleted ${deleted} existing chunks`)

  // Process all markdown files
  const files = findMarkdownFiles(KNOWLEDGE_DIR)
  console.log(`Found ${files.length} knowledge files`)

  let totalChunks = 0

  for (const file of files) {
    console.log(`Processing: ${file}`)

    const content = fs.readFileSync(file, 'utf-8')
    const relativePath = path.relative(KNOWLEDGE_DIR, file)
    const source = getSourceFromPath(relativePath)

    const chunks = splitIntoChunks(content)
    console.log(`  Split into ${chunks.length} chunks`)

    for (const chunk of chunks) {
      await insertKnowledgeChunk(source, chunk.content, chunk.title)
      totalChunks++
    }
  }

  console.log(`\nEmbedding complete! Created ${totalChunks} chunks`)

  const p = pool()
  if (p && 'end' in p) await p.end()
}

function findMarkdownFiles(dir: string): string[] {
  const files: string[] = []

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath)
      }
    }
  }

  walk(dir)
  return files
}

function getSourceFromPath(relativePath: string): 'faq' | 'website' | 'services' | 'process' | 'pricing' {
  if (relativePath.includes('faq')) return 'faq'
  if (relativePath.includes('services')) return 'services'
  if (relativePath.includes('process')) return 'process'
  if (relativePath.includes('pricing')) return 'pricing'
  return 'website'
}

interface Chunk {
  title?: string
  content: string
}

function splitIntoChunks(content: string): Chunk[] {
  const chunks: Chunk[] = []

  // Split by headings (## or ###)
  const sections = content.split(/(?=^#{2,3}\s)/m)

  for (const section of sections) {
    const trimmed = section.trim()
    if (!trimmed) continue

    // Extract title from heading if present
    const headingMatch = trimmed.match(/^#{2,3}\s+(.+)$/m)
    const title = headingMatch ? headingMatch[1].trim() : undefined

    // Remove the heading from content
    const contentWithoutHeading = trimmed.replace(/^#{2,3}\s+.+$/m, '').trim()

    if (!contentWithoutHeading) continue

    // If content is too long, split into smaller chunks
    if (contentWithoutHeading.length > 1500) {
      const paragraphs = contentWithoutHeading.split(/\n\n+/)
      let currentChunk = ''

      for (const para of paragraphs) {
        if (currentChunk.length + para.length > 1500) {
          if (currentChunk) {
            chunks.push({ title, content: currentChunk.trim() })
          }
          currentChunk = para
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + para
        }
      }

      if (currentChunk) {
        chunks.push({ title, content: currentChunk.trim() })
      }
    } else {
      chunks.push({ title, content: contentWithoutHeading })
    }
  }

  return chunks
}

main().catch((err) => {
  console.error('Embedding failed:', err)
  process.exit(1)
})
