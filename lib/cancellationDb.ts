export interface CancellationEntry {
  name: string
  keywords: string[]
  cancelUrl: string
  method: 'url' | 'phone' | 'chat'
  notes: string
  difficulty: 'easy' | 'hard'
}

export const CANCELLATION_DB: CancellationEntry[] = [
  {
    name: 'Netflix',
    keywords: ['netflix'],
    cancelUrl: 'https://www.netflix.com/cancelplan',
    method: 'url',
    notes: 'Direct cancel page — no chat required',
    difficulty: 'easy',
  },
  {
    name: 'Spotify',
    keywords: ['spotify'],
    cancelUrl: 'https://www.spotify.com/account/subscription/cancel',
    method: 'url',
    notes: 'Must be logged in',
    difficulty: 'easy',
  },
  {
    name: 'Adobe',
    keywords: ['adobe', 'creative cloud'],
    cancelUrl: 'https://account.adobe.com/plans',
    method: 'url',
    notes: 'Early termination fee may apply',
    difficulty: 'hard',
  },
  {
    name: 'iCloud',
    keywords: ['icloud', 'apple'],
    cancelUrl: 'https://support.apple.com/en-us/118428',
    method: 'url',
    notes: 'Cancel via Apple ID settings',
    difficulty: 'easy',
  },
  {
    name: 'ChatGPT Plus',
    keywords: ['chatgpt', 'openai'],
    cancelUrl: 'https://chat.openai.com/#settings/Subscription',
    method: 'url',
    notes: 'Cancel from subscription settings',
    difficulty: 'easy',
  },
  {
    name: 'Amazon Prime',
    keywords: ['amazon', 'prime'],
    cancelUrl: 'https://www.amazon.com/gp/primecentral',
    method: 'url',
    notes: 'May offer pause instead of cancel',
    difficulty: 'hard',
  },
  {
    name: 'YouTube Premium',
    keywords: ['youtube', 'youtube premium'],
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    method: 'url',
    notes: 'Cancel from memberships page — requires Google login',
    difficulty: 'easy',
  },
  {
    name: 'Disney Plus',
    keywords: ['disney', 'disney+'],
    cancelUrl: 'https://www.disneyplus.com/account',
    method: 'url',
    notes: 'Cancel from account page',
    difficulty: 'easy',
  },
  {
    name: 'Test Service',
    keywords: ['test', 'test service'],
    cancelUrl: 'http://localhost:3006/test-cancel.html',
    method: 'url',
    notes: 'Local test cancellation flow',
    difficulty: 'easy',
  },
]

export function findCancellationEntry(subscriptionName: string): CancellationEntry | null {
  const lower = subscriptionName.toLowerCase()
  return CANCELLATION_DB.find((entry) =>
    entry.keywords.some((keyword) => lower.includes(keyword))
  ) ?? null
}
