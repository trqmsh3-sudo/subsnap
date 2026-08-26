const TOP_SERVICES = [
  {
    name: 'Grok / X Premium',
    keywords: ['grok', 'x premium', 'twitter blue', 'xai', 'x.ai', 'twitter', 'גרוק', 'טוויטר'],
    cancelUrl: 'https://x.com/settings/premium',
    notes: 'Manage and cancel via X subscription preferences'
  },
  {
    name: 'Netflix',
    keywords: ['netflix', 'nflx', 'נטפליקס'],
    cancelUrl: 'https://www.netflix.com/cancelplan',
    notes: 'Direct 1-click cancel page'
  },
  {
    name: 'Spotify',
    keywords: ['spotify', 'ספוטיפיי'],
    cancelUrl: 'https://www.spotify.com/account/subscription/cancel',
    notes: 'Cancel Spotify Premium plan'
  },
  {
    name: 'Adobe Creative Cloud',
    keywords: ['adobe', 'creative cloud', 'photoshop', 'אדובי'],
    cancelUrl: 'https://account.adobe.com/plans',
    notes: 'Manage Adobe subscription and plans'
  },
  {
    name: 'ChatGPT Plus',
    keywords: ['chatgpt', 'openai', 'צ\'אט ג\'יפיטי', 'chat gpt'],
    cancelUrl: 'https://chat.openai.com/#settings/Subscription',
    notes: 'Cancel from OpenAI account settings'
  },
  {
    name: 'Canva',
    keywords: ['canva', 'קנבה', 'קנווה'],
    cancelUrl: 'https://www.canva.com/settings/billing',
    notes: 'Cancel Canva Pro from billing settings'
  },
  {
    name: 'Amazon Prime',
    keywords: ['amazon', 'prime', 'אמזון', 'אמזון פריים'],
    cancelUrl: 'https://www.amazon.com/gp/primecentral',
    notes: 'End Prime membership'
  },
  {
    name: 'YouTube Premium',
    keywords: ['youtube', 'יוטיוב', 'yt premium'],
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    notes: 'Cancel memberships from Google account'
  },
  {
    name: 'Disney Plus',
    keywords: ['disney', 'disney+', 'דיסני'],
    cancelUrl: 'https://www.disneyplus.com/account',
    notes: 'Cancel Disney+ membership'
  },
  {
    name: 'Dropbox',
    keywords: ['dropbox', 'דרופבוקס'],
    cancelUrl: 'https://www.dropbox.com/account/plan',
    notes: 'Downgrade to free storage plan'
  },
  {
    name: 'Google One',
    keywords: ['google one', 'google storage', 'גוגל וואן'],
    cancelUrl: 'https://one.google.com/storage',
    notes: 'Downgrade storage plan to free tier'
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
