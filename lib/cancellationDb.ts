export interface CancellationEntry {
  name: string
  keywords: string[]
  cancelUrl: string
  method: 'url' | 'phone' | 'chat'
  notes: string
  difficulty: 'easy' | 'hard'
  tier: 'auto' | 'session' | 'manual'
  steps?: string[]   // service-specific hints passed to AI prompt
}

export const CANCELLATION_DB: CancellationEntry[] = [
  {
    name: 'Netflix',
    keywords: ['netflix'],
    cancelUrl: 'https://www.netflix.com/cancelplan',
    method: 'url',
    notes: 'Direct cancel page — no chat required',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Spotify',
    keywords: ['spotify'],
    cancelUrl: 'https://www.spotify.com/account/subscription/cancel',
    method: 'url',
    notes: 'Must be logged in',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Adobe',
    keywords: ['adobe', 'creative cloud'],
    cancelUrl: 'https://account.adobe.com/plans',
    method: 'url',
    notes: 'Early termination fee may apply',
    difficulty: 'hard',
    tier: 'session',
  },
  {
    name: 'iCloud',
    keywords: ['icloud', 'apple'],
    cancelUrl: 'https://support.apple.com/en-us/118428',
    method: 'url',
    notes: 'Cancel via Apple ID settings',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'ChatGPT Plus',
    keywords: ['chatgpt', 'openai'],
    cancelUrl: 'https://chat.openai.com/#settings/Subscription',
    method: 'url',
    notes: 'Cancel from subscription settings',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Amazon Prime',
    keywords: ['amazon', 'prime'],
    cancelUrl: 'https://www.amazon.com/gp/primecentral',
    method: 'url',
    notes: 'May offer pause instead of cancel',
    difficulty: 'hard',
    tier: 'session',
    steps: [
      'Look for a link that says "Update, cancel and more" and click it',
      'Click "End membership" or "Cancel membership"',
      'If you see a retention offer (pause, discounted plan), click "Continue to cancel" or "No thanks"',
      'Click the final confirm button to complete cancellation',
    ],
  },
  {
    name: 'YouTube Premium',
    keywords: ['youtube', 'youtube premium'],
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    method: 'url',
    notes: 'Cancel from memberships page — requires Google login',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Disney Plus',
    keywords: ['disney', 'disney+'],
    cancelUrl: 'https://www.disneyplus.com/account',
    method: 'url',
    notes: 'Cancel from account page',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Canva',
    keywords: ['canva'],
    cancelUrl: 'https://www.canva.com/settings/billing',
    method: 'url',
    notes: 'Cancel from billing settings',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Test Service',
    keywords: ['test', 'test service'],
    cancelUrl: 'http://localhost:3009/test-cancel',
    method: 'url',
    notes: 'Local test cancellation flow',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Test Easy',
    keywords: ['test easy', 'easystream'],
    cancelUrl: 'http://localhost:3009/test-easy',
    method: 'url',
    notes: 'Local easy-flow test — direct cancel button visible',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Test Hard',
    keywords: ['test hard', 'darkstream'],
    cancelUrl: 'http://localhost:3009/test-hard',
    method: 'url',
    notes: 'Local dark-patterns test — retention popup, survey, pause offer',
    difficulty: 'hard',
    tier: 'session',
    steps: [
      'Sign in with the pre-filled credentials',
      'Click "Manage Subscription"',
      'On the retention popup, click "Continue to cancel"',
      'Select any survey option and click "Next"',
      'On the pause offer screen, click "No thanks, cancel anyway"',
      'Click "Confirm cancellation" to complete',
    ],
  },
]

export function findCancellationEntry(subscriptionName: string): CancellationEntry | null {
  const lower = subscriptionName.toLowerCase()
  return CANCELLATION_DB.find((entry) =>
    entry.keywords.some((keyword) => lower.includes(keyword))
  ) ?? null
}
