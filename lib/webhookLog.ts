import { Redis } from '@upstash/redis'

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// In-memory fallback for local development or zero-database mode
const inMemoryProcessed = new Set<string>()

const TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days — long enough to outlast any webhook retry window

function webhookKey(eventId: string) {
  return `webhook:lemonsqueezy:${eventId}`
}

export async function hasWebhookBeenProcessed(eventId: string): Promise<boolean> {
  if (!redis) return inMemoryProcessed.has(eventId)
  const seen = await redis.get<boolean>(webhookKey(eventId))
  return !!seen
}

export async function markWebhookProcessed(eventId: string): Promise<void> {
  if (!redis) {
    inMemoryProcessed.add(eventId)
    return
  }
  await redis.set(webhookKey(eventId), true, { ex: TTL_SECONDS })
}
