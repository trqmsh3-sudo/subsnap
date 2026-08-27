// SubSnap Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('[SubSnap] Extension installed successfully!')
})

async function ensureOffscreenDocument() {
  if (typeof chrome.offscreen !== 'undefined') {
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    })

    if (existingContexts.length > 0) return

    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['DOM_SCRAPING'],
      justification: 'Inspect subscription status in silent background without creating visible browser tabs.'
    })
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startGhostInspection') {
    ensureOffscreenDocument().then(() => {
      chrome.runtime.sendMessage({
        action: 'executeGhostInspection',
        url: request.url,
        serviceName: request.serviceName
      })
    })
    sendResponse({ status: 'queued' })
  }

  if (request.action === 'openCancelTab' && request.url) {
    chrome.tabs.create({ url: request.url })
    sendResponse({ status: 'ok' })
  }
})
