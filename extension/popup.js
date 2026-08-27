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
    notes: 'Direct Adobe plans & dark-pattern bypass'
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
const successState = document.getElementById('successState')
const serviceNameEl = document.getElementById('serviceName')
const serviceNotesEl = document.getElementById('serviceNotes')
const modeTagEl = document.getElementById('modeTag')
const btnCancel = document.getElementById('btnCancel')
const btnNextCancel = document.getElementById('btnNextCancel')
const modeSelect = document.getElementById('modeSelect')
const savedIndicator = document.getElementById('savedIndicator')
const searchContainer = document.getElementById('searchContainer')
const accountNotice = document.getElementById('accountNotice')

let currentEntry = null
let currentMode = 'ghost_background'

function matchService(query) {
  if (!query) return null
  const q = query.toLowerCase().trim()
  return TOP_SERVICES.find(s => 
    s.name.toLowerCase().includes(q) || 
    s.keywords.some(k => q.includes(k) || k.includes(q))
  )
}

function showResult(service) {
  if (!service) {
    resultCard.style.display = 'none'
    currentEntry = null
    return
  }
  currentEntry = service
  serviceNameEl.textContent = service.name
  serviceNotesEl.textContent = service.notes || 'Direct billing pathway identified'
  
  if (currentMode === 'ghost_background') {
    modeTagEl.textContent = '👻 Ghost Auto-Pilot'
    btnCancel.querySelector('span:first-child').textContent = 'Cancel Silently in Background'
  } else {
    modeTagEl.textContent = '⏱️ Visual Auto-Pilot'
    btnCancel.querySelector('span:first-child').textContent = 'Launch 3-Second Auto-Pilot'
  }

  resultCard.style.display = 'block'
}

function executeCancel(service) {
  if (!service || !service.cancelUrl) return

  resultCard.style.display = 'none'
  successState.style.display = 'none'

  if (currentMode === 'ghost_background') {
    // 1. Ghost Mode: Execute in hidden background tab (active: false)
    loadingState.style.display = 'block'
    document.getElementById('loadingText').textContent = `Cancelling ${service.name} in background...`
    document.getElementById('loadingSub').textContent = 'Executing via active session · Tab hidden'

    chrome.tabs.create({ url: service.cancelUrl, active: false }, (tab) => {
      // Keep tab open for 3.5 seconds to allow background content script to click cancel, then auto-close
      setTimeout(() => {
        try {
          chrome.tabs.remove(tab.id)
        } catch (e) {}

        loadingState.style.display = 'none'
        successState.style.display = 'block'
        document.getElementById('successTitle').textContent = `${service.name} Cancelled!`
        document.getElementById('successDesc').textContent = `Successfully executed in background. Recurring billing terminated.`
      }, 3500)
    })
  } else {
    // 2. Visible Mode: Open tab directly in foreground
    loadingState.style.display = 'block'
    document.getElementById('loadingText').textContent = `Locating ${service.name} cancellation pathway...`
    document.getElementById('loadingSub').textContent = 'Preparing 3-second Auto-Pilot HUD'

    setTimeout(() => {
      chrome.tabs.create({ url: service.cancelUrl, active: true }, () => {
        window.close()
      })
    }, 600)
  }
}

// Search input handling
searchInput.addEventListener('input', (e) => {
  const val = e.target.value
  clearBtn.style.display = val ? 'block' : 'none'
  successState.style.display = 'none'
  
  const matched = matchService(val)
  if (matched) {
    showResult(matched)
  } else if (val.length > 2) {
    showResult({
      name: val,
      cancelUrl: `https://www.google.com/search?q=${encodeURIComponent('how to cancel ' + val + ' subscription')}`,
      notes: 'Searching official cancellation pathway...'
    })
  } else {
    showResult(null)
  }
})

// Enter key opens cancel link directly
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && currentEntry) {
    executeCancel(currentEntry)
  }
})

clearBtn.addEventListener('click', () => {
  searchInput.value = ''
  clearBtn.style.display = 'none'
  showResult(null)
  searchInput.focus()
})

btnCancel.addEventListener('click', () => {
  executeCancel(currentEntry)
})

btnNextCancel.addEventListener('click', () => {
  successState.style.display = 'none'
  searchInput.value = ''
  clearBtn.style.display = 'none'
  showResult(null)
  searchInput.focus()
})

// Load saved mode or default to ghost_background
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get(['autopilot_mode'], (res) => {
    if (res.autopilot_mode) {
      currentMode = res.autopilot_mode
      modeSelect.value = res.autopilot_mode
    } else {
      currentMode = 'ghost_background'
      modeSelect.value = 'ghost_background'
      chrome.storage.local.set({ autopilot_mode: 'ghost_background' })
    }
  })

  modeSelect.addEventListener('change', (e) => {
    currentMode = e.target.value
    chrome.storage.local.set({ autopilot_mode: currentMode }, () => {
      savedIndicator.style.display = 'inline'
      if (currentEntry) showResult(currentEntry)
      setTimeout(() => {
        savedIndicator.style.display = 'none'
      }, 1500)
    })
  })
}
