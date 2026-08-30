/**
 * SubSnap Popup Controller (v1.0.0)
 * 100% Local-First Privacy · Active Intent Tracking · Unified AI Scout Dispatcher
 */

const TOP_SERVICES = [
  {
    name: 'Gemini Advanced / AI (Google One)',
    keywords: ['gemini', 'gemini ai', 'gemini advanced', 'google gemini', 'ג\'מיני', 'גמיני', 'גמיני ai'],
    cancelUrl: 'https://one.google.com/settings',
    notes: 'Direct Google One & Gemini Advanced subscription settings'
  },
  {
    name: 'Reddit Premium',
    keywords: ['reddit', 'reddit premium', 'רדיט', 'רדיט פרימיום'],
    cancelUrl: 'https://www.reddit.com/settings/premium',
    notes: 'Direct Reddit Premium account settings'
  },
  {
    name: 'ChatGPT Plus (OpenAI)',
    keywords: ['chatgpt', 'openai', 'chat gpt', 'צ\'אט ג\'יפיטי'],
    cancelUrl: 'https://chatgpt.com/#settings/Subscription',
    notes: 'Direct ChatGPT subscription settings'
  },
  {
    name: 'Claude Pro / Max (Anthropic)',
    keywords: ['claude', 'anthropic', 'claude.ai', 'קלוד', 'קלאוד'],
    cancelUrl: 'https://claude.ai/settings/billing',
    notes: 'Direct Anthropic billing & subscription cancellation'
  },
  {
    name: 'Perplexity Pro',
    keywords: ['perplexity', 'perplexity pro', 'perplexity ai', 'פרפלקסיטי'],
    cancelUrl: 'https://www.perplexity.ai/settings/account',
    notes: 'Direct Perplexity Pro subscription settings'
  },
  {
    name: 'Cursor (Anysphere)',
    keywords: ['cursor', 'cursor ai', 'cursor pro', 'קורסור'],
    cancelUrl: 'https://www.cursor.com/settings',
    notes: 'Direct Cursor subscription settings'
  },
  {
    name: 'GitHub Copilot',
    keywords: ['copilot', 'github copilot', 'קופיילוט', 'גיטהאב קופיילוט'],
    cancelUrl: 'https://github.com/settings/billing/summary',
    notes: 'Direct GitHub Copilot subscription settings'
  },
  {
    name: 'Grok / X Premium (Twitter)',
    keywords: ['grok', 'x premium', 'twitter blue', 'xai', 'x.ai', 'twitter', 'גרוק', 'טוויטר', 'x'],
    cancelUrl: 'https://x.com/settings/manage_subscriptions',
    notes: 'Direct X/Grok subscription management'
  },
  {
    name: 'Netflix',
    keywords: ['netflix', 'nflx', 'נטפליקס'],
    cancelUrl: 'https://www.netflix.com/cancelplan',
    notes: 'Direct 1-click Netflix cancellation confirmation'
  },
  {
    name: 'Spotify Premium',
    keywords: ['spotify', 'ספוטיפיי', 'ספוטיפי'],
    cancelUrl: 'https://www.spotify.com/account/subscription/change/',
    notes: 'Direct Spotify change & cancel plan page'
  },
  {
    name: 'YouTube Premium',
    keywords: ['youtube', 'yt premium', 'יוטיוב'],
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    notes: 'Direct YouTube paid memberships'
  },
  {
    name: 'Canva Pro',
    keywords: ['canva', 'קנבה', 'קנווה'],
    cancelUrl: 'https://www.canva.com/settings/billing-and-teams',
    notes: 'Direct Canva billing & team subscription'
  },
  {
    name: 'Adobe Creative Cloud',
    keywords: ['adobe', 'creative cloud', 'photoshop', 'illustrator', 'אדובי'],
    cancelUrl: 'https://account.adobe.com/plans',
    notes: 'Direct Adobe plans & retention bypass'
  },
  {
    name: 'Midjourney',
    keywords: ['midjourney', 'מי ג\'ורני', 'מיגורני'],
    cancelUrl: 'https://www.midjourney.com/account',
    notes: 'Direct Midjourney account subscription management'
  },
  {
    name: 'Amazon Prime',
    keywords: ['amazon', 'prime', 'אמזון', 'אמזון פריים'],
    cancelUrl: 'https://www.amazon.com/mc/manage',
    notes: 'Direct Amazon Prime membership termination'
  },
  {
    name: 'Apple / iCloud+ Subscriptions',
    keywords: ['apple', 'icloud', 'itunes', 'אפל', 'אייקלאוד'],
    cancelUrl: 'https://apps.apple.com/account/subscriptions',
    notes: 'Direct Apple ID active subscriptions'
  },
  {
    name: 'Google One / Play Subscriptions',
    keywords: ['google', 'google one', 'google play', 'גוגל פליי', 'גוגל'],
    cancelUrl: 'https://play.google.com/store/account/subscriptions',
    notes: 'Direct Google Play active subscriptions'
  },
  {
    name: 'Asana',
    keywords: ['asana', 'אסאנה'],
    cancelUrl: 'https://app.asana.com/-/admin',
    notes: 'Direct Asana workspace admin billing'
  },
  {
    name: 'Notion',
    keywords: ['notion', 'נושן', 'נוטיון'],
    cancelUrl: 'https://www.notion.so/settings',
    notes: 'Direct Notion workspace settings & billing'
  },
  {
    name: 'Figma',
    keywords: ['figma', 'פיגמה'],
    cancelUrl: 'https://www.figma.com/settings',
    notes: 'Direct Figma account billing'
  },
  {
    name: 'Slack',
    keywords: ['slack', 'סלאק'],
    cancelUrl: 'https://my.slack.com/admin/billing',
    notes: 'Direct Slack billing & plan management'
  },
  {
    name: 'Monday.com',
    keywords: ['monday', 'monday.com', 'מאנדיי'],
    cancelUrl: 'https://auth.monday.com',
    notes: 'Direct Monday.com account billing'
  },
  {
    name: 'Dropbox',
    keywords: ['dropbox', 'דרופבוקס'],
    cancelUrl: 'https://www.dropbox.com/account/plan',
    notes: 'Direct Dropbox plan cancellation'
  },
  {
    name: 'Zoom',
    keywords: ['zoom', 'זום'],
    cancelUrl: 'https://zoom.us/billing',
    notes: 'Direct Zoom billing management'
  },
  {
    name: 'Grammarly',
    keywords: ['grammarly', 'גרמרלי'],
    cancelUrl: 'https://account.grammarly.com/subscription',
    notes: 'Direct Grammarly subscription settings'
  },
  {
    name: 'Duolingo Super',
    keywords: ['duolingo', 'duolingo super', 'duolingo plus', 'דואולינגו'],
    cancelUrl: 'https://www.duolingo.com/settings/super',
    notes: 'Direct Duolingo Super subscription'
  },
  {
    name: 'LinkedIn Premium',
    keywords: ['linkedin', 'linkedin premium', 'לינקדאין'],
    cancelUrl: 'https://www.linkedin.com/premium/manage/',
    notes: 'Direct LinkedIn Premium management'
  },
  {
    name: 'Microsoft 365 / Office',
    keywords: ['microsoft', 'microsoft 365', 'office 365', 'מיקרוסופט'],
    cancelUrl: 'https://account.microsoft.com/services/',
    notes: 'Direct Microsoft active services & subscriptions'
  },
  {
    name: 'Disney+',
    keywords: ['disney', 'disney+', 'דיסני'],
    cancelUrl: 'https://www.disneyplus.com/account',
    notes: 'Direct Disney+ account cancellation'
  },
  {
    name: 'Proton (ProtonVPN / Proton Mail)',
    keywords: ['proton', 'protonvpn', 'proton mail', 'פרוטון'],
    cancelUrl: 'https://account.proton.me/u/0/mail/dashboard',
    notes: 'Direct Proton account & subscription dashboard'
  },
  {
    name: 'Readwise / Reader',
    keywords: ['readwise', 'readwise.io', 'reader', 'רידווייז'],
    cancelUrl: 'https://readwise.io/preferences/account/',
    notes: 'Direct account & subscription management'
  },
  {
    name: 'Medium Membership',
    keywords: ['medium', 'medium membership', 'מדיום'],
    cancelUrl: 'https://medium.com/me/settings/membership',
    notes: 'Direct Medium membership settings'
  },
  {
    name: 'Vercel',
    keywords: ['vercel', 'ורסל', 'vercel.com'],
    cancelUrl: 'https://vercel.com/dashboard',
    notes: 'Direct Vercel billing & team plan downgrade pathway'
  },
  {
    name: 'Google Connected Apps',
    keywords: ['google connected apps', 'google apps', 'אפליקציות מחוברות', 'חיבורי חשבון גוגל', 'google sign in'],
    cancelUrl: 'https://myaccount.google.com/connections',
    notes: 'Direct Google account third-party connected apps management'
  },
  {
    name: 'GitHub (Pro / Team / Copilot)',
    keywords: ['github', 'גיטהאב'],
    cancelUrl: 'https://github.com/settings/billing/summary',
    notes: 'Direct GitHub billing & plan settings'
  },
  {
    name: 'Tinder Plus / Gold / Platinum',
    keywords: ['tinder', 'tinder gold', 'tinder plus', 'טינדר'],
    cancelUrl: 'https://tinder.com/app/settings',
    notes: 'Direct Tinder subscription settings'
  },
  {
    name: 'Audible (Amazon)',
    keywords: ['audible', 'אודיבל', 'אמזון אודיבל'],
    cancelUrl: 'https://www.audible.com/account/overview',
    notes: 'Direct Audible membership cancellation'
  },
  {
    name: 'NordVPN',
    keywords: ['nordvpn', 'nord vpn', 'נורד'],
    cancelUrl: 'https://my.nordaccount.com/dashboard/nordvpn/',
    notes: 'Direct NordVPN subscription cancellation'
  },
  {
    name: 'Strava Summit / Premium',
    keywords: ['strava', 'סטראבה'],
    cancelUrl: 'https://www.strava.com/settings/account',
    notes: 'Direct Strava account & membership management'
  },
  {
    name: 'PlayStation Plus (Sony)',
    keywords: ['playstation', 'ps plus', 'playstation plus', 'פלייסטיישן'],
    cancelUrl: 'https://store.playstation.com/subscriptions',
    notes: 'Direct PlayStation Plus subscriptions'
  },
  {
    name: 'Xbox Game Pass (Microsoft)',
    keywords: ['xbox', 'game pass', 'xbox game pass', 'אקסבוקס'],
    cancelUrl: 'https://account.microsoft.com/services/xboxgamepass',
    notes: 'Direct Xbox Game Pass subscription management'
  },
  {
    name: 'Wix Premium',
    keywords: ['wix', 'וויקס', 'ויקס'],
    cancelUrl: 'https://manage.wix.com/account/premium-services',
    notes: 'Direct Wix premium subscriptions'
  },
  {
    name: 'Shopify Store Plan',
    keywords: ['shopify', 'שופיפיי'],
    cancelUrl: 'https://admin.shopify.com/store',
    notes: 'Direct Shopify plan & store cancellation'
  },
  {
    name: 'Coursera Plus',
    keywords: ['coursera', 'קורסרה'],
    cancelUrl: 'https://www.coursera.org/my-purchases',
    notes: 'Direct Coursera purchases & subscriptions'
  },
  {
    name: 'The New York Times',
    keywords: ['nytimes', 'ny times', 'new york times', 'ניו יורק טיימס'],
    cancelUrl: 'https://www.nytimes.com/subscription/cancel',
    notes: 'Direct NYTimes subscription cancellation'
  }
]

const searchInput = document.getElementById('searchInput')
const clearBtn = document.getElementById('clearBtn')
const resultCard = document.getElementById('resultCard')
const loadingState = document.getElementById('loadingState')
const serviceNameEl = document.getElementById('serviceName')
const serviceNotesEl = document.getElementById('serviceNotes')
const modeTagEl = document.getElementById('modeTag')
const btnCancel = document.getElementById('btnCancel')
const btnRescan = document.getElementById('btnRescan')
const modeSelect = document.getElementById('modeSelect')
const savedIndicator = document.getElementById('savedIndicator')

let currentEntry = null
let LEARNED_SERVICES = []
let searchDebounceTimer = null
const CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000 // 14 Days Cache Expiration

// Load locally learned services from storage (with automatic TTL eviction) & Trophy Stats
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get(['subsnap_learned_services', 'subsnap_savings_stats'], (res) => {
    if (res && Array.isArray(res.subsnap_learned_services)) {
      const now = Date.now()
      LEARNED_SERVICES = res.subsnap_learned_services.filter(s => !s.savedAt || (now - s.savedAt < CACHE_TTL_MS))
    }

    // Render Trophy Banner (Dopamine Savings Counter)
    const stats = res ? res.subsnap_savings_stats : null
    if (stats && stats.cancelledCount > 0) {
      const banner = document.getElementById('trophyBanner')
      const amountEl = document.getElementById('trophyAmount')
      const subEl = document.getElementById('trophySub')
      if (banner && amountEl && subEl) {
        amountEl.textContent = `₪${stats.totalSavedIls || stats.cancelledCount * 80}`
        subEl.textContent = `${stats.cancelledCount} מנויים בוטלו בהצלחה · שומר הראש הפיננסי שלך 🛡️`
        banner.style.display = 'flex'
      }
    }
  })
}

function saveLearnedService(service) {
  if (!service || !service.name || !service.cancelUrl) return
  const sName = service.name.toLowerCase()
  const exists = LEARNED_SERVICES.some(s => s.name.toLowerCase() === sName)
  if (!exists) {
    LEARNED_SERVICES.unshift({
      name: service.name,
      nameHe: service.nameHe || service.name,
      cancelUrl: service.cancelUrl,
      notes: service.notes || 'AI Scout verified direct cancellation pathway',
      keywords: [sName, ...(service.keywords || [])],
      isLearned: true,
      savedAt: Date.now()
    })
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ subsnap_learned_services: LEARNED_SERVICES.slice(0, 50) })
    }
  }
}

function matchLocalService(query) {
  if (!query || query.trim().length < 2) return null
  const q = query.toLowerCase().trim()
  const all = [...LEARNED_SERVICES, ...TOP_SERVICES]

  return all.find(s => {
    const sName = s.name.toLowerCase()
    const sNameHe = (s.nameHe || '').toLowerCase()
    if (sName === q || sName.startsWith(q) || sNameHe === q || sNameHe.startsWith(q)) return true
    return s.keywords && s.keywords.some(k => k === q || k.startsWith(q) || (q.length >= 3 && k.includes(q)))
  })
}

function showResult(service, sourceTag = '⚡ Verified Pathway') {
  if (!service) {
    resultCard.style.display = 'none'
    currentEntry = null
    return
  }
  currentEntry = service
  serviceNameEl.textContent = service.nameHe ? `${service.name} (${service.nameHe})` : service.name
  serviceNotesEl.textContent = service.notes || 'Direct cancellation pathway identified'
  if (modeTagEl) modeTagEl.textContent = sourceTag

  if (btnCancel) {
    if (service.isNonSubscription) {
      btnCancel.textContent = 'שירות חינמי ✓'
      btnCancel.style.background = '#10b981'
      btnCancel.style.cursor = 'default'
    } else {
      btnCancel.textContent = 'בטל עכשיו ➔'
      btnCancel.style.background = '#0f172a'
      btnCancel.style.cursor = 'pointer'
    }
  }

  resultCard.style.display = 'block'
}

async function queryAIScout(query) {
  try {
    const res = await fetch(`https://www.subsnap.net/api/lookup?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    if (data && data.entry) {
      if (data.entry.isSubscriptionService === false) {
        return {
          name: data.entry.name || query,
          nameHe: data.entry.nameHe,
          cancelUrl: data.entry.cancelUrl || `https://${query}`,
          notes: 'פלטפורמה חינמית ללא מנויים פעילים (קהילה / האקתונים / תוכן). אין חיוב ואין צורך בביטול.',
          keywords: [query.toLowerCase()],
          isNonSubscription: true
        }
      }

      if (data.entry.cancelUrl) {
        const entry = {
          name: data.entry.name || query,
          nameHe: data.entry.nameHe,
          cancelUrl: data.entry.cancelUrl,
          notes: data.entry.notes || 'AI Scout identified direct billing pathway',
          keywords: [query.toLowerCase()],
          isLearned: true
        }
        saveLearnedService(entry)
        return entry
      }
    }
  } catch (err) {}
  
  return {
    name: query,
    cancelUrl: `https://www.google.com/search?q=${encodeURIComponent('how to cancel ' + query + ' subscription')}`,
    notes: 'Direct official billing & cancellation pathway locator',
    isLocal: false
  }
}

function executeCancel(service) {
  if (!service || !service.cancelUrl) return

  resultCard.style.display = 'none'
  loadingState.style.display = 'block'
  document.getElementById('loadingText').textContent = `Opening ${service.name}...`
  document.getElementById('loadingSub').textContent = 'Launching direct cancellation pathway'

  let targetHost = ''
  try {
    targetHost = new URL(service.cancelUrl).hostname.replace(/^www\./, '')
  } catch (e) {}

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({
      subsnap_active_intent: {
        name: service.name,
        targetHost: targetHost,
        cancelUrl: service.cancelUrl,
        timestamp: Date.now()
      }
    }, () => {
      chrome.tabs.create({ url: service.cancelUrl, active: true }, () => {
        setTimeout(() => {
          window.close()
        }, 300)
      })
    })
  } else {
    chrome.tabs.create({ url: service.cancelUrl, active: true })
  }
}

async function handleActionDispatch() {
  const val = searchInput.value.trim()
  if (!val || val.length < 2) {
    searchInput.focus()
    searchInput.style.borderColor = '#ef4444'
    setTimeout(() => {
      searchInput.style.borderColor = '#cbd5e1'
    }, 800)
    return
  }

  const localMatch = matchLocalService(val)
  if (localMatch) {
    executeCancel(localMatch)
  } else {
    resultCard.style.display = 'none'
    loadingState.style.display = 'block'
    document.getElementById('loadingText').textContent = `AI Scout Analyzing "${val}"...`
    document.getElementById('loadingSub').textContent = 'Extracting official billing & cancellation route'

    const lookedUp = await queryAIScout(val)
    if (lookedUp) {
      saveLearnedService(lookedUp)
      executeCancel(lookedUp)
    }
  }
}

searchInput.addEventListener('input', (e) => {
  const val = e.target.value
  clearBtn.style.display = val ? 'block' : 'none'
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  
  if (val.trim().length < 2) {
    showResult(null)
    return
  }

  const localMatch = matchLocalService(val)
  if (localMatch) {
    showResult(localMatch, localMatch.isLearned ? '🤖 AI Learned Pathway' : '⚡ Verified Pathway')
    return
  }

  // Initial feedback stub
  showResult({
    name: val.trim(),
    cancelUrl: '',
    notes: 'Checking cloud database and AI Scout for verified pathway...'
  }, '🤖 AI Scout Ready')

  // Real-time debounced cloud lookup (250ms)
  searchDebounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`https://www.subsnap.net/api/lookup?q=${encodeURIComponent(val.trim())}`)
      const data = await res.json()
      // Only apply if user hasn't changed the input in the meantime
      if (searchInput.value.trim().toLowerCase() === val.trim().toLowerCase() && data && data.entry) {
        if (data.entry.isSubscriptionService === false) {
          showResult({
            name: data.entry.name || val.trim(),
            nameHe: data.entry.nameHe,
            cancelUrl: data.entry.cancelUrl || `https://${val.trim()}`,
            notes: 'פלטפורמה חינמית ללא מנויים פעילים (קהילה / האקתונים / תוכן). אין חיוב ואין צורך בביטול.',
            isNonSubscription: true
          }, '🛡️ פלטפורמה חינמית')
          return
        }

        if (data.entry.cancelUrl) {
          const learned = {
            name: data.entry.name || val.trim(),
            nameHe: data.entry.nameHe,
            cancelUrl: data.entry.cancelUrl,
            notes: data.entry.notes || 'AI Scout verified direct cancellation pathway',
            keywords: [val.trim().toLowerCase()],
            isLearned: true
          }
          saveLearnedService(learned)
          showResult(learned, data.source === 'cache' || data.source === 'global_redis_cache' ? '⚡ Cloud Synced' : '🤖 AI Scout Discovered')
        }
      }
    } catch (err) {}
  }, 250)
})

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleActionDispatch()
  }
})

clearBtn.addEventListener('click', () => {
  searchInput.value = ''
  clearBtn.style.display = 'none'
  showResult(null)
  searchInput.focus()
})

async function forceRescanService() {
  const val = searchInput.value.trim()
  if (!val || val.length < 2) return

  if (btnRescan) {
    btnRescan.style.animation = 'spin 0.6s linear infinite'
  }

  // 1. Evict from local memory
  const q = val.toLowerCase()
  LEARNED_SERVICES = LEARNED_SERVICES.filter(s => s.name.toLowerCase() !== q && (!s.keywords || !s.keywords.includes(q)))
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ subsnap_learned_services: LEARNED_SERVICES })
  }

  showResult({
    name: val,
    cancelUrl: '',
    notes: 'Re-analyzing and fetching latest direct cancellation pathway with AI...'
  }, '🔄 AI Re-scanning...')

  try {
    const res = await fetch(`https://www.subsnap.net/api/lookup?q=${encodeURIComponent(val)}&force=true`)
    const data = await res.json()
    if (data && data.entry && data.entry.cancelUrl) {
      const learned = {
        name: data.entry.name || val,
        nameHe: data.entry.nameHe,
        cancelUrl: data.entry.cancelUrl,
        notes: data.entry.notes || 'AI Scout refreshed direct billing pathway',
        keywords: [val.toLowerCase()],
        isLearned: true,
        savedAt: Date.now()
      }
      saveLearnedService(learned)
      showResult(learned, '🤖 AI Refreshed')
    } else {
      showResult(null)
    }
  } catch (err) {
    showResult(null)
  } finally {
    if (btnRescan) {
      btnRescan.style.animation = 'none'
    }
  }
}

if (btnRescan) {
  btnRescan.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    forceRescanService()
  })
}

btnCancel.addEventListener('click', (e) => {
  e.preventDefault()
  handleActionDispatch()
})

if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get(['autopilot_mode'], (res) => {
    if (res.autopilot_mode && res.autopilot_mode !== 'instant') {
      modeSelect.value = res.autopilot_mode
    } else {
      modeSelect.value = 'countdown_5s'
      chrome.storage.local.set({ autopilot_mode: 'countdown_5s' })
    }
  })

  modeSelect.addEventListener('change', (e) => {
    chrome.storage.local.set({ autopilot_mode: e.target.value }, () => {
      savedIndicator.style.display = 'inline'
      setTimeout(() => {
        savedIndicator.style.display = 'none'
      }, 1500)
    })
  })
}
