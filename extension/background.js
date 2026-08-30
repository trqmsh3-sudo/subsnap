// SubSnap Background Service Worker (v1.0.0)
// Acts as a CSP-Immune Network Gateway & Telemetry Bridge for Content Scripts

chrome.runtime.onInstalled.addListener(() => {
  console.log('[SubSnap] Background service ready.')
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchPlaybook' && request.hostname) {
    fetch(`https://www.subsnap.net/api/playbooks?host=${encodeURIComponent(request.hostname)}`)
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: String(err) }))
    return true
  }

  if (request.action === 'domScout' && request.payload) {
    fetch('https://www.subsnap.net/api/dom-scout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.payload)
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: String(err) }))
    return true
  }

  if (request.action === 'reportHealedUrl' && request.payload) {
    fetch('https://www.subsnap.net/api/playbooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.payload)
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: String(err) }))
    return true
  }

  if (request.action === 'evictStalePlaybook' && request.hostname) {
    fetch(`https://www.subsnap.net/api/playbooks?host=${encodeURIComponent(request.hostname)}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: String(err) }))
    return true
  }
})
