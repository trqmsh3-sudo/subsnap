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
    name: 'Grok / X Premium',
    keywords: ['grok', 'x premium', 'twitter blue', 'xai', 'x.ai', 'twitter', 'גרוק', 'טוויטר'],
    loginUrl: 'https://x.com/i/flow/login',
    cancelUrl: 'https://x.com/settings/manage_subscriptions',
    method: 'url',
    notes: 'ניהול וביטול מנוי ישיר בהגדרות X/Grok',
    difficulty: 'easy',
    tier: 'auto',
    steps: [
      'נכנסים לעמוד ניהול המנוי של X',
      'לוחצים על Manage Subscription (נהל מנוי)',
      'בוחרים ב-Cancel Subscription (בטל מנוי)',
      'מאשרים את הביטול',
    ],
  },
  {
    name: 'Spotify',
    keywords: ['spotify', 'spotifyusa', 'spotify ab', 'spotify.com', 'spotify usa', 'ספוטיפיי'],
    loginUrl: 'https://accounts.spotify.com/en/login',
    cancelUrl: 'https://www.spotify.com/account/subscription/change/',
    method: 'url',
    notes: 'מעבר ישיר לעמוד ביטול Spotify Premium',
    difficulty: 'easy',
    tier: 'auto',
    steps: [
      'גוללים למטה עד לתוכנית Premium הנוכחית',
      'לוחצים על Cancel Premium (בטל פרימיום)',
      'מאשרים את המעבר לחשבון החינמי',
    ],
  },
  {
    name: 'Adobe Creative Cloud',
    keywords: ['adobe', 'creative cloud', 'adobe systems', 'adobe inc', 'adobe.com', 'אדובי'],
    loginUrl: 'https://account.adobe.com/',
    cancelUrl: 'https://account.adobe.com/plans',
    method: 'url',
    notes: 'עמוד ניהול התוכניות של אדובי',
    difficulty: 'hard',
    tier: 'session',
    steps: [
      'לוחצים על Manage Plan (נהל תוכנית)',
      'בוחרים ב-Cancel your plan (בטל את התוכנית שלך)',
      'במסכי השימור לוחצים על Continue to cancel',
      'בוחרים סיבה ומאשרים ביטול',
    ],
  },
  {
    name: 'Apple / iCloud / App Store',
    keywords: ['icloud', 'apple', 'apple.com', 'apple services', 'apple inc', 'itunes', 'אפל', 'אייקלאוד'],
    loginUrl: 'https://appleid.apple.com/',
    cancelUrl: 'https://apps.apple.com/account/subscriptions',
    method: 'url',
    notes: 'פותח ישירות את רשימת כל המנויים הפעילים בחשבון Apple',
    difficulty: 'easy',
    tier: 'auto',
    steps: [
      'העמוד פותח את רשימת המנויים הפעילים ב-Apple ID',
      'לוחצים על המנוי שברצונכם לבטל',
      'לוחצים על Cancel Subscription (בטל מנוי)',
    ],
  },
  {
    name: 'ChatGPT Plus',
    keywords: ['chatgpt', 'openai', 'openai.com', 'chat.openai', 'openai *chatgpt', 'צ\'אט ג\'יפיטי'],
    loginUrl: 'https://chatgpt.com/auth/login',
    cancelUrl: 'https://chatgpt.com/#settings/Subscription',
    method: 'url',
    notes: 'ביטול מנוי בהגדרות ChatGPT',
    difficulty: 'easy',
    tier: 'auto',
    steps: [
      'ההגדרות של ChatGPT נפתחות',
      'לוחצים על Manage my subscription (נהל מנוי)',
      'בפורטל התשלומים לוחצים על Cancel plan',
    ],
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
