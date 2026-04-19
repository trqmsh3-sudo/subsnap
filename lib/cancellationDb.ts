import jdmDb from './jdm-db.json'

export interface CancellationEntry {
  name: string
  keywords: string[]
  loginUrl: string
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
    keywords: ['netflix', 'nflx', 'netflix.com', 'netflix international'],
    loginUrl: 'https://www.netflix.com/login',
    cancelUrl: 'https://www.netflix.com/cancelplan',
    method: 'url',
    notes: 'Direct cancel page — no chat required',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Spotify',
    keywords: ['spotify', 'spotifyusa', 'spotify ab', 'spotify.com', 'spotify usa'],
    loginUrl: 'https://accounts.spotify.com/en/login',
    cancelUrl: 'https://www.spotify.com/account/subscription/cancel',
    method: 'url',
    notes: 'Must be logged in',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Adobe',
    keywords: ['adobe', 'creative cloud', 'adobe systems', 'adobe inc', 'adobe.com'],
    loginUrl: 'https://account.adobe.com/',
    cancelUrl: 'https://account.adobe.com/plans',
    method: 'url',
    notes: 'Early termination fee may apply',
    difficulty: 'hard',
    tier: 'session',
  },
  {
    name: 'iCloud',
    keywords: ['icloud', 'apple', 'apple.com', 'apple services', 'apple inc', 'itunes'],
    loginUrl: 'https://appleid.apple.com/',
    cancelUrl: 'https://support.apple.com/en-us/118428',
    method: 'url',
    notes: 'Cancel via Apple ID settings',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'ChatGPT Plus',
    keywords: ['chatgpt', 'openai', 'openai.com', 'chat.openai', 'openai *chatgpt'],
    loginUrl: 'https://chat.openai.com/',
    cancelUrl: 'https://chat.openai.com/#settings/Subscription',
    method: 'url',
    notes: 'Cancel from subscription settings',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Amazon Prime',
    keywords: ['amazon', 'prime', 'amzn', 'amznprime', 'amazon.com', 'amazon digital', 'prime video', 'amazon prime'],
    loginUrl: 'https://www.amazon.com/ap/signin',
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
    keywords: ['youtube', 'youtube premium', 'google youtube', 'yt premium', 'googleyoutube'],
    loginUrl: 'https://accounts.google.com/',
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    method: 'url',
    notes: 'Cancel from memberships page — requires Google login',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Disney Plus',
    keywords: ['disney', 'disney+', 'disneyplus', 'disney plus', 'disney.com', 'dsny+'],
    loginUrl: 'https://www.disneyplus.com/login',
    cancelUrl: 'https://www.disneyplus.com/account',
    method: 'url',
    notes: 'Cancel from account page',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Canva',
    keywords: ['canva', 'canva pty', 'canva.com'],
    loginUrl: 'https://www.canva.com/login',
    cancelUrl: 'https://www.canva.com/settings/billing',
    method: 'url',
    notes: 'Cancel from billing settings',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Test Service',
    keywords: ['test', 'test service'],
    loginUrl: 'http://localhost:3009/',
    cancelUrl: 'http://localhost:3009/test-cancel',
    method: 'url',
    notes: 'Local test cancellation flow',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Test Easy',
    keywords: ['test easy', 'easystream'],
    loginUrl: 'http://localhost:3009/',
    cancelUrl: 'http://localhost:3009/test-easy',
    method: 'url',
    notes: 'Local easy-flow test — direct cancel button visible',
    difficulty: 'easy',
    tier: 'auto',
  },
  {
    name: 'Test Hard',
    keywords: ['test hard', 'darkstream'],
    loginUrl: 'http://localhost:3009/',
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
  {
    name: 'Dropbox',
    keywords: ['dropbox', 'dropbox inc', 'dropbox.com'],
    loginUrl: 'https://www.dropbox.com/login',
    cancelUrl: 'https://www.dropbox.com/account/plan',
    method: 'url',
    notes: 'Downgrade to the free plan to cancel paid subscription',
    difficulty: 'easy',
    tier: 'manual',
    steps: [
      'Sign in to your Dropbox account',
      'Go to Account → Plan',
      'Click "Change plan" and select the free plan to cancel',
    ],
  },
  {
    name: 'Google One',
    keywords: ['google one', 'google one storage', 'google storage'],
    loginUrl: 'https://one.google.com',
    cancelUrl: 'https://one.google.com/storage',
    method: 'url',
    notes: 'Downgrade to the free 15GB tier to cancel paid plan',
    difficulty: 'easy',
    tier: 'manual',
    steps: [
      'Go to one.google.com and sign in',
      'Click "Manage" next to your storage plan',
      'Select "Downgrade" and choose the free tier',
    ],
  },
]

// JDM entries merged in — our hand-curated entries take priority
const MERGED_DB: CancellationEntry[] = [
  ...CANCELLATION_DB,
  ...(jdmDb as CancellationEntry[]),
]

export function findCancellationEntry(subscriptionName: string): CancellationEntry | null {
  const lower = subscriptionName.toLowerCase()
  return MERGED_DB.find((entry) =>
    entry.keywords.some((keyword) => lower.includes(keyword))
  ) ?? null
}
