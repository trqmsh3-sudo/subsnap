import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// ─── Key helpers ──────────────────────────────────────────────────────────────

function creditsKey(userId: string) { return `credits:${userId}` }
function freeKey(userId: string)    { return `free_used:${userId}` }

// ─── Credit operations ────────────────────────────────────────────────────────

export async function getCredits(userId: string): Promise<number> {
  const val = await redis.get<number>(creditsKey(userId))
  return val ?? 0
}

export async function addCredits(userId: string, amount: number): Promise<void> {
  const current = await getCredits(userId)
  await redis.set(creditsKey(userId), current + amount)
}

export async function deductCredit(userId: string): Promise<boolean> {
  const current = await getCredits(userId)
  if (current <= 0) return false
  await redis.set(creditsKey(userId), current - 1)
  return true
}

export async function hasFreeCancel(userId: string): Promise<boolean> {
  const used = await redis.get<boolean>(freeKey(userId))
  return !used
}

export async function useFreeCancel(userId: string): Promise<void> {
  await redis.set(freeKey(userId), true)
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export const PLANS = [
  {
    id: 'single',
    name: 'Single Snap',
    price: 2.49,
    credits: 1,
    popular: false,
    priceId: 'price_single_snap',
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    price: 7.99,
    credits: 5,
    popular: true,
    priceId: 'price_starter_pack',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    price: 19.99,
    credits: 15,
    popular: false,
    priceId: 'price_pro_pack',
  },
] as const
