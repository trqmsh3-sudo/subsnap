// ─── Plan definitions ─────────────────────────────────────────────────────────
// Kept in a separate file so client components can import without pulling in
// the server-only Redis client from lib/credits.ts.

export const PLANS = [
  {
    id: 'scan',
    name: 'Full Scan',
    price: 5,
    credits: 1,
    popular: true,
    variantId: '1518339',
  },
] as const

export const CREDITS_BY_VARIANT: Record<string, number> = {
  '1518339': 1,
}
