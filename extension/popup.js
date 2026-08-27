const TOP_SERVICES = [
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
const btnCancel = document.getElementById('btnCancel')
const serviceGrid = document.getElementById('serviceGrid')

let currentEntry = null

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
  resultCard.style.display = 'block'
}

function executeCancel(service) {
  if (!service || !service.cancelUrl) return

  // Show rolling logo animation
  resultCard.style.display = 'none'
  loadingState.style.display = 'block'

  setTimeout(() => {
    chrome.tabs.create({ url: service.cancelUrl }, () => {
      window.close()
    })
  }, 600)
}

// Search input handling
searchInput.addEventListener('input', (e) => {
  const val = e.target.value
  clearBtn.style.display = val ? 'block' : 'none'
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

// 1-Click Grid Button Clicks
serviceGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.service-btn')
  if (!btn) return
  const q = btn.getAttribute('data-query')
  const matched = matchService(q)
  if (matched) {
    executeCancel(matched)
  }
})

btnCancel.addEventListener('click', () => {
  executeCancel(currentEntry)
})

// Auto-Pilot Mode Selection Handling
const modeSelect = document.getElementById('modeSelect')
const savedIndicator = document.getElementById('savedIndicator')

if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get(['autopilot_mode'], (res) => {
    if (res.autopilot_mode) {
      modeSelect.value = res.autopilot_mode
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
