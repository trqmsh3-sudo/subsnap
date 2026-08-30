/**
 * SubSnap 3-Tier Escalation & Self-Learning Architecture (v1.1.0)
 * Tier 1: Local Deterministic (0ms, $0)
 * Tier 2: Global Distributed Cache (Redis)
 * Tier 3: AI Emergency Escalation with Prioritized Scanning, Pinned DOM References,
 *         Syntax-Safe Selector Resolution, and Two-Phase Outcome Verification.
 */

(function () {
  if (window.__subsnap_loaded) return
  window.__subsnap_loaded = true

  let hudInjected = false
  let countdownTimer = null
  let activeObserver = null
  let activeScanInterval = null

  // URL state tracking for SPA resets (Fix #4)
  let lastEscalatedUrl = ''
  let aiEscalationAttempted = false

  function isVisible(el) {
    if (!el || el.offsetParent === null) return false
    const style = window.getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false
    }
    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
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

  function isDeadOr404Page() {
    const pageTitle = (document.title || '').toLowerCase()
    const bodyText = (document.body.innerText || '').toLowerCase()

    return (
      pageTitle.includes('page not found') ||
      pageTitle.includes('404') ||
      pageTitle.includes('לא נמצא') ||
      bodyText.includes("this page doesn’t exist") ||
      bodyText.includes("this page does not exist") ||
      bodyText.includes("page not found") ||
      bodyText.includes("404 not found") ||
      bodyText.includes("העמוד אינו קיים") ||
      bodyText.includes("דף זה אינו קיים")
    )
  }

  function isAlreadyCancelled() {
    if (document.querySelector('[role="dialog"], dialog, div[aria-modal="true"]')) {
      return false
    }

    const bodyText = document.body.innerText || ''
    const hasCancelledHeader = /\bבוטל\b|להרשמה מחדש|המינוי שלך יסתיים בתאריך|subscription cancelled|subscription canceled/i.test(bodyText)
    const isAskingConfirmation = /האם לבטל|המינוי יבוטל בסיום|are you sure you want to cancel/i.test(bodyText)

    return hasCancelledHeader && !isAskingConfirmation
  }

  function isNoActiveSubscriptionState() {
    const bodyText = (document.body.innerText || '').toLowerCase()

    const hasXSignUpLink = !!document.querySelector('a[href*="premium_sign_up"], [data-testid*="premium_sign_up"]')
    const hasXIneligible = bodyText.includes('subscriptions\nineligible') || bodyText.includes('subscriptions ineligible')
    if (hasXSignUpLink || hasXIneligible) {
      return true
    }

    const freeTierSignals = [
      'no active subscription',
      'no active subscriptions',
      'current plan: free',
      'plan: free',
      'upgrade to pro',
      'upgrade to premium',
      'upgrade plan',
      'אין לך מינויים פעילים',
      'אין מנוי פעיל',
      'תוכנית חינמית',
      'תוכנית: חינם'
    ]

    return freeTierSignals.some(k => bodyText.includes(k))
  }

  const DISALLOWED_KEYWORDS = [
    'delete account',
    'delete my account',
    'close account',
    'cancel order',
    'cancel item',
    'remove card',
    'delete payment',
    'sign out',
    'log out',
    'התנתק',
    'מחק חשבון',
    'סגירת חשבון'
  ]

  function isDisallowedElement(el) {
    if (!el) return true
    const text = (el.innerText || el.textContent || el.value || '').toLowerCase()
    return DISALLOWED_KEYWORDS.some(k => text.includes(k))
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

  // Tier 2: Check Remote Redis Cache on page start
  const hostname = window.location.hostname.toLowerCase().replace(/^www\./, '')
  if (chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ action: 'fetchPlaybook', hostname }, (res) => {
      if (res && res.success && res.data && Array.isArray(res.data.selectors)) {
        ACTIVE_SELECTORS = [...res.data.selectors, ...ACTIVE_SELECTORS]
      }
    })
  }

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

  function findCancelButton() {
    if (isAlreadyCancelled() || isDeadOr404Page()) return null

    // 1. Check known selectors (Tier 1 & Tier 2 Redis)
    for (const sel of ACTIVE_SELECTORS) {
      try {
        const el = document.querySelector(sel)
        if (el && !isDisallowedElement(el) && isVisible(el)) return el
      } catch (e) {}
    }

    // 2. Check strict keywords
    const candidates = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"], input[type="submit"], input[type="button"]'))

    for (const el of candidates) {
      if (!isVisible(el) || isDisallowedElement(el)) continue
      const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()
      if (STRICT_CANCEL_KEYWORDS.some(k => text === k || (text.includes(k) && text.length < 35))) {
        return el
      }
    }

    const pathname = window.location.pathname.toLowerCase()
    if (pathname.includes('/subscriptions') || pathname.includes('/account')) {
      for (const el of candidates) {
        if (!isVisible(el) || isDisallowedElement(el)) continue
        const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()
        if (text === 'ניהול' || text === 'manage' || text === 'ניהול המינוי' || text === 'manage subscription') {
          return el
        }
      }
    }

    return null
  }

  function findNavigationRecoveryElement() {
    const elements = Array.from(document.querySelectorAll('a, div[role="link"], div[role="button"], [tabindex="0"], span'))
    for (const el of elements) {
      if (!isVisible(el)) continue
      const text = (el.innerText || el.textContent || '').trim()

      if (
        text === 'Premium' ||
        text === 'פרימיום' ||
        text === 'Monetization' ||
        text === 'מונטיזציה' ||
        text === 'Creator Subscriptions' ||
        text === 'Manage Subscriptions' ||
        text === 'מינויים' ||
        text === 'Manage subscription'
      ) {
        return el.closest('a, div[role="link"], div[role="button"], [tabindex="0"]') || el
      }
    }
    return null
  }

  // --- HUDs ---

  function injectPeaceOfMindHUD(title, desc) {
    if (document.getElementById('subsnap-peace-hud')) return
    hudInjected = true

    const hud = document.createElement('div')
    hud.id = 'subsnap-peace-hud'
    hud.style.cssText = `
      position: fixed; bottom: 24px; left: 24px; z-index: 2147483647;
      background: #ffffff; border: 2px solid #10b981;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 0 24px rgba(16, 185, 129, 0.2);
      border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; gap: 12px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; direction: rtl;
      min-width: 360px; max-width: 480px; animation: subsnapPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `

    hud.innerHTML = `
      <style>
        @keyframes subsnapPop { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      </style>
      <div style="width: 36px; height: 36px; border-radius: 10px; background: #ecfdf5; border: 1.5px solid #a7f3d0; display: flex; align-items: center; justify-content: center; font-size: 18px;">
        🛡️
      </div>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 800; color: #065f46; display: flex; align-items: center; gap: 6px;">
          <span>${title}</span>
          <span style="font-size: 10px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 4px; font-weight: 800;">בטוח ✓</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px; line-height: 1.35;">${desc}</div>
      </div>
      <button id="subsnap-peace-close-btn" style="background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 7px 12px; font-size: 11px; font-weight: 800; cursor: pointer;">
        סגור ✕
      </button>
    `

    document.body.appendChild(hud)
    hud.querySelector('#subsnap-peace-close-btn').addEventListener('click', () => {
      hud.remove()
      hudInjected = false
    })
  }

  function injectSelfHealingHUD(title, desc, onTriggerAction) {
    if (document.getElementById('subsnap-assistant-hud')) {
      document.getElementById('subsnap-assistant-hud').remove()
    }
    hudInjected = true

    const hud = document.createElement('div')
    hud.id = 'subsnap-assistant-hud'
    hud.style.cssText = `
      position: fixed; bottom: 24px; left: 24px; z-index: 2147483647;
      background: #ffffff; border: 2px solid #10b981;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 0 20px rgba(16, 185, 129, 0.18);
      border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; gap: 12px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; direction: rtl;
      min-width: 360px; max-width: 480px; animation: subsnapPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `

    hud.innerHTML = `
      <style>
        @keyframes subsnapPop { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      </style>
      <div style="width: 36px; height: 36px; border-radius: 10px; background: #ecfdf5; border: 1.5px solid #a7f3d0; display: flex; align-items: center; justify-content: center; font-size: 18px;">
        🤖
      </div>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 800; color: #065f46; display: flex; align-items: center; gap: 6px;">
          <span>${title}</span>
          <span id="subsnap-heal-timer" style="font-size: 10px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 4px; font-weight: 800;">2s</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px; line-height: 1.35;">${desc}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <button id="subsnap-heal-now-btn" style="background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 7px 12px; font-size: 11px; font-weight: 800; cursor: pointer;">
          בצע עכשיו ➔
        </button>
        <button id="subsnap-heal-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px 4px;">
          ✕
        </button>
      </div>
    `

    document.body.appendChild(hud)

    function doAction() {
      if (countdownTimer) clearInterval(countdownTimer)
      hud.remove()
      hudInjected = false
      if (onTriggerAction) onTriggerAction()
    }

    function startHealingCountdown() {
      let seconds = 2
      countdownTimer = setInterval(() => {
        seconds--
        if (seconds > 0) {
          if (timerBadge) timerBadge.textContent = `${seconds}s`
        } else {
          clearInterval(countdownTimer)
          doAction()
        }
      }, 1000)
    }

    const timerBadge = hud.querySelector('#subsnap-heal-timer')
    const storageApi = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) ? chrome.storage.local : null

    // Fix #5: Honor manual_highlight in Self-Healing HUD
    if (storageApi) {
      storageApi.get(['autopilot_mode'], (res) => {
        const mode = res ? res.autopilot_mode : 'countdown_5s'
        if (mode === 'manual_highlight') {
          if (timerBadge) {
            timerBadge.textContent = 'ידני 🎯'
            timerBadge.style.color = '#4338ca'
            timerBadge.style.background = '#eef2ff'
            timerBadge.style.borderColor = '#c7d2fe'
          }
          // Do not start countdown
        } else {
          startHealingCountdown()
        }
      })
    } else {
      startHealingCountdown()
    }

    hud.querySelector('#subsnap-heal-now-btn').addEventListener('click', doAction)
    hud.querySelector('#subsnap-heal-close-btn').addEventListener('click', () => {
      if (countdownTimer) clearInterval(countdownTimer)
      hud.remove()
      hudInjected = false
    })
  }

  function injectAIEscalationHUD(title, desc) {
    if (document.getElementById('subsnap-ai-hud')) return
    hudInjected = true

    const hud = document.createElement('div')
    hud.id = 'subsnap-ai-hud'
    hud.style.cssText = `
      position: fixed; bottom: 24px; left: 24px; z-index: 2147483647;
      background: #ffffff; border: 2px solid #6366f1;
      box-shadow: 0 16px 40px rgba(99, 102, 241, 0.25);
      border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; gap: 12px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; direction: rtl;
      min-width: 360px; max-width: 480px; animation: subsnapPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `

    hud.innerHTML = `
      <style>
        @keyframes subsnapPop { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes subsnapSpin { 100% { transform: rotate(360deg); } }
      </style>
      <div style="width: 36px; height: 36px; border-radius: 10px; background: #eef2ff; border: 1.5px solid #c7d2fe; display: flex; align-items: center; justify-content: center; font-size: 18px;">
        <span style="display: inline-block; animation: subsnapSpin 3s linear infinite;">🧭</span>
      </div>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 800; color: #4338ca; display: flex; align-items: center; gap: 6px;">
          <span>${title}</span>
          <span style="font-size: 10px; background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; padding: 1px 6px; border-radius: 4px; font-weight: 800;">פעיל ⚡</span>
        </div>
        <div id="subsnap-ai-desc" style="font-size: 11px; color: #475569; margin-top: 2px; line-height: 1.35;">${desc}</div>
      </div>
      <button id="subsnap-ai-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px 4px;">
        ✕
      </button>
    `

    document.body.appendChild(hud)
    hud.querySelector('#subsnap-ai-close-btn').addEventListener('click', () => {
      hud.remove()
      hudInjected = false
    })
  }

  function injectAutoPilotHUD(btn) {
    if (hudInjected || document.getElementById('subsnap-hud')) return
    hudInjected = true

    btn.scrollIntoView({ behavior: 'smooth', block: 'center' })
    btn.style.outline = '3px solid #10b981'
    btn.style.outlineOffset = '3px'

    const hud = document.createElement('div')
    hud.id = 'subsnap-hud'
    hud.style.cssText = `
      position: fixed; bottom: 24px; left: 24px; z-index: 2147483647;
      background: #ffffff; border: 1.5px solid #10b981;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 0 20px rgba(16, 185, 129, 0.15);
      border-radius: 16px; padding: 12px 16px; display: flex; align-items: center; gap: 12px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; direction: ltr;
      animation: subsnapPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `

    hud.innerHTML = `
      <style>
        @keyframes subsnapPop { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      </style>
      <div style="width: 32px; height: 32px; border-radius: 10px; background: #ecfdf5; border: 1px solid #a7f3d0; display: flex; align-items: center; justify-content: center; color: #059669;">
        ⚡
      </div>
      <div>
        <div style="font-size: 13px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 6px;">
          <span>SubSnap Auto-Pilot</span>
          <span id="subsnap-timer-badge" style="font-size: 10px; font-weight: 800; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 6px;">5s</span>
        </div>
        <div id="subsnap-desc" style="font-size: 11px; color: #64748b; margin-top: 1px;">Subscription pathway located. Proceeding in 5s...</div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; margin-left: 8px;">
        <button id="subsnap-action-btn" style="background: #0f172a; color: #ffffff; font-weight: 800; border: none; border-radius: 8px; padding: 6px 12px; font-size: 11px; cursor: pointer;">
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

    function triggerCancel() {
      if (countdownTimer) clearInterval(countdownTimer)
      descEl.textContent = 'Executing cancellation pathway...'
      timerBadge.textContent = 'Active ⚡'
      forceClick(btn)
    }

    actionBtn.addEventListener('click', triggerCancel)
    stopBtn.addEventListener('click', () => {
      if (countdownTimer) clearInterval(countdownTimer)
      descEl.textContent = 'Auto-Pilot paused.'
      timerBadge.textContent = 'Paused'
    })
    closeBtn.addEventListener('click', () => {
      if (countdownTimer) clearInterval(countdownTimer)
      hud.remove()
      hudInjected = false
    })

    function startCountdown() {
      let secondsLeft = 5
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

    // Fix #5: Explicitly honor autopilot_mode (manual_highlight vs countdown_5s)
    const storageApi = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) ? chrome.storage.local : null
    if (storageApi) {
      storageApi.get(['autopilot_mode'], (res) => {
        const mode = res ? res.autopilot_mode : 'countdown_5s'
        if (mode === 'manual_highlight') {
          timerBadge.textContent = 'Manual 🎯'
          timerBadge.style.color = '#4338ca'
          timerBadge.style.background = '#eef2ff'
          timerBadge.style.borderColor = '#c7d2fe'
          descEl.textContent = 'Target located & highlighted. Click Proceed or the button on-page.'
          stopBtn.style.display = 'none'
          actionBtn.textContent = 'Confirm & Cancel ➔'
        } else {
          startCountdown()
        }
      })
    } else {
      startCountdown()
    }
  }

  // --- Tier 3: Emergency AI Escalation with Prioritization and Pinned Element References ---

  async function triggerAIEscalation(intent) {
    if (aiEscalationAttempted || hudInjected) return
    aiEscalationAttempted = true
    lastEscalatedUrl = window.location.href

    const cleanHost = window.location.hostname.toLowerCase().replace(/^www\./, '')
    const serviceName = intent ? intent.name : cleanHost

    injectAIEscalationHUD(
      'סייר AI מתערב בחילוץ 🤖',
      `לא אותר כפתור ביטול מוכר. סייר Gemini סורק את אלמנטי העמוד של ${serviceName}...`
    )

    // Fix #3: Intelligent Prioritization instead of crude slice(0, 35)
    const allInteractive = Array.from(
      document.querySelectorAll('button, a, div[role="button"], span[role="button"], input[type="submit"]')
    ).filter(el => isVisible(el) && !isDisallowedElement(el))

    const scoredElements = allInteractive.map(el => {
      let score = 0
      const text = (el.innerText || el.textContent || el.value || '').toLowerCase()
      const inMain = !!el.closest('main, [role="main"], #main, .main, [class*="settings"], [class*="billing"], [class*="account"]')
      const inNav = !!el.closest('nav, header, [role="navigation"]')

      if (inMain) score += 6
      if (inNav) score -= 8
      if (/subscri|member|plan|bill|renew|cancel|end|deactiv/i.test(text)) score += 12
      if (/pref|manage|opt|setting/i.test(text)) score += 4

      return { el, score, text }
    })

    // Sort by priority and take top 45 relevant elements
    const prioritized = scoredElements
      .sort((a, b) => b.score - a.score)
      .slice(0, 45)

    if (prioritized.length === 0) {
      if (document.getElementById('subsnap-ai-hud')) document.getElementById('subsnap-ai-hud').remove()
      hudInjected = false
      return
    }

    // Prepare serializable snapshot for Gemini
    const payloadElements = prioritized.map((item, index) => ({
      index,
      tag: item.el.tagName.toLowerCase(),
      text: item.text.slice(0, 100),
      className: (item.el.className || '').toString().slice(0, 100),
      id: item.el.id || '',
      href: item.el.getAttribute('href') || ''
    }))

    chrome.runtime.sendMessage({
      action: 'domScout',
      payload: {
        serviceName,
        hostname: cleanHost,
        elements: payloadElements
      }
    }, (res) => {
      if (document.getElementById('subsnap-ai-hud')) document.getElementById('subsnap-ai-hud').remove()
      hudInjected = false

      let targetEl = null

      // Fix #1: Wrap querySelector in isolated try/catch so invalid CSS syntax does NOT kill execution!
      if (res && res.success && res.data && res.data.targetSelector) {
        try {
          const found = document.querySelector(res.data.targetSelector)
          if (found && isVisible(found) && !isDisallowedElement(found)) {
            targetEl = found
          }
        } catch (syntaxErr) {
          console.warn('[SubSnap] AI generated invalid CSS selector syntax:', res.data.targetSelector)
        }
      }

      // Fix #2: Fallback to PINNED DOM Reference (using closure reference, NOT re-querying shifted DOM!)
      if (!targetEl && res && res.success && res.data && typeof res.data.bestMatchIndex === 'number' && res.data.bestMatchIndex >= 0) {
        const candidate = prioritized[res.data.bestMatchIndex]
        if (candidate && candidate.el && candidate.el.isConnected && isVisible(candidate.el) && !isDisallowedElement(candidate.el)) {
          targetEl = candidate.el
        }
      }

      // If valid target was resolved:
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        targetEl.style.outline = '3px solid #10b981'
        targetEl.style.outlineOffset = '3px'

        injectSelfHealingHUD(
          'נתיב הביטול אותר ע&quot;י AI 🤖⚡',
          `ה-AI פיצח את הנתיב. ממשיך ומאמת את התוצאה...`,
          () => {
            // Two-Phase Verification: Staged in sessionStorage, NOT committed blindly!
            try {
              sessionStorage.setItem('subsnap_pending_verification', JSON.stringify({
                host: cleanHost,
                urlBefore: window.location.href,
                selector: res.data ? res.data.targetSelector : null,
                timestamp: Date.now()
              }))
            } catch (e) {}

            forceClick(targetEl)
            setTimeout(startScanningEngine, 1000)
          }
        )
        return
      }

      // Fix #1 (Part 2): Only show Peace of Mind if AI EXPLICITLY returned confidence 0 & bestMatchIndex -1.
      // NEVER show Peace of Mind on selector resolution failure or parse errors!
      if (res && res.success && res.data && res.data.bestMatchIndex === -1 && res.data.confidence === 0) {
        injectPeaceOfMindHUD(
          'בשורות טובות: לא נמצא מנוי פעיל ✨',
          `סייר ה-AI סרק את אפשרויות העמוד עבור ${serviceName} ואימת שלא קיים מנוי בתשלום או כפתור ביטול פעיל.`
        )
      } else {
        console.warn('[SubSnap] AI DOM Scout completed without resolving a reliable action target.')
      }
    })
  }

  // --- Two-Phase Outcome Verification Engine ---
  function verifyAndCommitPendingHeal() {
    try {
      const pendingRaw = sessionStorage.getItem('subsnap_pending_verification')
      if (!pendingRaw) return
      const pending = JSON.parse(pendingRaw)

      // Expire candidates after 60 seconds
      if (Date.now() - pending.timestamp > 60000) {
        sessionStorage.removeItem('subsnap_pending_verification')
        return
      }

      // VERIFICATION CONDITIONS: Must be 100% verified real outcome
      const isCancelled = isAlreadyCancelled()
      const hasVerifiedCancelBtn = findCancelButton() !== null

      if (isCancelled || hasVerifiedCancelBtn) {
        if (chrome.runtime && chrome.runtime.sendMessage && pending.selector) {
          chrome.runtime.sendMessage({
            action: 'reportHealedUrl',
            payload: {
              host: pending.host,
              healedUrl: window.location.href,
              selector: pending.selector
            }
          })
        }
        sessionStorage.removeItem('subsnap_pending_verification')
      }
    } catch (e) {}
  }

  // --- Main Tiered Scan Engine ---

  async function performScan() {
    // Check if a previous candidate click achieved verified success
    verifyAndCommitPendingHeal()

    if (hudInjected) return false

    // Tier 1.1: Check if already cancelled
    if (isAlreadyCancelled()) {
      injectPeaceOfMindHUD(
        'המנוי כבר בוטל בהצלחה! 🎉',
        'סייר SubSnap זיהה שהמינוי כבר מבוטל. לא יבוצע חיוב נוסף.'
      )
      return true
    }

    // Tier 1.2: Check if cancel button is present on screen (Local or Redis Playbook)
    const btn = findCancelButton()
    if (btn) {
      injectAutoPilotHUD(btn)
      return true
    }

    // Tier 1.3: Proactive Check: No Active Subscription / Free Account
    if (isNoActiveSubscriptionState()) {
      injectPeaceOfMindHUD(
        'בשורות טובות: לא נמצא מנוי פעיל ✨',
        'סייר SubSnap בדק את הגדרות החשבון. לא קיים מנוי פרימיום בתשלום או חיוב חודשי פעיל עבור חשבון זה באתר.'
      )
      return true
    }

    // Tier 1.4: 404 / Dead Link Recovery
    if (isDeadOr404Page()) {
      const recoveryNav = findNavigationRecoveryElement()
      const cleanHost = window.location.hostname.toLowerCase().replace(/^www\./, '')

      if (recoveryNav) {
        recoveryNav.scrollIntoView({ behavior: 'smooth', block: 'center' })
        recoveryNav.style.outline = '3px solid #10b981'
        recoveryNav.style.outlineOffset = '3px'

        injectSelfHealingHUD(
          'ריפוי עצמי של סייר SubSnap 🤖',
          'הקישור הישן השתנה. מתקן מסלול ופותח את הגדרות הפרימיום שנמצאו בעמוד...',
          () => {
            try {
              sessionStorage.setItem('subsnap_pending_verification', JSON.stringify({
                host: cleanHost,
                urlBefore: window.location.href,
                selector: 'div[data-testid="cancelSubscription"]',
                timestamp: Date.now()
              }))
            } catch (e) {}

            forceClick(recoveryNav)
            setTimeout(startScanningEngine, 1000)
          }
        )
        return true
      }
    }

    return false
  }

  function startScanningEngine() {
    // Fix #4: Reset aiEscalationAttempted if URL changed (SPA Navigation)
    if (window.location.href !== lastEscalatedUrl) {
      aiEscalationAttempted = false
    }

    if (activeObserver) activeObserver.disconnect()
    if (activeScanInterval) clearInterval(activeScanInterval)

    let scanAttempts = 0
    const maxAttempts = 7 // ~3.5 seconds of fast Tier 1/2 local scan

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

        // TIER 3 ESCALATION: Only if Tier 1 & Tier 2 failed and user came with active intent
        if (!found && !hudInjected && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['subsnap_active_intent'], (res) => {
            const intent = res ? res.subsnap_active_intent : null
            if (intent && (Date.now() - intent.timestamp < 180000)) {
              triggerAIEscalation(intent)
            }
          })
        }
      }
    }, 500)
  }

  startScanningEngine()

  window.addEventListener('popstate', () => {
    aiEscalationAttempted = false // Reset for SPA navigation
    setTimeout(startScanningEngine, 300)
  })
  window.addEventListener('hashchange', () => {
    aiEscalationAttempted = false // Reset for SPA navigation
    setTimeout(startScanningEngine, 300)
  })
})()
