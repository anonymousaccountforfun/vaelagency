import OpenAI from 'openai'
import { query } from './db'
import { config } from './config'
import type { KnowledgeChunk } from './types'

const openai = new OpenAI({ apiKey: config.openai.apiKey })

interface KnowledgeResult {
  chunk: KnowledgeChunk
  similarity: number
}

export async function searchKnowledge(queryText: string, limit = 3): Promise<KnowledgeResult[]> {
  // Generate embedding for the query
  const embedding = await generateEmbedding(queryText)

  // Search for similar chunks using cosine similarity
  const result = await query<{
    id: string
    source: string
    title: string | null
    content: string
    metadata: Record<string, unknown>
    similarity: number
  }>(
    `
    SELECT
      id,
      source,
      title,
      content,
      metadata,
      1 - (embedding <=> $1::vector) as similarity
    FROM knowledge_chunks
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector
    LIMIT $2
    `,
    [`[${embedding.join(',')}]`, limit]
  )

  return result.rows.map((row) => ({
    chunk: {
      id: row.id,
      source: row.source as KnowledgeChunk['source'],
      title: row.title || undefined,
      content: row.content,
      metadata: row.metadata,
    },
    similarity: row.similarity,
  }))
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  })

  return response.data[0].embedding
}

export async function insertKnowledgeChunk(
  source: KnowledgeChunk['source'],
  content: string,
  title?: string,
  metadata?: Record<string, unknown>
): Promise<string> {
  const embedding = await generateEmbedding(content)

  const result = await query<{ id: string }>(
    `
    INSERT INTO knowledge_chunks (source, title, content, embedding, metadata)
    VALUES ($1, $2, $3, $4::vector, $5)
    RETURNING id
    `,
    [source, title || null, content, `[${embedding.join(',')}]`, metadata || {}]
  )

  return result.rows[0].id
}

export async function clearKnowledge(source?: KnowledgeChunk['source']): Promise<number> {
  let result
  if (source) {
    result = await query('DELETE FROM knowledge_chunks WHERE source = $1', [source])
  } else {
    result = await query('DELETE FROM knowledge_chunks')
  }
  return result.rowCount || 0
}

export function formatContextForPrompt(results: KnowledgeResult[]): string {
  if (results.length === 0) {
    return ''
  }

  return results
    .filter((r) => r.similarity > 0.7) // Only include reasonably relevant results
    .map((r) => {
      const header = r.chunk.title ? `## ${r.chunk.title}\n` : ''
      return `${header}${r.chunk.content}`
    })
    .join('\n\n---\n\n')
}
