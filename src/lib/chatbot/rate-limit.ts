// In-memory sliding window rate limiter
// Works within warm Vercel instances. Cold starts reset the map,
// but provides burst protection within a single instance lifetime.
const windowMs = 60_000 // 1 minute
const maxPerWindow = 10 // 10 messages per minute per IP

const hits = new Map<string, number[]>()

export function isRateLimited(key: string): boolean {
  const now = Date.now()
  const timestamps = hits.get(key) || []

  // Remove expired entries
  const valid = timestamps.filter((t) => now - t < windowMs)

  if (valid.length >= maxPerWindow) {
    hits.set(key, valid)
    return true
  }

  valid.push(now)
  hits.set(key, valid)

  // Prevent memory leak: prune stale keys every 1000 calls
  if (hits.size > 1000) {
    const entries = Array.from(hits.entries())
    for (const [k, v] of entries) {
      if (v.every((t: number) => now - t >= windowMs)) {
        hits.delete(k)
      }
    }
  }

  return false
}
