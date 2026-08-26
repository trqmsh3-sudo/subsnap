const TOP_SERVICES = [
  {
    name: 'Grok / X Premium',
    keywords: ['grok', 'x premium', 'twitter blue', 'xai', 'x.ai', 'twitter', 'גרוק', 'טוויטר'],
    cancelUrl: 'https://x.com/settings/manage_subscriptions',
    notes: 'ניהול וביטול ישיר בהגדרות X/Grok'
  },
  {
    name: 'Netflix',
    keywords: ['netflix', 'nflx', 'נטפליקס'],
    cancelUrl: 'https://www.netflix.com/cancelplan',
    notes: 'מעבר ישיר לעמוד אישור ביטול נטפליקס'
  },
  {
    name: 'Spotify',
    keywords: ['spotify', 'ספוטיפיי'],
    cancelUrl: 'https://www.spotify.com/account/subscription/change/',
    notes: 'עמוד שינוי וביטול מנוי Spotify Premium'
  },
  {
    name: 'Adobe Creative Cloud',
    keywords: ['adobe', 'creative cloud', 'photoshop', 'אדובי'],
    cancelUrl: 'https://account.adobe.com/plans',
    notes: 'עמוד ניהול התוכניות והביטול של אדובי'
  },
  {
    name: 'ChatGPT Plus',
    keywords: ['chatgpt', 'openai', 'צ\'אט ג\'יפיטי', 'chat gpt'],
    cancelUrl: 'https://chatgpt.com/#settings/Subscription',
    notes: 'עמוד ניהול מנוי בהגדרות ChatGPT'
  },
  {
    name: 'Canva Pro',
    keywords: ['canva', 'קנבה', 'קנווה'],
    cancelUrl: 'https://www.canva.com/settings/billing-and-teams',
    notes: 'עמוד חיובים וביטול מנוי ב-Canva'
  },
  {
    name: 'Apple / iCloud / App Store',
    keywords: ['apple', 'icloud', 'itunes', 'אפל', 'אייקלאוד'],
    cancelUrl: 'https://apps.apple.com/account/subscriptions',
    notes: 'פותח ישירות את רשימת המנויים של Apple ID'
  },
  {
    name: 'Google Play / Android',
    keywords: ['google play', 'android', 'גוגל פליי'],
    cancelUrl: 'https://play.google.com/store/account/subscriptions',
    notes: 'ניהול וביטול כל מנויי Google Play'
  },
  {
    name: 'Amazon Prime',
    keywords: ['amazon', 'prime', 'אמזון', 'אמזון פריים'],
    cancelUrl: 'https://www.amazon.com/mc/manage',
    notes: 'עמוד ניהול וסיום מנוי Prime'
  }
]

const searchInput = document.getElementById('searchInput')
const clearBtn = document.getElementById('clearBtn')
const resultCard = document.getElementById('resultCard')
const serviceNameEl = document.getElementById('serviceName')
const serviceNotesEl = document.getElementById('serviceNotes')
const btnCancel = document.getElementById('btnCancel')
const tagsContainer = document.getElementById('tagsContainer')

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
  serviceNotesEl.textContent = service.notes || 'Direct cancel guide'
  resultCard.style.display = 'block'
}

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
      notes: 'Search for direct cancellation page'
    })
  } else {
    showResult(null)
  }
})

clearBtn.addEventListener('click', () => {
  searchInput.value = ''
  clearBtn.style.display = 'none'
  showResult(null)
  searchInput.focus()
})

tagsContainer.addEventListener('click', (e) => {
  const tag = e.target.closest('.tag')
  if (!tag) return
  const sName = tag.getAttribute('data-service')
  const matched = TOP_SERVICES.find(s => s.name === sName)
  if (matched) {
    searchInput.value = matched.name
    clearBtn.style.display = 'block'
    showResult(matched)
  }
})

btnCancel.addEventListener('click', () => {
  if (!currentEntry || !currentEntry.cancelUrl) return
  chrome.tabs.create({ url: currentEntry.cancelUrl })
})
