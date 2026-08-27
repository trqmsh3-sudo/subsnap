/**
 * SubSnap In-Page Visual Auto-Pilot & Precision Selector Engine (v5.0)
 * Precision Multi-Step Automation · Dark Pattern & Survey Bypass · Universal Heuristics.
 */

(function () {
  if (window.__subsnap_loaded) return
  window.__subsnap_loaded = true

  const pathname = window.location.pathname.toLowerCase()
  const href = window.location.href.toLowerCase()
  const hostname = window.location.hostname.toLowerCase()

  // 1. Service-Specific Precision Selectors (Top Platforms)
  const SERVICE_SPECIFIC_SELECTORS = [
    // Netflix
    '[data-uia="action-cancel-plan"]',
    '[data-uia="btn-cancel-membership"]',
    'button[data-uia*="cancel"]',
    // Adobe Creative Cloud
    'button[data-testid*="cancel-plan"]',
    'button[data-testid*="end-service"]',
    'a[href*="/cancel-plan"]',
    // Claude (Anthropic)
    'button:has-text("Cancel plan")',
    'button[data-testid="cancel-subscription"]',
    // Spotify
    'button[data-testid="cancel-plan-button"]',
    'a[data-testid="cancel-plan-link"]',
    // ChatGPT / OpenAI
    'button[data-testid="cancel-subscription-button"]',
    // Amazon Prime
    '#cancel-membership-button',
    'a[href*="cancelPrime"]',
    // Grok / X Premium
    'div[data-testid="cancelSubscription"]',
    'button[data-testid="cancelPlan"]',
    // Canva Pro
    'button[data-testid="cancel-subscription-button"]',
    // Reddit Premium
    'button[data-testid="cancel-premium-btn"]',
    // Generic high-confidence attributes
    '[data-testid*="cancel-subscription"]',
    '[data-testid*="cancel-plan"]',
    '[data-action*="cancel-subscription"]',
    'button[aria-label*="cancel subscription" i]',
    'button[aria-label*="cancel plan" i]'
  ]

  // 2. Strict Safety Filter: NEVER match destructive or order actions
  const DISALLOWED_KEYWORDS = [
    'delete account',
    'delete my account',
    'close account',
    'cancel order',
    'cancel item',
    'remove card',
    'delete payment',
    'מחק חשבון',
    'סגירת חשבון',
    'ביטול הזמנה'
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
    'בטל מנוי',
    'בטל תוכנית',
    'סיום מנוי'
  ]

  const DARK_PATTERN_CONTINUE_KEYWORDS = [
    'continue to cancel',
    'no thanks, continue to cancel',
    'cancel anyway',
    'still want to cancel',
    'complete cancellation',
    'confirm cancel'
  ]

  const FREE_TIER_KEYWORDS = [
    'free plan',
    'free tier',
    'current plan: free',
    'no active subscription',
    'upgrade to pro',
    'upgrade to plus',
    'תוכנית חינם',
    'אין מנוי פעיל'
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

  // Handle Dark Patterns & Surveys
  function handleDarkPatterns() {
    // Check for "Too expensive" or "Other" radio buttons in surveys
    const radioInputs = Array.from(document.querySelectorAll('input[type="radio"], input[type="checkbox"], label'))
    for (const r of radioInputs) {
      const text = (r.innerText || r.textContent || r.value || '').toLowerCase()
      if (text.includes('too expensive') || text.includes('cost') || text.includes('other') || text.includes('not using enough')) {
        r.click()
        break
      }
    }

    // Check for "Continue to cancel" or "Cancel anyway" retention bypass buttons
    const continueBtns = Array.from(document.querySelectorAll('button, a, div[role="button"]'))
    for (const b of continueBtns) {
      if (isDisallowedElement(b)) continue
      const text = (b.innerText || b.textContent || '').toLowerCase().trim()
      if (DARK_PATTERN_CONTINUE_KEYWORDS.some(k => text === k || text.includes(k))) {
        return b
      }
    }
    return null
  }

  function findCancelButton() {
    // 1. Check for active dark-pattern/retention screens
    const darkPatternBtn = handleDarkPatterns()
    if (darkPatternBtn) return darkPatternBtn

    // 2. Try High-Confidence Service-Specific Selectors
    for (const sel of SERVICE_SPECIFIC_SELECTORS) {
      try {
        const el = document.querySelector(sel)
        if (el && !isDisallowedElement(el)) return el
      } catch (e) {}
    }

    // 3. Fallback to Heuristic Text Analysis
    const candidates = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"], input[type="submit"]'))

    for (const el of candidates) {
      if (isDisallowedElement(el)) continue
      const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()
      if (STRICT_CANCEL_KEYWORDS.some(k => text === k || (text.includes(k) && text.length < 35))) {
        return el
      }
    }

    return null
  }

  let hudInjected = false
  let countdownTimer = null

  // 1. Reassuring Free-Tier Notification
  function injectInfoHUD(title, desc) {
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
            🎉
          </div>
          <span style="font-size: 13px; font-weight: 800; color: #0f172a;">${title}</span>
        </div>
        <button id="subsnap-close-info" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px;">✕</button>
      </div>

      <div style="font-size: 11.5px; color: #64748b; line-height: 1.35;">${desc}</div>

      <button id="subsnap-done-btn" style="background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 8px 14px; font-size: 11px; font-weight: 800; cursor: pointer;">
        Got it, thanks! ✕
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

  // 2. Active Visual Auto-Pilot HUD
  function injectHUD(btn, mode = 'countdown_3s') {
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
          <span id="subsnap-timer-badge" style="font-size: 10px; font-weight: 800; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 6px;">3s</span>
        </div>
        <div id="subsnap-desc" style="font-size: 11px; color: #64748b; margin-top: 1px;">Cancel pathway located. Auto-cancelling...</div>
      </div>
      <div id="subsnap-controls" style="display: flex; align-items: center; gap: 6px; margin-left: 8px;">
        <button id="subsnap-action-btn" style="background: #0f172a; color: #ffffff; font-weight: 800; border: none; border-radius: 8px; padding: 6px 12px; font-size: 11px; cursor: pointer; transition: transform 0.1s;">
          Cancel Now ➔
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
        descEl.textContent = 'Bypassing retention & executing cancel...'
        timerBadge.textContent = 'Done ✓'
        timerBadge.style.color = '#059669'
        btn.click()

        // Handle multi-step cancel confirmation modals
        setTimeout(() => {
          const nextBtn = findCancelButton()
          if (nextBtn && nextBtn !== btn) {
            nextBtn.click()
          }
          descEl.textContent = '✓ Action executed successfully!'
        }, 1200)
      }

      if (mode === 'instant') {
        triggerCancel()
      } else if (mode === 'countdown_3s') {
        let secondsLeft = 3
        timerBadge.textContent = `${secondsLeft}s`

        countdownTimer = setInterval(() => {
          secondsLeft -= 1
          if (secondsLeft > 0) {
            timerBadge.textContent = `${secondsLeft}s`
          } else {
            clearInterval(countdownTimer)
            triggerCancel()
          }
        }, 1000)
      } else if (mode === 'manual_highlight') {
        timerBadge.textContent = 'Manual'
        descEl.textContent = 'Button highlighted. Click button or below to confirm.'
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

  function checkAndExecute() {
    const btn = findCancelButton()
    if (btn) {
      chrome.storage.local.get(['autopilot_mode'], (res) => {
        const mode = res.autopilot_mode || 'countdown_3s'
        injectHUD(btn, mode)
      })
    } else if (isFreePlanAccount()) {
      injectInfoHUD(
        'Good News: No Active Paid Subscription',
        'Your account on this service is currently on the Free tier. You are not being charged any recurring fees.'
      )
    }
  }

  setTimeout(checkAndExecute, 800)
  setTimeout(checkAndExecute, 2000)

  const observer = new MutationObserver(() => {
    if (!hudInjected) {
      checkAndExecute()
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
})()
