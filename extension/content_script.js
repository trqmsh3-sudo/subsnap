/**
 * SubSnap In-Page Auto-Pilot Content Script
 * Intelligent Cancellation Engine with Countdown, Instant Auto-Pilot, and Manual Modes.
 */

(function () {
  if (window.__subsnap_loaded) return
  window.__subsnap_loaded = true

  const CANCEL_SELECTORS = [
    'button:contains("Cancel plan")',
    'button:contains("Cancel subscription")',
    'button:contains("Cancel membership")',
    'button:contains("End membership")',
    'button:contains("Deactivate")',
    'button:contains("Finish Cancellation")',
    'button:contains("Manage plan")',
    'button:contains("Cancel your plan")',
    'a:contains("Cancel plan")',
    'a:contains("Cancel subscription")',
    'a:contains("Cancel membership")',
    'a:contains("Cancel your plan")',
    'a:contains("Manage plan")',
    '[data-testid*="cancel"]',
    '[data-testid*="manage-plan"]',
    '[aria-label*="cancel" i]',
    'button[class*="cancel" i]',
    'a[href*="cancel" i]',
    'a[href*="plans" i]'
  ]

  function findCancelButton() {
    const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], span[role="button"]'))
    const keywords = [
      'cancel subscription',
      'cancel your plan',
      'cancel plan',
      'cancel membership',
      'finish cancellation',
      'end membership',
      'manage plan',
      'בטל מנוי',
      'בטל תוכנית',
      'בטל את התוכנית שלך',
      'סיום ביטול'
    ]

    for (const el of elements) {
      const text = (el.innerText || el.textContent || '').toLowerCase().trim()
      if (keywords.some(k => text.includes(k))) {
        return el
      }
    }

    for (const sel of CANCEL_SELECTORS) {
      try {
        const el = document.querySelector(sel)
        if (el) return el
      } catch (e) {}
    }

    return null
  }

  let hudInjected = false
  let countdownTimer = null

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
      background: rgba(9, 10, 15, 0.96);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(16, 185, 129, 0.4);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(16, 185, 129, 0.2);
      border-radius: 18px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      font-family: system-ui, -apple-system, sans-serif;
      direction: rtl;
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
          50% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); }
        }
      </style>
      <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #10b981; font-weight: bold;">
        ⚡
      </div>
      <div>
        <div style="font-size: 13px; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 6px;">
          <span>SubSnap Auto-Pilot</span>
          <span id="subsnap-timer-badge" style="font-size: 11px; font-weight: 700; color: #34d399; background: rgba(16, 185, 129, 0.15); padding: 1px 6px; border-radius: 6px;">3 שניות</span>
        </div>
        <div id="subsnap-desc" style="font-size: 11px; color: #94a3b8; margin-top: 1px;">כפתור הביטול זוהה. מבטל אוטומטית...</div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; margin-right: 8px;">
        <button id="subsnap-action-btn" style="background: #10b981; color: #032014; font-weight: 800; border: none; border-radius: 9px; padding: 7px 12px; font-size: 11px; cursor: pointer; transition: transform 0.1s;">
          בטל מיד ➔
        </button>
        <button id="subsnap-stop-btn" style="background: rgba(255, 255, 255, 0.08); color: #e2e8f0; font-weight: 600; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 9px; padding: 7px 10px; font-size: 11px; cursor: pointer;">
          עצור
        </button>
        <button id="subsnap-close-btn" style="background: none; border: none; color: #64748b; font-size: 14px; cursor: pointer; padding: 2px 6px;">
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
        descEl.textContent = 'מבצע ביטול עכשיו...'
        timerBadge.textContent = 'מבוצע ⚡'
        timerBadge.style.color = '#10b981'
        btn.click()
        setTimeout(() => {
          descEl.textContent = '✓ הפעולה בוצעה בהצלחה!'
        }, 1500)
      }

      actionBtn.addEventListener('click', triggerCancel)

      stopBtn.addEventListener('click', () => {
        if (countdownTimer) clearInterval(countdownTimer)
        timerBadge.style.display = 'none'
        descEl.textContent = 'אוטו-פיילוט נעצר. אתה יכול ללחוץ ידנית.'
        stopBtn.style.display = 'none'
        actionBtn.textContent = 'בצע ביטול ➔'
      })

      // Handle Modes
      if (mode === 'instant') {
        triggerCancel()
      } else if (mode === 'manual_highlight') {
        timerBadge.style.display = 'none'
        stopBtn.style.display = 'none'
        descEl.textContent = 'כפתור הביטול אותר והודגש בירוק'
      } else {
        // Default: 3s Countdown
        let secondsLeft = 3
        countdownTimer = setInterval(() => {
          secondsLeft--
          if (secondsLeft > 0) {
            timerBadge.textContent = `${secondsLeft} שניות`
          } else {
            clearInterval(countdownTimer)
            triggerCancel()
          }
        }, 1000)
      }
    } else {
      timerBadge.style.display = 'none'
      stopBtn.style.display = 'none'
      descEl.textContent = 'גלול בעמוד לאיתור כפתור הביטול'
      actionBtn.textContent = 'גלול למטה'
      actionBtn.addEventListener('click', () => {
        window.scrollBy({ top: 400, behavior: 'smooth' })
      })
    }

    closeBtn.addEventListener('click', () => {
      if (countdownTimer) clearInterval(countdownTimer)
      hud.remove()
      hudInjected = false
      if (btn) {
        btn.style.outline = ''
        btn.style.animation = ''
      }
    })
  }

  function getModeAndScan() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['autopilot_mode'], (res) => {
        const mode = res.autopilot_mode || 'countdown_3s'
        const btn = findCancelButton()
        if (btn) injectHUD(btn, mode)
      })
    } else {
      const btn = findCancelButton()
      if (btn) injectHUD(btn, 'countdown_3s')
    }
  }

  getModeAndScan()
  const interval = setInterval(getModeAndScan, 1000)
  setTimeout(() => clearInterval(interval), 10000)

  const observer = new MutationObserver(() => {
    if (!hudInjected) getModeAndScan()
  })
  observer.observe(document.body, { childList: true, subtree: true })

})()
