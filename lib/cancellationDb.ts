export interface CancellationEntry {
  name: string
  keywords: string[]
  cancelUrl: string
  method: 'url' | 'phone' | 'chat'
  notes: string
}

export const CANCELLATION_DB: CancellationEntry[] = [
  {
    name: 'Netflix',
    keywords: ['netflix'],
    cancelUrl: 'https://www.netflix.com/cancelplan',
    method: 'url',
    notes: 'Direct cancel page — no chat required',
  },
  {
    name: 'Spotify',
    keywords: ['spotify'],
    cancelUrl: 'https://www.spotify.com/account/subscription/cancel',
    method: 'url',
    notes: 'Must be logged in',
  },
  {
    name: 'Adobe',
    keywords: ['adobe', 'creative cloud'],
    cancelUrl: 'https://account.adobe.com/plans',
    method: 'url',
    notes: 'Early termination fee may apply',
  },
  {
    name: 'iCloud',
    keywords: ['icloud', 'apple'],
    cancelUrl: 'https://support.apple.com/en-us/118428',
    method: 'url',
    notes: 'Cancel via Apple ID settings',
  },
  {
    name: 'ChatGPT Plus',
    keywords: ['chatgpt', 'openai'],
    cancelUrl: 'https://chat.openai.com/#settings/Subscription',
    method: 'url',
    notes: 'Cancel from subscription settings',
  },
  {
    name: 'Amazon Prime',
    keywords: ['amazon', 'prime'],
    cancelUrl: 'https://www.amazon.com/gp/primecentral',
    method: 'url',
    notes: 'May offer pause instead of cancel',
  },
  {
    name: 'YouTube Premium',
    keywords: ['youtube', 'youtube premium'],
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    method: 'url',
    notes: 'Cancel from memberships page — requires Google login',
  },
  {
    name: 'Disney Plus',
    keywords: ['disney', 'disney+'],
    cancelUrl: 'https://www.disneyplus.com/account',
    method: 'url',
    notes: 'Cancel from account page',
  },
  {
    name: 'Test Service',
    keywords: ['test', 'test service'],
    cancelUrl: 'http://localhost:3006/test-cancel.html',
    method: 'url',
    notes: 'Local test cancellation flow',
  },
]

export function findCancellationEntry(subscriptionName: string): CancellationEntry | null {
  const lower = subscriptionName.toLowerCase()
  return CANCELLATION_DB.find((entry) =>
    entry.keywords.some((keyword) => lower.includes(keyword))
  ) ?? null
}
