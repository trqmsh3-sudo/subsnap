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
        <div id="subsnap-desc" style="font-size: 11px; color: #64748b; margin-top: 1px;">Cancel button identified. Auto-cancelling...</div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; margin-left: 8px;">
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
        descEl.textContent = 'Executing cancellation...'
        timerBadge.textContent = 'Done ✓'
        timerBadge.style.color = '#059669'
        btn.click()
        setTimeout(() => {
          descEl.textContent = '✓ Action executed successfully!'
        }, 1500)
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
    chrome.storage.local.get(['autopilot_mode'], (res) => {
      const mode = res.autopilot_mode || 'countdown_3s'
      const btn = findCancelButton()
      if (btn) {
        injectHUD(btn, mode)
      }
    })
  }

  setTimeout(checkAndExecute, 1000)
  setTimeout(checkAndExecute, 2500)

  // Observe dynamically loaded SPAs
  const observer = new MutationObserver(() => {
    if (!hudInjected) {
      checkAndExecute()
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
})()
