// SubSnap Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('[SubSnap] Extension installed successfully!')
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openCancelTab' && request.url) {
    chrome.tabs.create({ url: request.url })
    sendResponse({ status: 'ok' })
  }
})
