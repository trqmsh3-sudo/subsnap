const TOP_SERVICES = [
  {
    name: 'קלוד (Claude Pro / Max / Anthropic)',
    keywords: ['claude', 'anthropic', 'קלוד', 'אנתרופיק', 'קלאוד'],
    cancelUrl: 'https://claude.ai/settings/billing',
    notes: 'עמוד ניהול חיובים וביטול מנוי Claude'
  },
  {
    name: 'גרוק / X פרימיום (טוויטר)',
    keywords: ['grok', 'x premium', 'twitter blue', 'xai', 'x.ai', 'twitter', 'גרוק', 'טוויטר', 'x'],
    cancelUrl: 'https://x.com/settings/manage_subscriptions',
    notes: 'ניהול וביטול ישיר בהגדרות X/Grok'
  },
  {
    name: 'נטפליקס (Netflix)',
    keywords: ['netflix', 'nflx', 'נטפליקס'],
    cancelUrl: 'https://www.netflix.com/cancelplan',
    notes: 'מעבר ישיר לעמוד אישור ביטול נטפליקס'
  },
  {
    name: 'ספוטיפיי (Spotify Premium)',
    keywords: ['spotify', 'ספוטיפיי', 'ספוטיפי'],
    cancelUrl: 'https://www.spotify.com/account/subscription/change/',
    notes: 'עמוד שינוי וביטול מנוי Spotify'
  },
  {
    name: 'אדובי (Adobe Creative Cloud)',
    keywords: ['adobe', 'creative cloud', 'photoshop', 'אדובי', 'פוטושופ'],
    cancelUrl: 'https://account.adobe.com/plans',
    notes: 'עמוד ניהול התוכניות והביטול של אדובי'
  },
  {
    name: 'צ\'אט ג\'יפיטי פלוס (ChatGPT)',
    keywords: ['chatgpt', 'openai', 'צ\'אט ג\'יפיטי', 'chat gpt'],
    cancelUrl: 'https://chatgpt.com/#settings/Subscription',
    notes: 'עמוד ניהול מנוי בהגדרות ChatGPT'
  },
  {
    name: 'קנבה פרו (Canva Pro)',
    keywords: ['canva', 'קנבה', 'קנווה'],
    cancelUrl: 'https://www.canva.com/settings/billing-and-teams',
    notes: 'עמוד חיובים וביטול מנוי ב-Canva'
  },
  {
    name: 'אפל / אייקלאוד / App Store',
    keywords: ['apple', 'icloud', 'itunes', 'אפל', 'אייקלאוד'],
    cancelUrl: 'https://apps.apple.com/account/subscriptions',
    notes: 'פותח ישירות את רשימת המנויים של Apple ID'
  },
  {
    name: 'אמזון פריים (Amazon Prime)',
    keywords: ['amazon', 'prime', 'אמזון', 'אמזון פריים'],
    cancelUrl: 'https://www.amazon.com/mc/manage',
    notes: 'עמוד ניהול וסיום מנוי Prime'
  },
  {
    name: 'יוטיוב פרימיום (YouTube Premium)',
    keywords: ['youtube', 'יוטיוב', 'yt premium'],
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    notes: 'ניהול וביטול מנוי YouTube'
  },
  {
    name: 'דיסני פלוס (Disney+)',
    keywords: ['disney', 'disney+', 'דיסני'],
    cancelUrl: 'https://www.disneyplus.com/account',
    notes: 'ביטול מנוי בהגדרות Disney+'
  },
  {
    name: 'גוגל פליי / מנויי אנדרואיד',
    keywords: ['google play', 'android', 'גוגל פליי'],
    cancelUrl: 'https://play.google.com/store/account/subscriptions',
    notes: 'ניהול וביטול כל מנויי Google Play'
  }
]

const searchInput = document.getElementById('searchInput')
const clearBtn = document.getElementById('clearBtn')
const resultCard = document.getElementById('resultCard')
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
  serviceNotesEl.textContent = service.notes || 'קישור ביטול ישיר זוהה'
  resultCard.style.display = 'block'
}

function executeCancel(service) {
  if (!service || !service.cancelUrl) return
  chrome.tabs.create({ url: service.cancelUrl })
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
      notes: 'חיפוש עמוד ביטול רשמי'
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
