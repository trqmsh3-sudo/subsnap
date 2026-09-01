// SubSnap Background Service Worker (v1.0.0)
// Acts as a CSP-Immune Network Gateway & Telemetry Bridge for Content Scripts

chrome.runtime.onInstalled.addListener(() => {
  console.log('[SubSnap] Background service ready.')
})

// Every relay fetch below must always resolve within a bounded time. Without a timeout, a
// hung/slow subsnap.net response (dead deployment, slow Gemini call, network stall) leaves
// sendResponse() never called — the content script's HUD then waits forever with no error
// and no fallback, looking "stuck" with no visible cause.
function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer))
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchPlaybook' && request.hostname) {
    fetchWithTimeout(`https://www.subsnap.net/api/playbooks?host=${encodeURIComponent(request.hostname)}`, {}, 10_000)
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: String(err) }))
    return true
  }

  if (request.action === 'domScout' && request.payload) {
    fetchWithTimeout('https://www.subsnap.net/api/dom-scout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.payload)
    }, 20_000)
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: String(err) }))
    return true
  }

  if ((request.action === 'reportHealedUrl' || request.action === 'reportVerifiedPlaybook') && request.payload) {
    fetchWithTimeout('https://www.subsnap.net/api/playbooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.payload)
    }, 10_000)
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: String(err) }))
    return true
  }

  if (request.action === 'lookupService' && request.query) {
    fetchWithTimeout(`https://www.subsnap.net/api/lookup?q=${encodeURIComponent(request.query)}&force=true`, {}, 15_000)
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: String(err) }))
    return true
  }

  if (request.action === 'evictStalePlaybook' && request.hostname) {
    fetchWithTimeout(`https://www.subsnap.net/api/playbooks?host=${encodeURIComponent(request.hostname)}`, {
      method: 'DELETE'
    }, 10_000)
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: String(err) }))
    return true
  }
})
