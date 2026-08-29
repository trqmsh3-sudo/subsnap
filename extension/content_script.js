/**
 * SubSnap In-Page Visual Auto-Pilot & Self-Healing DOM Engine (v1.0.0)
 * Precision Confirmation Clicker · Linguistic Tense Distinction · Multi-Step Modal Engine.
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
    'a[href*="/store/account/subscriptions/subscription?sku="]'
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
    'back',
    'שמירה על המינוי',
    'keep subscription',
    'להרשמה מחדש',
    'resubscribe'
  ]

  const STRICT_CANCEL_KEYWORDS = [
    'ביטול המינוי',
    'בטל מינוי',
    'ביטול מינוי',
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
    if (DISALLOWED_KEYWORDS.some(k => text.includes(k))) {
      return true
    }
    return false
  }

  function isFreePlanAccount() {
    const bodyText = (document.body.innerText || '').toLowerCase()
    return FREE_TIER_KEYWORDS.some(k => bodyText.includes(k))
  }

  // Precise cancellation state: Must NOT match "יבוטל" (future tense in confirmation modal)
  function isAlreadyCancelled() {
    // If confirmation modal is open, we are NOT yet cancelled!
    if (document.querySelector('[role="dialog"], dialog, div[aria-modal="true"]')) {
      return false
    }

    const bodyText = document.body.innerText || ''
    const hasCancelledHeader = /\bבוטל\b|להרשמה מחדש|המינוי שלך יסתיים בתאריך|subscription cancelled|subscription canceled/i.test(bodyText)
    const isAskingConfirmation = /האם לבטל|המינוי יבוטל בסיום|are you sure you want to cancel/i.test(bodyText)

    return hasCancelledHeader && !isAskingConfirmation
  }

  function forceClick(el) {
    if (!el) return
    try {
      el.focus()
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
      el.click()
    } catch (e) {}
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
    if (isAlreadyCancelled()) return null

    const darkPatternBtn = findDarkPatternContinueBtn()
    if (darkPatternBtn) return darkPatternBtn

    for (const sel of ACTIVE_SELECTORS) {
      try {
        const el = document.querySelector(sel)
        if (el && !isDisallowedElement(el) && isVisible(el)) return el
      } catch (e) {}
    }

    const candidates = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"], input[type="submit"], input[type="button"]'))

    for (const el of candidates) {
      if (isDisallowedElement(el) || !isVisible(el)) continue
      const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()
      if (STRICT_CANCEL_KEYWORDS.some(k => text === k || (text.includes(k) && text.length < 35))) {
        return el
      }
    }

    // Google Play active subscription "ניהול" / "Manage" button
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

  // Find confirmation button inside modal (Highest priority to "ביטול המינוי" / "Cancel subscription")
  function findModalConfirmBtn() {
    const modals = Array.from(document.querySelectorAll('[role="dialog"], dialog, .modal, [data-testid*="modal"], .overlay.active, .popup, [role="region"], div[aria-modal="true"]'))
    for (const m of modals) {
      const btns = Array.from(m.querySelectorAll('button, a, div[role="button"], span[role="button"], input[type="submit"]'))

      // Step A: Look for explicit cancellation button ("ביטול המינוי")
      for (const b of btns) {
        if (!isVisible(b) || isDisallowedElement(b)) continue
        const text = (b.innerText || b.textContent || '').toLowerCase().trim()
        if (text === 'ביטול המינוי' || text === 'בטל מינוי' || text === 'cancel subscription' || text === 'confirm cancellation') {
          return b
        }
      }

      // Step B: Look for general continue keywords ("המשך")
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

  function injectSuccessHUD(title, desc) {
    if (document.getElementById('subsnap-hud')) {
      document.getElementById('subsnap-hud').remove()
    }
    hudInjected = true

    const hud = document.createElement('div')
    hud.id = 'subsnap-hud'
    hud.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 2147483647;
      background: #ffffff;
      border: 2px solid #10b981;
      box-shadow: 0 16px 40px rgba(16, 185, 129, 0.25);
      border-radius: 16px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      direction: rtl;
      min-width: 340px;
      animation: subsnapPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `

    hud.innerHTML = `
      <style>
        @keyframes subsnapPop {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      </style>
      <div style="width: 36px; height: 36px; border-radius: 10px; background: #ecfdf5; border: 1.5px solid #a7f3d0; display: flex; align-items: center; justify-content: center; font-size: 18px;">
        🎉
      </div>
      <div style="flex: 1;">
        <div style="font-size: 13.5px; font-weight: 800; color: #065f46;">${title}</div>
        <div style="font-size: 11.5px; color: #047857; margin-top: 1px; font-weight: 500;">${desc}</div>
      </div>
      <button id="subsnap-success-close" style="background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 800; cursor: pointer;">
        מעולה ✕
      </button>
    `

    document.body.appendChild(hud)

    const closeBtn = hud.querySelector('#subsnap-success-close')
    function close() {
      hud.remove()
      hudInjected = false
    }

    closeBtn.addEventListener('click', close)
    setTimeout(close, 5000)
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
        descEl.textContent = 'Executing cancellation pathway...'
        timerBadge.textContent = 'Active ⚡'
        timerBadge.style.color = '#059669'

        forceClick(btn)

        // Reactive Multi-Step Survey & Confirmation Poller
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
              forceClick(opt)
              const innerInput = opt.querySelector('input[type="radio"]') || opt.parentElement?.querySelector('input[type="radio"]')
              if (innerInput) forceClick(innerInput)
              break
            }
          }

          // 2. Click modal confirmation / continue button (Prioritizes "ביטול המינוי")
          setTimeout(() => {
            const modalBtn = findModalConfirmBtn()
            if (modalBtn && modalBtn !== btn) {
              const isDisabled = modalBtn.disabled || modalBtn.getAttribute('aria-disabled') === 'true'
              if (!isDisabled) {
                forceClick(modalBtn)
                descEl.textContent = 'Confirming cancellation...'
              }
            }
          }, 300)

          // 3. Stop and check if cancelled
          if (isAlreadyCancelled()) {
            clearInterval(modalPoll)
            if (activeObserver) activeObserver.disconnect()
            injectSuccessHUD('המנוי בוטל בהצלחה! 🎉', 'המערכת זיהתה את הביטול. החיוב החודשי הופסק.')
            return
          }

          if (modalPollCount >= 24) {
            clearInterval(modalPoll)
            if (isAlreadyCancelled()) {
              injectSuccessHUD('המנוי בוטל בהצלחה! 🎉', 'המערכת זיהתה את הביטול. החיוב החודשי הופסק.')
            } else {
              descEl.textContent = '✓ Action confirmed successfully!'
              timerBadge.textContent = 'Done ✓'
            }
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

    if (isAlreadyCancelled()) {
      injectSuccessHUD('המנוי כבר בוטל בהצלחה! 🎉', 'המינוי סומן כמבוטל ולא תחויב שוב.')
      if (activeObserver) activeObserver.disconnect()
      if (activeScanInterval) clearInterval(activeScanInterval)
      return true
    }

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

        if (!found && !hudInjected && isDedicatedBillingPath() && !isAlreadyCancelled()) {
          injectGuidanceHUD(
            'SubSnap Cancellation Assistant',
            'You are on the official billing management page. Please locate and click your plan cancellation button on screen.'
          )
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
