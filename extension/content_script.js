/**
 * SubSnap In-Page Visual Auto-Pilot & Autonomous Assistant (v1.0.0)
 * Zero Silent Failures · Active Intent Persistence · Real-Time Page Interpreter.
 */

(function () {
  if (window.__subsnap_loaded) return
  window.__subsnap_loaded = true

  let hudInjected = false
  let countdownTimer = null
  let activeObserver = null
  let activeScanInterval = null

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

  // Detects if the current page indicates no active subscription
  function detectAccountStatus() {
    const bodyText = (document.body.innerText || '').toLowerCase()
    if (bodyText.includes('subscriptions\nineligible') || bodyText.includes('subscriptions ineligible') || (bodyText.includes('subscriptions') && bodyText.includes('ineligible'))) {
      return 'ineligible'
    }
    if (bodyText.includes('no active subscription') || bodyText.includes('free plan') || bodyText.includes('אין מנוי פעיל') || bodyText.includes('אין לך מינויים פעילים')) {
      return 'free'
    }
    return 'unknown'
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

  function findCancelButton() {
    if (isAlreadyCancelled() || isDeadOr404Page()) return null

    const candidates = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"], input[type="submit"], input[type="button"]'))

    for (const el of candidates) {
      if (!isVisible(el)) continue
      const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()
      if (STRICT_CANCEL_KEYWORDS.some(k => text === k || (text.includes(k) && text.length < 35))) {
        return el
      }
    }

    const pathname = window.location.pathname.toLowerCase()
    if (pathname.includes('/subscriptions') || pathname.includes('/account')) {
      for (const el of candidates) {
        if (!isVisible(el)) continue
        const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()
        if (text === 'ניהול' || text === 'manage' || text === 'ניהול המינוי' || text === 'manage subscription') {
          return el
        }
      }
    }

    return null
  }

  // 1. Assistant HUD (Guidance & Intermediate Page Resolver)
  function injectAssistantHUD(title, desc, actionLabel = null, actionCallback = null) {
    if (document.getElementById('subsnap-assistant-hud')) {
      document.getElementById('subsnap-assistant-hud').remove()
    }
    hudInjected = true

    const hud = document.createElement('div')
    hud.id = 'subsnap-assistant-hud'
    hud.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 2147483647;
      background: #ffffff;
      border: 1.5px solid #0284c7;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 0 20px rgba(2, 132, 199, 0.15);
      border-radius: 16px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      direction: rtl;
      min-width: 340px;
      max-width: 480px;
      animation: subsnapPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `

    hud.innerHTML = `
      <style>
        @keyframes subsnapPop {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      </style>
      <div style="width: 36px; height: 36px; border-radius: 10px; background: #e0f2fe; border: 1.5px solid #bae6fd; display: flex; align-items: center; justify-content: center; font-size: 18px;">
        🧭
      </div>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 800; color: #0369a1;">${title}</div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px; line-height: 1.35;">${desc}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        ${actionLabel ? `
          <button id="subsnap-ast-action-btn" style="background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 7px 12px; font-size: 11px; font-weight: 800; cursor: pointer;">
            ${actionLabel}
          </button>
        ` : ''}
        <button id="subsnap-ast-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px 4px;">
          ✕
        </button>
      </div>
    `

    document.body.appendChild(hud)

    if (actionLabel && actionCallback) {
      hud.querySelector('#subsnap-ast-action-btn').addEventListener('click', actionCallback)
    }

    hud.querySelector('#subsnap-ast-close-btn').addEventListener('click', () => {
      hud.remove()
      hudInjected = false
    })
  }

  // 2. Cancellation Auto-Pilot HUD
  function injectAutoPilotHUD(btn, mode = 'countdown_5s') {
    if (hudInjected || document.getElementById('subsnap-hud')) return
    hudInjected = true

    btn.scrollIntoView({ behavior: 'smooth', block: 'center' })
    btn.style.outline = '3px solid #10b981'
    btn.style.outlineOffset = '3px'

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
  }

  // 3. Main Scanning Engine
  async function performScan() {
    if (hudInjected) return false

    // A. Check if already cancelled
    if (isAlreadyCancelled()) {
      injectAssistantHUD(
        'המנוי כבר בוטל בהצלחה! 🎉',
        'המערכת זיהתה שהמינוי שלך כבר מבוטל. לא יבוצע חיוב נוסף.'
      )
      return true
    }

    // B. Check if cancel button is present on screen
    const btn = findCancelButton()
    if (btn) {
      injectAutoPilotHUD(btn)
      return true
    }

    // C. Check account status on intermediate/creator pages
    const status = detectAccountStatus()
    if (status === 'ineligible' || status === 'free') {
      injectAssistantHUD(
        'סייר SubSnap: אין מנוי פעיל בחשבון זה',
        'בדף זה מופיע שחשבון ה-X שלך אינו מחובר למנוי פרימיום פעיל (Ineligible). אם נרשמת דרך גוגל פליי או אפל — המנוי מנוהל שם.',
        'פתח את הגדרות X ➔',
        () => { window.location.href = 'https://x.com/settings' }
      )
      return true
    }

    // D. If on a 404 dead page
    if (isDeadOr404Page()) {
      injectAssistantHUD(
        'סייר SubSnap: הקישור הישן השתנה',
        'נחתת בעמוד שאינו קיים. SubSnap יכול להעביר אותך לעמוד ההגדרות הראשי.',
        'נווט להגדרות ➔',
        () => { window.location.href = 'https://x.com/settings' }
      )
      return true
    }

    return false
  }

  function startScanningEngine() {
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

        // If after 5 seconds nothing was found, and we have an active intent, ALWAYS show assistant!
        if (!found && !hudInjected && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['subsnap_active_intent'], (res) => {
            const intent = res ? res.subsnap_active_intent : null
            if (intent && (Date.now() - intent.timestamp < 180000)) {
              injectAssistantHUD(
                `סייר SubSnap: ניווט ${intent.name}`,
                'נחתת בעמוד ביניים של האתר. האם תרצה לנווט לעמוד ההגדרות הראשי?',
                'נווט להגדרות ➔',
                () => { window.location.href = 'https://x.com/settings' }
              )
            }
          })
        }
      }
    }, 500)
  }

  startScanningEngine()

  window.addEventListener('popstate', () => setTimeout(startScanningEngine, 300))
  window.addEventListener('hashchange', () => setTimeout(startScanningEngine, 300))
})()
