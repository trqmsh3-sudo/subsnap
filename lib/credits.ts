// In-memory store for demo purposes.
// Replace with a database (e.g. Redis, Postgres) in production.
const creditStore = new Map<string, number>()
const freeUsed = new Set<string>()

export function getCredits(userId: string): number {
  return creditStore.get(userId) ?? 0
}

export function addCredits(userId: string, amount: number): void {
  creditStore.set(userId, getCredits(userId) + amount)
}

export function deductCredit(userId: string): boolean {
  const current = getCredits(userId)
  if (current <= 0) return false
  creditStore.set(userId, current - 1)
  return true
}

export function hasFreeCancel(userId: string): boolean {
  return !freeUsed.has(userId)
}

export function useFreeCancel(userId: string): void {
  freeUsed.add(userId)
}

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
