const KEY = 'subsnap_credits'

export function getLocalCredits(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(KEY) ?? '0', 10)
}

export function addLocalCredits(amount: number): number {
  const next = getLocalCredits() + amount
  localStorage.setItem(KEY, String(next))
  return next
}

export function deductLocalCredit(): boolean {
  const current = getLocalCredits()
  if (current <= 0) return false
  localStorage.setItem(KEY, String(current - 1))
  return true
}
