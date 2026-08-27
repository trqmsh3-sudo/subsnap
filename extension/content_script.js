/**
 * SubSnap In-Page Auto-Pilot Content Script
 * Automatically locates and highlights cancellation buttons on target websites.
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
    // 1. Exact text scan across buttons and links
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

    // 2. Selectors fallback
    for (const sel of CANCEL_SELECTORS) {
      try {
        const el = document.querySelector(sel)
        if (el) return el
      } catch (e) {}
    }

    return null
  }

  let hudInjected = false

  function injectHUD(btn) {
    if (hudInjected || document.getElementById('subsnap-hud')) return
    hudInjected = true

    const hud = document.createElement('div')
    hud.id = 'subsnap-hud'
    hud.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 2147483647;
      background: rgba(9, 10, 15, 0.95);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(16, 185, 129, 0.4);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.2);
      border-radius: 16px;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
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
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
          50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
        }
      </style>
      <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; display: flex; align-items: center; justify-content: center; font-size: 15px; color: #10b981; font-weight: bold;">
        ⚡
      </div>
      <div>
        <div style="font-size: 13px; font-weight: 800; color: #ffffff;">SubSnap Auto-Pilot</div>
        <div style="font-size: 11px; color: #94a3b8;">כפתור הביטול אותר והודגש בירוק</div>
      </div>
      <button id="subsnap-click-btn" style="background: #10b981; color: #032014; font-weight: 800; border: none; border-radius: 8px; padding: 7px 12px; font-size: 11px; cursor: pointer; margin-right: 6px; transition: transform 0.1s;">
        בצע ביטול ➔
      </button>
      <button id="subsnap-close-btn" style="background: none; border: none; color: #64748b; font-size: 13px; cursor: pointer; padding: 2px 4px;">
        ✕
      </button>
    `

    document.body.appendChild(hud)

    const clickBtn = hud.querySelector('#subsnap-click-btn')
    const closeBtn = hud.querySelector('#subsnap-close-btn')

    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' })
      btn.style.outline = '3px solid #10b981'
      btn.style.outlineOffset = '3px'
      btn.style.animation = 'subsnapPulse 2s infinite'

      clickBtn.addEventListener('click', () => {
        btn.click()
      })
    } else {
      clickBtn.textContent = 'גלול לביטול'
      clickBtn.addEventListener('click', () => {
        window.scrollBy({ top: 400, behavior: 'smooth' })
      })
    }

    closeBtn.addEventListener('click', () => {
      hud.remove()
      hudInjected = false
      if (btn) {
        btn.style.outline = ''
        btn.style.animation = ''
      }
    })
  }

  // Active scanning with MutationObserver for dynamic React/SPA apps like Adobe
  function scan() {
    const btn = findCancelButton()
    if (btn) {
      injectHUD(btn)
    }
  }

  scan()
  const interval = setInterval(scan, 1000)
  setTimeout(() => clearInterval(interval), 10000)

  const observer = new MutationObserver(() => {
    if (!hudInjected) scan()
  })
  observer.observe(document.body, { childList: true, subtree: true })

})()
