export interface CancellationEntry {
  name: string
  nameHe?: string
  keywords: string[]
  loginUrl: string
  cancelUrl: string
  method: 'url' | 'chat' | 'phone'
  notes?: string
  difficulty: 'easy' | 'hard'
  tier?: 'auto' | 'session' | 'manual'
  steps?: string[]
}

export const CANCELLATION_DB: CancellationEntry[] = [
  {
    name: 'Netflix',
    nameHe: 'נטפליקס (Netflix)',
    keywords: ['netflix', 'nflx', 'netflix.com', 'netflix international', 'נטפליקס', 'נטפליכס'],
    loginUrl: 'https://www.netflix.com/login',
    cancelUrl: 'https://www.netflix.com/cancelplan',
    method: 'url',
    notes: 'עמוד אישור ביטול ישיר של נטפליקס',
    difficulty: 'easy',
    tier: 'auto',
    steps: [
      'העמוד נפתח ישירות על מסך ביטול המנוי',
      'לוחצים על Finish Cancellation (סיום ביטול)',
      'המנוי מבוטל מיד ותישאר גישה עד סוף תקופת החיוב',
    ],
  },
  {
    name: 'Grok / X Premium',
    nameHe: 'גרוק / X פרימיום (טוויטר)',
    keywords: ['grok', 'x premium', 'twitter blue', 'xai', 'x.ai', 'twitter', 'גרוק', 'טוויטר', 'איקס', 'x'],
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
    nameHe: 'ספוטיפיי (Spotify Premium)',
    keywords: ['spotify', 'spotifyusa', 'spotify ab', 'spotify.com', 'spotify usa', 'ספוטיפיי', 'ספוטיפי'],
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
    nameHe: 'אדובי (Adobe Creative Cloud)',
    keywords: ['adobe', 'creative cloud', 'adobe systems', 'adobe inc', 'adobe.com', 'אדובי', 'פוטושופ'],
    loginUrl: 'https://account.adobe.com/',
    cancelUrl: 'https://account.adobe.com/plans',
    method: 'url',
    notes: 'עמוד ניהול התוכניות והביטול של אדובי',
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
    nameHe: 'אפל / אייקלאוד / אפסטור',
    keywords: ['icloud', 'apple', 'apple.com', 'apple services', 'apple inc', 'itunes', 'אפל', 'אייקלאוד', 'אפסטור', 'אייטיונס'],
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
    nameHe: 'צ\'אט ג\'יפיטי פלוס (OpenAI)',
    keywords: ['chatgpt', 'openai', 'openai.com', 'chat.openai', 'openai *chatgpt', 'צ\'אט ג\'יפיטי', 'צ\'ט ג\'יפיטי', 'צאט גפיטי', 'אופן איי איי'],
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
    name: 'Canva Pro',
    nameHe: 'קנבה פרו (Canva Pro)',
    keywords: ['canva', 'canva pty', 'canva.com', 'קנבה', 'קנווה'],
    loginUrl: 'https://www.canva.com/login',
    cancelUrl: 'https://www.canva.com/settings/billing-and-teams',
    method: 'url',
    notes: 'עמוד חיובים וביטול מנוי ב-Canva',
    difficulty: 'easy',
    tier: 'auto',
    steps: [
      'עוברים ללשונית מנויים בהגדרות',
      'לוחצים על שלוש הנקודות ליד המנוי',
      'בוחרים ב-Cancel subscription (בטל מנוי)',
    ],
  },
  {
    name: 'Amazon Prime',
    nameHe: 'אמזון פריים (Amazon Prime)',
    keywords: ['amazon', 'prime', 'amzn', 'amznprime', 'amazon.com', 'amazon digital', 'prime video', 'amazon prime', 'אמזון', 'פריים', 'אמזון פריים'],
    loginUrl: 'https://www.amazon.com/ap/signin',
    cancelUrl: 'https://www.amazon.com/mc/manage',
    method: 'url',
    notes: 'עמוד ניהול וסיום מנוי Prime',
    difficulty: 'hard',
    tier: 'session',
    steps: [
      'לוחצים על Manage Membership (נהל מנוי)',
      'בוחרים ב-End Membership (סיים חברות)',
      'במסכי השימור לוחצים על Continue to cancel',
      'מאשרים את הביטול במסך הסופי',
    ],
  },
  {
    name: 'YouTube Premium',
    nameHe: 'יוטיוב פרימיום (YouTube Premium)',
    keywords: ['youtube', 'youtube premium', 'google youtube', 'yt premium', 'googleyoutube', 'יוטיוב', 'יוטיוב פרימיום'],
    loginUrl: 'https://accounts.google.com/',
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    method: 'url',
    notes: 'עמוד ניהול המנויים של יוטיוב',
    difficulty: 'easy',
    tier: 'auto',
    steps: [
      'לוחצים על מנוי הפרימיום הפעיל',
      'בוחרים ב-Deactivate (השבת / בטל)',
      'מאשרים את המעבר לחשבון חינמי',
    ],
  },
  {
    name: 'Disney Plus',
    nameHe: 'דיסני פלוס (Disney+)',
    keywords: ['disney', 'disney+', 'disneyplus', 'disney plus', 'disney.com', 'dsny+', 'דיסני', 'דיסני פלוס'],
    loginUrl: 'https://www.disneyplus.com/login',
    cancelUrl: 'https://www.disneyplus.com/account',
    method: 'url',
    notes: 'ביטול מנוי בהגדרות חשבון דיסני',
    difficulty: 'easy',
    tier: 'auto',
    steps: [
      'בוחרים במנוי דיסני פלוס',
      'לוחצים על Cancel Subscription (בטל מנוי)',
      'בוחרים סיבה ומאשרים ביטול',
    ],
  },
  {
    name: 'Google Play / Android',
    nameHe: 'גוגל פליי / מנויי אנדרואיד',
    keywords: ['google play', 'android', 'גוגל פליי', 'אנדרואיד', 'גוגל', 'google'],
    loginUrl: 'https://accounts.google.com/',
    cancelUrl: 'https://play.google.com/store/account/subscriptions',
    method: 'url',
    notes: 'ניהול וביטול כל מנויי Google Play',
    difficulty: 'easy',
    tier: 'auto',
    steps: [
      'נכנסים לרשימת המנויים של חשבון Google',
      'בוחרים את האפליקציה שברצונכם לבטל',
      'לוחצים על Cancel Subscription (בטל מנוי)',
    ],
  },
  {
    name: 'Dropbox',
    nameHe: 'דרופבוקס (Dropbox)',
    keywords: ['dropbox', 'dropbox inc', 'dropbox.com', 'דרופבוקס'],
    loginUrl: 'https://www.dropbox.com/login',
    cancelUrl: 'https://www.dropbox.com/account/plan',
    method: 'url',
    notes: 'שנמוך לחשבון חינמי',
    difficulty: 'easy',
    tier: 'manual',
    steps: [
      'נכנסים להגדרות התוכנית (Plan)',
      'לוחצים על Change plan או Cancel subscription',
      'בוחרים בחשבון החינמי',
    ],
  },
  {
    name: 'Google One',
    nameHe: 'גוגל וואן (Google One Storage)',
    keywords: ['google one', 'google one storage', 'google storage', 'גוגל וואן', 'אחסון גוגל'],
    loginUrl: 'https://one.google.com',
    cancelUrl: 'https://one.google.com/storage',
    method: 'url',
    notes: 'שנמוך לשטח אחסון חינמי (15GB)',
    difficulty: 'easy',
    tier: 'manual',
    steps: [
      'נכנסים להגדרות אחסון גוגל',
      'לוחצים על שינוי תוכנית ובחירה בחשבון חינמי',
    ],
  }
]

export function findCancellationEntry(serviceName: string): CancellationEntry | null {
  const normalized = serviceName.toLowerCase().trim()
  for (const entry of CANCELLATION_DB) {
    if (entry.name.toLowerCase() === normalized || entry.nameHe?.toLowerCase() === normalized) {
      return entry
    }
    for (const keyword of entry.keywords) {
      if (normalized.includes(keyword) || keyword.includes(normalized)) {
        return entry
      }
    }
  }
  return null
}
