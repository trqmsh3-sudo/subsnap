/**
 * SubSnap In-Page Auto-Pilot Content Script (v3.0)
 * Intelligent Handshake Engine: Reports Real Status (Cancelled / Free Tier / Logged Out) to Popup.
 */

(function () {
  if (window.__subsnap_loaded) return
  window.__subsnap_loaded = true

  const pathname = window.location.pathname.toLowerCase()
  const href = window.location.href.toLowerCase()
  const hostname = window.location.hostname.toLowerCase()

  const isDiscussionOrSearch = (
    pathname.includes('/comments/') ||
    (pathname.includes('/r/') && pathname.includes('/comments/')) ||
    pathname.includes('/discussion/') ||
    pathname.includes('/thread/') ||
    pathname.includes('/article/') ||
    pathname.includes('/post/') ||
    pathname.startsWith('/search') ||
    hostname.includes('google.') ||
    hostname.includes('bing.') ||
    (hostname.includes('quora.') && !pathname.includes('/settings'))
  )

  const isExplicitSettingsPage = (
    pathname.includes('/settings') ||
    pathname.includes('/billing') ||
    pathname.includes('/account') ||
    pathname.includes('/membership') ||
    pathname.includes('/subscription') ||
    pathname.includes('/cancel') ||
    pathname.includes('/plans')
  )

  if (isDiscussionOrSearch && !isExplicitSettingsPage) {
    return
  }

  const STRICT_CANCEL_KEYWORDS = [
    'cancel subscription',
    'cancel your plan',
    'cancel plan',
    'cancel membership',
    'finish cancellation',
    'end membership',
    'deactivate subscription',
    'stop renewal',
    'בטל מנוי',
    'בטל תוכנית',
    'סיום מנוי'
  ]

  const FREE_TIER_KEYWORDS = [
    'free plan',
    'free tier',
    'current plan: free',
    'no active subscription',
    'upgrade to pro',
    'upgrade to plus',
    'תוכנית חינם',
    'אין מנוי פעיל',
    'you are on a free plan',
    'no paid plan'
  ]

  const LOGGED_OUT_KEYWORDS = [
    'log in',
    'sign in',
    'sign up',
    'התחבר',
    'הרשמה'
  ]

  function isDisallowedElement(el) {
    if (!el) return true
    const tag = el.tagName.toUpperCase()
    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'ARTICLE', 'P', 'HEADER'].includes(tag)) {
      return true
    }
    if (el.closest('h1, h2, h3, article, [data-testid*="post-title"], [data-testid*="post-container"]')) {
      return true
    }
    return false
  }

  function isFreePlanAccount() {
    const bodyText = (document.body.innerText || '').toLowerCase()
    return FREE_TIER_KEYWORDS.some(k => bodyText.includes(k))
  }

  function isLoggedOut() {
    const bodyText = (document.body.innerText || '').toLowerCase()
    const hasLoginButton = !!document.querySelector('a[href*="login"], a[href*="signin"], button[data-testid*="login"]')
    return hasLoginButton && bodyText.length < 500
  }

  function findCancelButton() {
    const candidates = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"], input[type="submit"]'))

    for (const el of candidates) {
      if (isDisallowedElement(el)) continue
      const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()
      if (STRICT_CANCEL_KEYWORDS.some(k => text === k || (text.includes(k) && text.length < 35))) {
        return el
      }
    }

    const specificSelectors = [
      '[data-testid*="cancel-subscription"]',
      '[data-testid*="cancel-plan"]',
      'button[aria-label*="cancel subscription" i]',
      'button[aria-label*="cancel plan" i]',
      'a[href*="/cancelplan"]',
      'a[href*="/cancel-subscription"]'
    ]

    for (const sel of specificSelectors) {
      try {
        const el = document.querySelector(sel)
        if (el && !isDisallowedElement(el)) return el
      } catch (e) {}
    }

    return null
  }

  function notifyPopup(status, message) {
    try {
      chrome.runtime.sendMessage({
        action: 'subsnap_result',
        status: status,
        message: message,
        url: window.location.href
      })
    } catch (e) {}
  }

  function inspectPageAndAct() {
    if (document.hidden) {
      // Running in Background Ghost Mode:
      const btn = findCancelButton()
      if (btn) {
        btn.click()
        notifyPopup('cancelled', 'Subscription cancelled successfully via active session.')
      } else if (isFreePlanAccount()) {
        notifyPopup('free_tier', 'Account is on a Free plan. Zero recurring charges detected.')
      } else if (isLoggedOut()) {
        notifyPopup('logged_out', 'Account is not logged in. Please sign in to verify.')
      } else {
        notifyPopup('no_subscription', 'No active subscription or billing charges found.')
      }
    }
  }

  setTimeout(inspectPageAndAct, 1200)
  setTimeout(inspectPageAndAct, 2800)
})()
