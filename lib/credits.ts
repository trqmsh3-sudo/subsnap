import { Redis } from '@upstash/redis'
export { PLANS, CREDITS_BY_VARIANT } from './plans'

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// In-memory fallback for local development or zero-database mode
const inMemoryCredits = new Map<string, number>()
const inMemoryFlags = new Map<string, boolean>()
const inMemoryLogs = new Map<string, string[]>()

// ─── Key helpers ──────────────────────────────────────────────────────────────

function creditsKey(userId: string)  { return `credits:${userId}` }
function freeKey(userId: string)     { return `free_used:${userId}` }
function freeScanKey(userId: string) { return `free_scan:${userId}` }
function scanLogKey(userId: string)  { return `scan_log:${userId}` }

// ─── Credit operations ────────────────────────────────────────────────────────

export async function getCredits(userId: string): Promise<number> {
  if (!redis) {
    return inMemoryCredits.get(creditsKey(userId)) ?? 999
  }
  const val = await redis.get<number>(creditsKey(userId))
  return val ?? 0
}

export async function addCredits(userId: string, amount: number): Promise<void> {
  if (!redis) {
    const current = inMemoryCredits.get(creditsKey(userId)) ?? 0
    inMemoryCredits.set(creditsKey(userId), current + amount)
    return
  }
  const current = await getCredits(userId)
  await redis.set(creditsKey(userId), current + amount)
}

export async function deductCredit(userId: string): Promise<boolean> {
  if (!redis) {
    return true
  }
  const current = await getCredits(userId)
  if (current <= 0) return false
  await redis.set(creditsKey(userId), current - 1)
  return true
}

export async function hasFreeCancel(userId: string): Promise<boolean> {
  if (!redis) return true
  const used = await redis.get<boolean>(freeKey(userId))
  return !used
}

export async function useFreeCancel(userId: string): Promise<void> {
  if (!redis) {
    inMemoryFlags.set(freeKey(userId), true)
    return
  }
  await redis.set(freeKey(userId), true)
}

// ─── Free scan (one per user, separate from free cancel) ─────────────────────

export async function hasFreeScan(userId: string): Promise<boolean> {
  if (!redis) return true
  const used = await redis.get<boolean>(freeScanKey(userId))
  return !used
}

export async function consumeFreeScan(userId: string): Promise<void> {
  if (!redis) {
    inMemoryFlags.set(freeScanKey(userId), true)
    return
  }
  await redis.set(freeScanKey(userId), true)
}

// ─── Scan result logging (for refund verification) ────────────────────────────

export async function logScanResult(userId: string, count: number): Promise<void> {
  const entry = JSON.stringify({ count, at: new Date().toISOString() })
  if (!redis) {
    const list = inMemoryLogs.get(scanLogKey(userId)) || []
    list.unshift(entry)
    inMemoryLogs.set(scanLogKey(userId), list.slice(0, 20))
    return
  }
  await redis.lpush(scanLogKey(userId), entry)
  await redis.ltrim(scanLogKey(userId), 0, 19)
}

export async function getScanLog(userId: string): Promise<Array<{ count: number; at: string }>> {
  if (!redis) {
    const raw = inMemoryLogs.get(scanLogKey(userId)) || []
    return raw.flatMap((r) => {
      try { return [JSON.parse(r)] } catch { return [] }
    })
  }
  const raw = await redis.lrange<string>(scanLogKey(userId), 0, 19)
  return raw.flatMap((r) => {
    try { return [JSON.parse(r)] } catch { return [] }
  })
}

