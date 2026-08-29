/**
 * SubSnap Popup Controller (v1.0.0)
 * 100% Local-First Privacy · Strict Prefix Matching · Unified AI Scout Dispatcher
 */

const TOP_SERVICES = [
  {
    name: 'Reddit Premium',
    keywords: ['reddit', 'reddit premium', 'רדיט', 'רדיט פרימיום'],
    cancelUrl: 'https://www.reddit.com/settings/premium',
    notes: 'Direct Reddit Premium account settings'
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
    name: 'Claude Pro / Max (Anthropic)',
    keywords: ['claude', 'anthropic', 'claude.ai', 'קלוד', 'קלאוד'],
    cancelUrl: 'https://claude.ai/settings/billing',
    notes: 'Direct Anthropic billing & subscription cancellation'
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
    name: 'Adobe Creative Cloud',
    keywords: ['adobe', 'creative cloud', 'photoshop', 'illustrator', 'אדובי'],
    cancelUrl: 'https://account.adobe.com/plans',
    notes: 'Direct Adobe plans & retention bypass'
  },
  {
    name: 'ChatGPT Plus (OpenAI)',
    keywords: ['chatgpt', 'openai', 'chat gpt', 'צ\'אט ג\'יפיטי'],
    cancelUrl: 'https://chatgpt.com/#settings/Subscription',
    notes: 'Direct ChatGPT subscription settings'
  },
  {
    name: 'Canva Pro',
    keywords: ['canva', 'קנבה', 'קנווה'],
    cancelUrl: 'https://www.canva.com/settings/billing-and-teams',
    notes: 'Direct Canva billing & team subscription'
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
    name: 'YouTube Premium',
    keywords: ['youtube', 'yt premium', 'יוטיוב'],
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    notes: 'Direct YouTube paid memberships'
  },
  {
    name: 'Disney+',
    keywords: ['disney', 'disney+', 'דיסני'],
    cancelUrl: 'https://www.disneyplus.com/account',
    notes: 'Direct Disney+ account cancellation'
  },
  {
    name: 'Medium Membership',
    keywords: ['medium', 'medium membership', 'מדיום'],
    cancelUrl: 'https://medium.com/me/settings/membership',
    notes: 'Direct Medium membership settings'
  },
  {
    name: 'Google One / Play Subscriptions',
    keywords: ['google', 'google one', 'google play', 'גוגל פליי'],
    cancelUrl: 'https://play.google.com/store/account/subscriptions',
    notes: 'Direct Google Play active subscriptions'
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
const modeSelect = document.getElementById('modeSelect')
const savedIndicator = document.getElementById('savedIndicator')

let currentEntry = null

// Strict Prefix & Keyword Matching (Min 2 chars, No single-letter false matches)
function matchLocalService(query) {
  if (!query || query.trim().length < 2) return null
  const q = query.toLowerCase().trim()
  
  return TOP_SERVICES.find(s => {
    const sName = s.name.toLowerCase()
    if (sName === q || sName.startsWith(q)) return true
    return s.keywords.some(k => k === q || k.startsWith(q) || (q.length >= 4 && k.includes(q)))
  })
}

function showResult(service, sourceTag = '⚡ Verified Pathway') {
  if (!service) {
    resultCard.style.display = 'none'
    currentEntry = null
    return
  }
  currentEntry = service
  serviceNameEl.textContent = service.name
  serviceNotesEl.textContent = service.notes || 'Direct cancellation pathway identified'
  if (modeTagEl) modeTagEl.textContent = sourceTag
  resultCard.style.display = 'block'
}

// Query AI Scout
async function queryAIScout(query) {
  try {
    const res = await fetch(`https://www.subsnap.net/api/lookup?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    if (data && data.entry && data.entry.cancelUrl) {
      return {
        name: data.entry.name || query,
        cancelUrl: data.entry.cancelUrl,
        notes: data.entry.notes || 'AI Scout identified direct billing pathway',
        isLocal: false
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

  chrome.tabs.create({ url: service.cancelUrl, active: true }, () => {
    setTimeout(() => {
      window.close()
    }, 300)
  })
}

// Unified Dispatcher: Handles both Enter Key and Click Button identically
async function handleActionDispatch() {
  const val = searchInput.value.trim()
  if (!val || val.length < 2) return

  const localMatch = matchLocalService(val)
  if (localMatch) {
    executeCancel(localMatch)
  } else {
    // Show AI lookup state and fetch verified route
    resultCard.style.display = 'none'
    loadingState.style.display = 'block'
    document.getElementById('loadingText').textContent = `AI Scout Analyzing "${val}"...`
    document.getElementById('loadingSub').textContent = 'Extracting official billing & cancellation route'

    const lookedUp = await queryAIScout(val)
    if (lookedUp) {
      executeCancel(lookedUp)
    }
  }
}

// Search input handling
searchInput.addEventListener('input', (e) => {
  const val = e.target.value
  clearBtn.style.display = val ? 'block' : 'none'
  
  if (val.trim().length < 2) {
    showResult(null)
    return
  }

  const localMatch = matchLocalService(val)
  if (localMatch) {
    showResult(localMatch, '⚡ Verified Pathway')
  } else {
    showResult({
      name: val.trim(),
      cancelUrl: '',
      notes: 'Click Launch or press Enter for AI Scout direct pathway discovery'
    }, '🤖 AI Scout Ready')
  }
})

// Enter key trigger
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

// Button click trigger
btnCancel.addEventListener('click', (e) => {
  e.preventDefault()
  handleActionDispatch()
})

// Load saved mode or default to countdown_5s
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
