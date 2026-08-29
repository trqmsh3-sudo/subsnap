/**
 * SubSnap In-Page Visual Auto-Pilot & Self-Healing DOM Engine (v1.0.0)
 * Google Play Survey Solver · Multi-Step Modal Engine · Strict Search Guard.
 */

(function () {
  if (window.__subsnap_loaded) return
  window.__subsnap_loaded = true

  let hudInjected = false
  let countdownTimer = null
  let activeObserver = null
  let activeScanInterval = null

  function isDedicatedBillingPath() {
    const pathname = window.location.pathname.toLowerCase()
    const href = window.location.href.toLowerCase()
    const hostname = window.location.hostname.toLowerCase().replace(/^www\./, '')

    // Guard ONLY Search Engines (Google Search, Bing Search) without blocking Google Play or Google One
    const isSearchEngine = (
      ((hostname === 'google.com' || hostname.startsWith('google.') || hostname.endsWith('.google.com')) &&
        (pathname === '/' || pathname.startsWith('/search') || pathname.startsWith('/webhp') || pathname.startsWith('/imghp'))) ||
      ((hostname === 'bing.com' || hostname.endsWith('.bing.com')) &&
        (pathname === '/' || pathname.startsWith('/search')))
    )

    const isGeneralBrowsing = (
      pathname === '/' ||
      pathname === '' ||
      pathname.startsWith('/new') ||
      pathname.startsWith('/chat') ||
      pathname.startsWith('/watch') ||
      pathname.startsWith('/feed') ||
      pathname.startsWith('/browse') ||
      pathname.includes('/comments/') ||
      pathname.includes('/discussion/') ||
      isSearchEngine
    )

    const isExplicitBilling = (
      pathname.includes('/billing') ||
      pathname.includes('/cancelplan') ||
      pathname.includes('/cancel-plan') ||
      pathname.includes('/cancel_subscription') ||
      pathname.includes('/manage_subscriptions') ||
      pathname.includes('/preferences/account') ||
      pathname.includes('/settings/premium') ||
      pathname.includes('/settings/subscription') ||
      pathname.includes('/account/subscription') ||
      pathname.includes('/store/account/subscriptions') ||
      pathname.includes('/account') ||
      pathname.includes('/plans') ||
      pathname.includes('/test-') ||
      hostname.includes('one.google.com') ||
      href.includes('subsnap=1')
    )

    return !isGeneralBrowsing && isExplicitBilling
  }

  let ACTIVE_SELECTORS = [
    '[data-uia="action-cancel-plan"]',
    '[data-uia="btn-cancel-membership"]',
    'button[data-testid*="cancel-plan"]',
    'button[data-testid*="end-service"]',
    'a[href*="/cancel-plan"]',
    'button[data-testid="cancel-subscription"]',
    'button[data-testid="cancel-plan-button"]',
    'a[data-testid="cancel-plan-link"]',
    'button[data-testid="cancel-subscription-button"]',
    '#cancel-membership-button',
    'a[href*="cancelPrime"]',
    'div[data-testid="cancelSubscription"]',
    'button[data-testid="cancelPlan"]',
    'button[data-testid="cancel-premium-btn"]',
    '[data-testid*="cancel-subscription"]',
    '[data-testid*="cancel-plan"]',
    '[data-action*="cancel-subscription"]',
    'a[href*="/store/account/subscriptions/subscription?sku="]',
    '[aria-label*="ניהול המינוי"]',
    '[aria-label*="Manage subscription"]'
  ]

  const hostname = window.location.hostname.toLowerCase().replace(/^www\./, '')
  if (chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ action: 'fetchPlaybook', hostname }, (res) => {
      if (res && res.success && res.data && Array.isArray(res.data.selectors)) {
        ACTIVE_SELECTORS = [...res.data.selectors, ...ACTIVE_SELECTORS]
      }
    })
  }

  const DISALLOWED_KEYWORDS = [
    'delete account',
    'delete my account',
    'close account',
    'cancel order',
    'cancel item',
    'remove card',
    'delete payment',
    'pin',
    'mark as unread',
    'rename',
    'add to project',
    'move to group',
    'מחק חשבון',
    'סגירת חשבון',
    'ביטול הזמנה',
    'הקודם',
    'back'
  ]

  const STRICT_CANCEL_KEYWORDS = [
    'cancel subscription',
    'cancel your plan',
    'cancel plan',
    'cancel membership',
    'finish cancellation',
    'end membership',
    'deactivate subscription',
    'stop renewal',
    'continue to cancel',
    'confirm cancellation',
    'manage subscription',
    'manage plan',
    'end plan',
    'stop subscription',
    'בטל מנוי',
    'בטל מינוי',
    'ביטול המינוי',
    'ביטול מינוי',
    'בטל תוכנית',
    'סיום מנוי',
    'ביטול מנוי',
    'ניהול מנוי',
    'הפסקת מנוי'
  ]

  const DARK_PATTERN_CONTINUE_KEYWORDS = [
    'continue to cancel',
    'no thanks, continue to cancel',
    'cancel anyway',
    'still want to cancel',
    'complete cancellation',
    'confirm cancel',
    'המשך לביטול',
    'אישור ביטול',
    'המשך',
    'continue',
    'next'
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
    'אין לך מינויים פעילים'
  ]

  function isVisible(el) {
    if (!el || el.offsetParent === null) return false
    const style = window.getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false
    }
    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }

  function isDisallowedElement(el) {
    if (!el) return true
    const tag = el.tagName.toUpperCase()
    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'ARTICLE', 'P', 'HEADER'].includes(tag)) {
      return true
    }
    if (el.closest('h1, h2, h3, article, [data-testid*="post-title"], [data-testid*="post-container"], nav, aside, [role="navigation"]')) {
      return true
    }
    const text = (el.innerText || el.textContent || el.value || '').toLowerCase()
    if (DISALLOWED_KEYWORDS.some(k => text === k || text.includes(k))) {
      return true
    }
    return false
  }

  function isFreePlanAccount() {
    const bodyText = (document.body.innerText || '').toLowerCase()
    return FREE_TIER_KEYWORDS.some(k => bodyText.includes(k))
  }

  function findDarkPatternContinueBtn() {
    const continueBtns = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"]'))
    for (const b of continueBtns) {
      if (isDisallowedElement(b) || !isVisible(b)) continue
      const text = (b.innerText || b.textContent || '').toLowerCase().trim()
      if (DARK_PATTERN_CONTINUE_KEYWORDS.some(k => text === k || text.includes(k))) {
        return b
      }
    }
    return null
  }

  function findCancelButton() {
    const darkPatternBtn = findDarkPatternContinueBtn()
    if (darkPatternBtn) return darkPatternBtn

    for (const sel of ACTIVE_SELECTORS) {
      try {
        const el = document.querySelector(sel)
        if (el && !isDisallowedElement(el) && isVisible(el)) return el
      } catch (e) {}
    }

    const candidates = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"], input[type="submit"], input[type="button"]'))

    // 1. Direct cancellation keywords
    for (const el of candidates) {
      if (isDisallowedElement(el) || !isVisible(el)) continue
      const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()
      if (STRICT_CANCEL_KEYWORDS.some(k => text === k || (text.includes(k) && text.length < 35))) {
        return el
      }
    }

    // 2. Google Play / Store Subscriptions "ניהול" / "Manage" button
    const pathname = window.location.pathname.toLowerCase()
    if (pathname.includes('/subscriptions') || pathname.includes('/account')) {
      for (const el of candidates) {
        if (isDisallowedElement(el) || !isVisible(el)) continue
        const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()
        if (text === 'ניהול' || text === 'manage' || text === 'ניהול המינוי' || text === 'manage subscription') {
          return el
        }
      }
    }

    return null
  }

  function findModalConfirmBtn() {
    const modals = Array.from(document.querySelectorAll('[role="dialog"], dialog, .modal, [data-testid*="modal"], .overlay.active, .popup, [role="region"], div[aria-modal="true"]'))
    for (const m of modals) {
      const btns = Array.from(m.querySelectorAll('button, a, div[role="button"], span[role="button"], input[type="submit"]'))
      for (const b of btns) {
        if (!isVisible(b) || isDisallowedElement(b)) continue
        const text = (b.innerText || b.textContent || '').toLowerCase().trim()
        if (
          STRICT_CANCEL_KEYWORDS.some(k => text === k || text.includes(k)) ||
          DARK_PATTERN_CONTINUE_KEYWORDS.some(k => text === k || text.includes(k))
        ) {
          return b
        }
      }
    }
    return null
  }

  function requestAIDOMScout() {
    return new Promise((resolve) => {
      try {
        const rawElements = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"], input[type="submit"]'))
          .filter(el => !isDisallowedElement(el) && isVisible(el))
          .slice(0, 35)

        if (rawElements.length === 0 || !chrome.runtime || !chrome.runtime.sendMessage) {
          return resolve(null)
        }

        const snapshot = rawElements.map(el => ({
          tag: el.tagName.toLowerCase(),
          text: (el.innerText || el.textContent || el.value || '').trim().slice(0, 40),
          aria: el.getAttribute('aria-label') || null,
          id: el.id || null,
          testid: el.getAttribute('data-testid') || null,
          uia: el.getAttribute('data-uia') || null,
          className: (el.className || '').toString().slice(0, 40)
        }))

        chrome.runtime.sendMessage({
          action: 'domScout',
          payload: { hostname, elements: snapshot }
        }, (res) => {
          if (res && res.success && res.data) {
            if (typeof res.data.bestMatchIndex === 'number' && res.data.bestMatchIndex >= 0 && res.data.bestMatchIndex < rawElements.length) {
              const matchedNode = rawElements[res.data.bestMatchIndex]
              if (matchedNode && isVisible(matchedNode)) {
                return resolve(matchedNode)
              }
            }
            if (res.data.targetSelector) {
              const el = document.querySelector(res.data.targetSelector)
              if (el && isVisible(el)) return resolve(el)
            }
          }
          resolve(null)
        })
      } catch (e) {
        resolve(null)
      }
    })
  }

  function injectGuidanceHUD(title, desc) {
    if (hudInjected || document.getElementById('subsnap-hud')) return
    hudInjected = true

    const hud = document.createElement('div')
    hud.id = 'subsnap-hud'
    hud.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 2147483647;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 0 20px rgba(16, 185, 129, 0.1);
      border-radius: 16px;
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      direction: ltr;
      min-width: 320px;
      max-width: 400px;
      animation: subsnapPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `

    hud.innerHTML = `
      <style>
        @keyframes subsnapPop {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      </style>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 28px; height: 28px; border-radius: 8px; background: #ecfdf5; border: 1px solid #a7f3d0; display: flex; align-items: center; justify-content: center; font-size: 14px;">
            🛡️
          </div>
          <span style="font-size: 13px; font-weight: 800; color: #0f172a;">${title}</span>
        </div>
        <button id="subsnap-close-info" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px;">✕</button>
      </div>

      <div style="font-size: 11.5px; color: #64748b; line-height: 1.35;">${desc}</div>

      <button id="subsnap-done-btn" style="background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 11px; font-weight: 800; cursor: pointer;">
        Got it ✕
      </button>
    `

    document.body.appendChild(hud)

    const closeBtn = hud.querySelector('#subsnap-close-info')
    const doneBtn = hud.querySelector('#subsnap-done-btn')

    function close() {
      hud.remove()
      hudInjected = false
    }

    closeBtn.addEventListener('click', close)
    doneBtn.addEventListener('click', close)
  }

  function injectHUD(btn, mode = 'countdown_5s', isAIRepaired = false) {
    if (hudInjected || document.getElementById('subsnap-hud')) return
    hudInjected = true

    const hud = document.createElement('div')
    hud.id = 'subsnap-hud'
    hud.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 2147483647;
      background: #ffffff;
      border: 1.5px solid #10b981;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 0 20px rgba(16, 185, 129, 0.15);
      border-radius: 16px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      direction: ltr;
      animation: subsnapPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `

    hud.innerHTML = `
      <style>
        @keyframes subsnapPop {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes subsnapPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
        }
      </style>
      <div style="width: 32px; height: 32px; border-radius: 10px; background: #ecfdf5; border: 1px solid #a7f3d0; display: flex; align-items: center; justify-content: center; color: #059669;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19.439 7.85c0-1.571-1.285-2.85-2.87-2.85h-2.14a2.85 2.85 0 0 0-5.7 0H6.589c-1.585 0-2.87 1.279-2.87 2.85v2.14a2.85 2.85 0 0 0 0 5.7v2.14c0 1.571 1.285 2.85 2.87 2.85h2.14a2.85 2.85 0 0 1 5.7 0h2.14c1.585 0 2.87-1.279 2.87-2.85v-2.14a2.85 2.85 0 0 1 0-5.7v-2.14z"/>
        </svg>
      </div>
      <div>
        <div style="font-size: 13px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 6px;">
          <span>SubSnap Auto-Pilot</span>
          <span id="subsnap-timer-badge" style="font-size: 10px; font-weight: 800; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 6px;">5s</span>
          ${isAIRepaired ? '<span style="font-size: 9px; font-weight: 800; color: #0284c7; background: #e0f2fe; border: 1px solid #bae6fd; padding: 1px 5px; border-radius: 4px;">🤖 AI Healed</span>' : ''}
        </div>
        <div id="subsnap-desc" style="font-size: 11px; color: #64748b; margin-top: 1px;">Subscription pathway located. Proceeding in 5s...</div>
      </div>
      <div id="subsnap-controls" style="display: flex; align-items: center; gap: 6px; margin-left: 8px;">
        <button id="subsnap-action-btn" style="background: #0f172a; color: #ffffff; font-weight: 800; border: none; border-radius: 8px; padding: 6px 12px; font-size: 11px; cursor: pointer; transition: transform 0.1s;">
          Proceed ➔
        </button>
        <button id="subsnap-stop-btn" style="background: #f1f5f9; color: #475569; font-weight: 700; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; font-size: 11px; cursor: pointer;">
          Stop
        </button>
        <button id="subsnap-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px 6px;">
          ✕
        </button>
      </div>
    `

    document.body.appendChild(hud)

    const timerBadge = hud.querySelector('#subsnap-timer-badge')
    const descEl = hud.querySelector('#subsnap-desc')
    const actionBtn = hud.querySelector('#subsnap-action-btn')
    const stopBtn = hud.querySelector('#subsnap-stop-btn')
    const closeBtn = hud.querySelector('#subsnap-close-btn')

    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' })
      btn.style.outline = '3px solid #10b981'
      btn.style.outlineOffset = '3px'
      btn.style.animation = 'subsnapPulse 2s infinite'

      function triggerCancel() {
        if (countdownTimer) clearInterval(countdownTimer)
        descEl.textContent = 'Navigating subscription pathway...'
        timerBadge.textContent = 'Active ⚡'
        timerBadge.style.color = '#059669'

        btn.click()

        // Reactive Multi-Step Survey & Modal Poller (watches for up to 8s across dynamic dialogs)
        let modalPollCount = 0
        const modalPoll = setInterval(() => {
          modalPollCount++

          // 1. Solve survey if a survey modal is open
          const surveyOptions = Array.from(document.querySelectorAll('[role="radio"], input[type="radio"], label, div[data-value], li[role="radio"], span'))
          for (const opt of surveyOptions) {
            if (!isVisible(opt)) continue
            const text = (opt.innerText || opt.textContent || opt.value || '').toLowerCase().trim()
            if (
              text === 'לא רוצה להשיב' ||
              text === 'אחר' ||
              text.includes('לא רוצה להשיב') ||
              text.includes('decline to answer') ||
              text === 'other'
            ) {
              opt.click()
              break
            }
          }

          // 2. Click modal confirmation / continue button (after radio unlock)
          setTimeout(() => {
            const modalBtn = findModalConfirmBtn()
            if (modalBtn && modalBtn !== btn) {
              const isDisabled = modalBtn.disabled || modalBtn.getAttribute('aria-disabled') === 'true'
              if (!isDisabled) {
                modalBtn.click()
                descEl.textContent = 'Advancing to cancellation...'
              }
            }
          }, 200)

          if (modalPollCount >= 16) {
            clearInterval(modalPoll)
            descEl.textContent = '✓ Action confirmed successfully!'
            timerBadge.textContent = 'Done ✓'
          }
        }, 500)
      }

      if (mode === 'manual_highlight') {
        timerBadge.textContent = 'Manual'
        descEl.textContent = 'Button highlighted. Click button or below to confirm.'
      } else {
        let secondsLeft = 5
        timerBadge.textContent = `${secondsLeft}s`
        descEl.textContent = `Subscription pathway located. Proceeding in ${secondsLeft}s...`

        countdownTimer = setInterval(() => {
          secondsLeft -= 1
          if (secondsLeft > 0) {
            timerBadge.textContent = `${secondsLeft}s`
            descEl.textContent = `Subscription pathway located. Proceeding in ${secondsLeft}s...`
          } else {
            clearInterval(countdownTimer)
            triggerCancel()
          }
        }, 1000)
      }

      actionBtn.addEventListener('click', () => {
        triggerCancel()
      })

      stopBtn.addEventListener('click', () => {
        if (countdownTimer) clearInterval(countdownTimer)
        descEl.textContent = 'Auto-Pilot paused.'
        timerBadge.textContent = 'Paused'
        timerBadge.style.color = '#64748b'
      })
    }

    closeBtn.addEventListener('click', () => {
      if (countdownTimer) clearInterval(countdownTimer)
      hud.remove()
      hudInjected = false
    })
  }

  async function performScan() {
    if (hudInjected || !isDedicatedBillingPath()) return false

    const btn = findCancelButton()
    if (btn) {
      chrome.storage.local.get(['autopilot_mode'], (res) => {
        const mode = res.autopilot_mode || 'countdown_5s'
        injectHUD(btn, mode, false)
      })
      return true
    } else if (isFreePlanAccount()) {
      injectGuidanceHUD(
        'Good News: No Active Paid Subscription',
        'Your account on this service is currently on the Free tier. You are not being charged any recurring fees.'
      )
      return true
    }
    return false
  }

  function startScanningEngine() {
    if (!isDedicatedBillingPath()) return

    if (activeObserver) activeObserver.disconnect()
    if (activeScanInterval) clearInterval(activeScanInterval)

    let scanAttempts = 0
    const maxAttempts = 10

    activeObserver = new MutationObserver(async () => {
      if (!hudInjected) {
        const found = await performScan()
        if (found && activeObserver) activeObserver.disconnect()
      }
    })

    activeObserver.observe(document.body, { childList: true, subtree: true })

    activeScanInterval = setInterval(async () => {
      scanAttempts++
      const found = await performScan()

      if (found || scanAttempts >= maxAttempts) {
        clearInterval(activeScanInterval)
        if (activeObserver) activeObserver.disconnect()

        if (!found && !hudInjected && isDedicatedBillingPath()) {
          const aiBtn = await requestAIDOMScout()
          if (aiBtn) {
            chrome.storage.local.get(['autopilot_mode'], (res) => {
              const mode = res.autopilot_mode || 'countdown_5s'
              injectHUD(aiBtn, mode, true)
            })
          } else {
            injectGuidanceHUD(
              'SubSnap Cancellation Assistant',
              'You are on the official billing management page. Please locate and click your plan cancellation button on screen.'
            )
          }
        }
      }
    }, 500)
  }

  startScanningEngine()

  window.addEventListener('popstate', () => setTimeout(startScanningEngine, 300))
  window.addEventListener('hashchange', () => setTimeout(startScanningEngine, 300))

  const originalPushState = history.pushState
  history.pushState = function () {
    originalPushState.apply(this, arguments)
    setTimeout(startScanningEngine, 300)
  }

  const originalReplaceState = history.replaceState
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments)
    setTimeout(startScanningEngine, 300)
  }
})()
