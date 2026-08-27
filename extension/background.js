// SubSnap Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('[SubSnap] Extension ready.')
})

// Listen for tab navigation & dynamic script injection
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openCancelTab' && request.url) {
    chrome.tabs.create({ url: request.url }, (tab) => {
      // Dynamically inject content script once the tab finishes loading
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener)
          try {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content_script.js']
            })
          } catch (e) {}
        }
      })
    })
    sendResponse({ status: 'ok' })
  }
})
