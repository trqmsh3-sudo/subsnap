import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

type RateLimitResponse = { success: boolean; limit: number; remaining: number; reset: number }

const dummyLimiter = {
  limit: async (): Promise<RateLimitResponse> => ({
    success: true,
    limit: 1000,
    remaining: 999,
    reset: Date.now() + 3600_000,
  }),
}

// /api/analyze — 5 req/IP/hour, sliding window
export const analyzeRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      prefix: 'rl:analyze',
    })
  : dummyLimiter

// /api/cancel — 30 req/IP/hour, sliding window
export const cancelHourlyRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 h'),
      prefix: 'rl:cancel:hourly',
    })
  : dummyLimiter

// /api/cancel — burst cap: 5 req/IP/10s, sliding window
export const cancelBurstRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 s'),
      prefix: 'rl:cancel:burst',
    })
  : dummyLimiter

// Log blocked requests to a Redis sorted set (score = ms timestamp) for abuse monitoring
export async function logBlocked(ip: string, route: string, retryAfter: number): Promise<void> {
  if (!redis) {
    console.warn(`[ratelimit-blocked] ip=${ip} route=${route} retryAfter=${retryAfter}`)
    return
  }
  await redis.zadd('rl:blocked', {
    score: Date.now(),
    member: JSON.stringify({ ip, route, retryAfter, at: new Date().toISOString() }),
  })
}
