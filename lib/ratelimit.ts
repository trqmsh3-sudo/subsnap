import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// /api/analyze — 5 req/IP/hour, sliding window
export const analyzeRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'rl:analyze',
})

// /api/cancel — 30 req/IP/hour, sliding window
export const cancelHourlyRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 h'),
  prefix: 'rl:cancel:hourly',
})

// /api/cancel — burst cap: 5 req/IP/10s, sliding window
export const cancelBurstRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 s'),
  prefix: 'rl:cancel:burst',
})

// Log blocked requests to a Redis sorted set (score = ms timestamp) for abuse monitoring
export async function logBlocked(ip: string, route: string, retryAfter: number): Promise<void> {
  await redis.zadd('rl:blocked', {
    score: Date.now(),
    member: JSON.stringify({ ip, route, retryAfter, at: new Date().toISOString() }),
  })
}
