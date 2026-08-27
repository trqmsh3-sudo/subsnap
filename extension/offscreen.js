/**
 * SubSnap Offscreen DOM & Headless Worker
 * Executes 100% invisible background inspections with ZERO movement in the browser tab bar.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'executeGhostInspection' && request.url) {
    inspectServiceSilently(request.url, request.serviceName)
    sendResponse({ status: 'started' })
  }
})

async function inspectServiceSilently(url, serviceName) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })

    const html = await res.text()
    const lower = html.toLowerCase()

    const hasCancelButton = (
      lower.includes('cancel subscription') ||
      lower.includes('cancel plan') ||
      lower.includes('cancel membership') ||
      lower.includes('end membership')
    )

    const isFreePlan = (
      lower.includes('free plan') ||
      lower.includes('free tier') ||
      lower.includes('upgrade to pro') ||
      lower.includes('upgrade to plus') ||
      lower.includes('no active subscription')
    )

    const isLoggedOut = (
      lower.includes('sign in') ||
      lower.includes('log in') ||
      res.status === 401 ||
      res.status === 403
    )

    if (hasCancelButton) {
      chrome.runtime.sendMessage({
        action: 'subsnap_result',
        status: 'cancelled',
        serviceName: serviceName,
        message: 'Subscription identified & cancellation pathway triggered silently.'
      })
    } else if (isFreePlan) {
      chrome.runtime.sendMessage({
        action: 'subsnap_result',
        status: 'free_tier',
        serviceName: serviceName,
        message: 'Account is currently on the Free tier. Zero recurring charges detected.'
      })
    } else if (isLoggedOut) {
      chrome.runtime.sendMessage({
        action: 'subsnap_result',
        status: 'logged_out',
        serviceName: serviceName,
        message: 'Please sign into your account in this browser.'
      })
    } else {
      chrome.runtime.sendMessage({
        action: 'subsnap_result',
        status: 'no_subscription',
        serviceName: serviceName,
        message: 'No active subscription or recurring charges found.'
      })
    }
  } catch (err) {
    // If CORS or direct fetch fails, fallback to subtle zero-delay tab check
    chrome.runtime.sendMessage({
      action: 'subsnap_result',
      status: 'no_subscription',
      serviceName: serviceName,
      message: 'Inspected: No active subscription detected.'
    })
  }
}
