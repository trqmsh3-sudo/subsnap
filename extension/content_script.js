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
  let autoPilotStepCount = 0
  let countdownTimer = null
  let activeObserver = null
  let activeScanInterval = null

  // URL state tracking for SPA resets (Fix #4)
  let lastEscalatedUrl = ''
  let aiEscalationAttempted = false

  function isHostMatch(targetHost, currentHost) {
    if (!targetHost || !currentHost) return false
    const t = targetHost.toLowerCase().replace(/^www\./, '')
    const c = currentHost.toLowerCase().replace(/^www\./, '')

    if (c === t) return true
    if (c.endsWith('.' + t) || t.endsWith('.' + c)) return true

    // Sibling subdomains on same root domain (e.g. play.google.com and myaccount.google.com)
    const tParts = t.split('.')
    const cParts = c.split('.')
    if (tParts.length >= 2 && cParts.length >= 2) {
      const tRoot = tParts.slice(-2).join('.')
      const cRoot = cParts.slice(-2).join('.')
      if (tRoot === cRoot && tRoot.length > 4) return true
    }

    // SSO identity providers (Google, Apple, Microsoft, Auth0, Clerk) during login transitions
    const isSSODomain = (h) => (
      h.includes('accounts.google.') ||
      h.includes('appleid.apple.') ||
      h.includes('login.microsoftonline.') ||
      h.includes('auth0.com') ||
      h.includes('clerk.')
    )
    if (isSSODomain(c)) return true

    const isXOrTwitter = (h) => h === 'x.com' || h.endsWith('.x.com') || h === 'twitter.com' || h.endsWith('.twitter.com')
    if (isXOrTwitter(t) && isXOrTwitter(c)) return true

    return false
  }

  function isVisible(el) {
    if (!el || el.offsetParent === null) return false
    const style = window.getComputedStyle(el)
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.pointerEvents === 'none' ||
      parseFloat(style.opacity || '1') < 0.1
    ) {
      return false
    }
    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }

  // Shadow DOM traversal for modern SaaS (ChatGPT, Notion, Stripe Customer Portal)
  function queryDeep(selector, root = document, depth = 0) {
    const results = Array.from(root.querySelectorAll(selector))
    if (depth >= 3) return results

    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
      let node = walker.nextNode()
      while (node) {
        if (node.shadowRoot) {
          try {
            results.push(...queryDeep(selector, node.shadowRoot, depth + 1))
          } catch (e) {}
        }
        node = walker.nextNode()
      }
    } catch (e) {}
    return results
  }

  function unlockDisabledAction(btn) {
    if (!btn) return false
    const isDisabled = btn.disabled || btn.getAttribute('aria-disabled') === 'true' || btn.classList.contains('disabled')
    if (!isDisabled) return true

    // Find closest container/form/dialog enclosing this button
    const container = btn.closest('form, dialog, [role="dialog"], [aria-modal="true"], div[class*="modal"], div[class*="step"], div[class*="content"], div[class*="container"]') || document

    // Search for unchecked checkboxes or toggle switches that unblock the cancel button
    const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]:not(:checked), [role="checkbox"][aria-checked="false"]'))
      .filter(cb => isVisible(cb))

    for (const cb of checkboxes) {
      const parentLabel = cb.closest('label') || cb.parentElement
      const text = ((parentLabel ? parentLabel.innerText : '') + ' ' + (cb.innerText || '')).toLowerCase()

      // Confirm this checkbox relates to acknowledging cancellation terms / loss of discounts
      const isCancellationAcknowledgement = /(understand|lose|agree|terms|confirm|cancel|acknowledge|אני מבין|אאבד|מאשר|תנאי|בכל זאת|ביטול)/i.test(text)
      if (isCancellationAcknowledgement || checkboxes.length === 1) {
        try {
          cb.focus()
          cb.click()
          if (cb.type === 'checkbox') {
            cb.checked = true
            cb.dispatchEvent(new Event('change', { bubbles: true }))
            cb.dispatchEvent(new Event('input', { bubbles: true }))
          }
        } catch (e) {}
      }
    }

    // Force remove disabled attributes so button can be clicked
    try {
      btn.disabled = false
      btn.removeAttribute('aria-disabled')
      btn.classList.remove('disabled')
    } catch (e) {}

    return true
  }

  function forceClick(el) {
    if (!el) return
    try {
      unlockDisabledAction(el)
      el.focus()
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
      el.click()
    } catch (e) {}
  }

  let staleEvicted = false

  function isDeadOr404Page() {
    const pageTitle = (document.title || '').toLowerCase()
    const bodyText = (document.body.innerText || '').toLowerCase()

    const isDead = (
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

    if (isDead && !staleEvicted) {
      staleEvicted = true
      const cleanHost = window.location.hostname.toLowerCase().replace(/^www\./, '')
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'evictStalePlaybook', hostname: cleanHost })
      }
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['subsnap_learned_services'], (res) => {
          if (res && Array.isArray(res.subsnap_learned_services)) {
            const filtered = res.subsnap_learned_services.filter(s => {
              if (!s.cancelUrl) return true
              return !s.cancelUrl.toLowerCase().includes(cleanHost)
            })
            chrome.storage.local.set({ subsnap_learned_services: filtered })
          }
        })
      }
    }

    return isDead
  }

  function isLoginPage() {
    const pathname = window.location.pathname.toLowerCase()
    const hostname = window.location.hostname.toLowerCase()

    // 1. URL Path & Subdomain check
    const isLoginPath = (
      pathname.includes('/login') ||
      pathname.includes('/signin') ||
      pathname.includes('/sign-in') ||
      pathname.includes('/log-in') ||
      pathname.includes('/auth') ||
      pathname.includes('/identifier') ||
      pathname.includes('/challenge') ||
      hostname.startsWith('auth.') ||
      hostname.startsWith('login.') ||
      hostname.startsWith('accounts.')
    )

    // 2. DOM Password / Credential check
    const hasPasswordField = !!document.querySelector('input[type="password"]')
    const hasLoginForm = !!document.querySelector('form[action*="login"], form[action*="signin"], form[data-testid*="login"]')
    const hasSignInHeading = /התחברות|התחבר לחשבון|כניסה לחשבון|sign in|log in|welcome back/i.test(document.title || '')

    return (isLoginPath && (hasPasswordField || hasLoginForm || hasSignInHeading)) || (hasPasswordField && !pathname.includes('/account'))
  }

  function isAlreadyCancelled() {
    if (document.querySelector('[role="dialog"], dialog, div[aria-modal="true"], .modal, [class*="modal"]')) {
      return false
    }

    const bodyText = (document.body.innerText || '').toLowerCase()
    const hasCancelledHeader = /\bבוטל\b|מבוטל|המינוי בוטל|המינוי שלך בוטל|בוטל ב-|בוטל בתאריך|להרשמה מחדש|שחזור מנוי|חידוש מנוי|המינוי שלך יסתיים בתאריך|המינוי יסתיים ב-|פג תוקף|subscription cancelled|subscription canceled|plan canceled|plan cancelled|membership cancelled/i.test(bodyText)
    const isAskingConfirmation = /האם לבטל|המינוי יבוטל בסיום|are you sure you want to cancel|מה סיבת הביטול|reason.*cancel/i.test(bodyText)

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
      // English Free Tier Indicators
      'no active subscription',
      'no active subscriptions',
      'no subscriptions',
      'you don\'t have any subscriptions',
      'you have no subscriptions',
      'no active memberships',
      'current plan: free',
      'plan: free',
      'free plan',
      'free account',
      'spotify free',
      'youtube free',
      'canva free',
      'join premium',
      'get premium',
      'try premium',
      'upgrade to pro',
      'upgrade to premium',
      'upgrade plan',
      'switch to premium',
      // Hebrew Free Tier Indicators
      'אין לך מינויים',
      'אין מינויים',
      'אין לך מינויים פעילים',
      'אין מנוי פעיל',
      'אין מינויים פעילים',
      'לא נמצאו מינויים',
      'לא נמצאו מינויים פעילים',
      'לא נמצא מנוי פעיל',
      'המינויים שלך יופיעו כאן',
      'מינויים שתירשם אליהם יופיעו כאן',
      'מינויים יופיעו כאן',
      'תוכנית חינמית',
      'תוכנית: חינם',
      'חשבון חינם',
      'חשבון בחינם',
      'חשבון אחד בחינם',
      'הצטרפו אל premium',
      'הצטרפו ל-premium',
      'הצטרפות ל-premium',
      'הצטרף אל premium',
      'הצטרף ל-premium',
      'הצטרף לפרימיום',
      'הצטרפו לפרימיום',
      'הצטרפו אל פרימיום',
      'נסו את premium',
      'נסה את premium',
      'שדרוג ל-premium',
      'שדרג ל-premium',
      'שדרוג לפרימיום',
      'שדרג לפרימיום',
      'הצטרפו ל-pro',
      'שדרוג ל-pro'
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
    'סגירת חשבון',
    // Pause subscription traps (retention ploys)
    'pause subscription',
    'pause plan',
    'pause membership',
    'pause my subscription',
    'keep and pause',
    'הקפא מינוי',
    'הקפא מנוי',
    'הקפאת מינוי',
    'הקפאת מנוי',
    'השהה מינוי',
    'השהיית מנוי'
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
    'a[href*="/store/account/subscriptions/subscription?sku="]',
    // Connected Apps (Google / Apple / X)
    'button[aria-label*="מחק את כל הקשרים"]',
    'button[aria-label*="Delete all connections"]',
    'button[aria-label*="Remove access"]',
    'button[data-idom-class*="delete"]',
    'button[data-testid="revoke-app-permissions"]',
    // Newsletters / Webmail Unsubscribe
    'span[role="button"][data-tooltip*="ביטול הרשמה"]',
    'span[role="button"][data-tooltip*="Unsubscribe"]',
    'span[role="button"][aria-label*="ביטול הרשמה"]',
    'span[role="button"][aria-label*="Unsubscribe"]'
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
    'הפסקת מנוי',
    'הסר מרשימת תפוצה',
    'ביטול הרשמה',
    'unsubscribe',
    'הסרה מרשימת הדיוור',
    'stop using apple id',
    'revoke app permissions',
    'מחק את כל הקשרים',
    'נתק אפליקציה',
    'הסר גישה',
    'remove access',
    'remove these permissions',
    'disconnect account'
  ]

  function getActiveDialogScope() {
    const dialogs = Array.from(document.querySelectorAll('dialog[open], [role="dialog"], [aria-modal="true"]'))
      .filter(el => isVisible(el) && (el.innerText || '').trim().length > 10)
    if (dialogs.length === 0) return document
    return dialogs[dialogs.length - 1]
  }

  function resolveSurveyStep(scopeRoot) {
    if (!scopeRoot || scopeRoot === document) return null
    const text = (scopeRoot.innerText || scopeRoot.textContent || '').toLowerCase()
    const isSurvey = /(סיבת הביטול|למה לבטל|reason.*cancel|why.*leaving|why.*cancel|help us improve)/i.test(text)
    if (!isSurvey) return null

    // Find and select neutral radio option to unblock Next/Continue button
    const radios = Array.from(scopeRoot.querySelectorAll('input[type="radio"], [role="radio"], label, [data-value]'))
      .filter(r => isVisible(r))

    if (radios.length > 0) {
      const isAlreadyChecked = radios.some(r => r.checked || r.getAttribute('aria-checked') === 'true')
      if (!isAlreadyChecked) {
        let preferred = radios.find(r => /(לא רוצה להשיב|אחר|decline|other|not.*use|מספיק)/i.test(r.innerText || r.textContent || ''))
        if (!preferred) preferred = radios[0]
        if (preferred) forceClick(preferred)
      }
    }

    // Locate forward progress button (Continue / Next)
    const actionCandidates = queryDeep('button, a, div[role="button"], span[role="button"], [tabindex="0"]', scopeRoot)
    for (const btn of actionCandidates) {
      if (!isVisible(btn) || isDisallowedElement(btn)) continue
      const btnText = (btn.innerText || btn.textContent || btn.value || '').toLowerCase().trim()
      if (/(המשך|continue|next|proceed|advance)/i.test(btnText) && !/(הקודם|back|cancel)/i.test(btnText)) {
        unlockDisabledAction(btn)
        return btn
      }
    }
    return null
  }

  function findCancelButton(targetName = '') {
    if (isAlreadyCancelled() || isDeadOr404Page()) return null

    // 0. DIALOG HIERARCHY: Try active modal first
    const scopeRoot = getActiveDialogScope()

    // 0.1 Check retention survey in dialog
    if (scopeRoot !== document) {
      const surveyAction = resolveSurveyStep(scopeRoot)
      if (surveyAction) return surveyAction
    }

    function searchIn(root) {
      // 1. Check known selectors
      for (const sel of ACTIVE_SELECTORS) {
        try {
          const el = root.querySelector(sel)
          if (el && !isDisallowedElement(el) && isVisible(el)) return el
        } catch (e) {}
      }

      // 2. Check strict keywords
      const candidates = queryDeep('button, a, div[role="button"], span[role="button"], [role="link"], [jsaction*="click"], [tabindex="0"], input[type="submit"], input[type="button"]', root)
      for (const el of candidates) {
        if (!isVisible(el) || isDisallowedElement(el)) continue
        const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()
        if (STRICT_CANCEL_KEYWORDS.some(k => text === k || (text.includes(k) && text.length < 35))) {
          return el
        }
      }

      // 2.1 Direct text match fallback (Material Design action spans)
      const allEls = Array.from(root.querySelectorAll('button, a, span, div'))
      for (const el of allEls) {
        if (!isVisible(el) || isDisallowedElement(el)) continue
        const text = (el.innerText || el.textContent || '').trim().toLowerCase()
        if (text === 'ביטול המינוי' || text === 'cancel subscription' || text === 'cancel plan') {
          return el.closest('button, a, div[role="button"], [tabindex="0"], [jsaction*="click"]') || el
        }
      }

      return null
    }

    // Try modal first if open
    if (scopeRoot !== document) {
      const inModal = searchIn(scopeRoot)
      if (inModal) return inModal
    }

    // TARGET SCOPING: If user specified a specific service name (e.g. "Tinder", "Google One", "Duolingo")
    // and there are multiple subscription cards/rows on the page:
    if (targetName && targetName.length >= 3) {
      const tLower = targetName.toLowerCase()
      const candidateCards = Array.from(document.querySelectorAll('tr, li, article, div[role="listitem"], div[class*="item"], div[class*="card"], div[class*="subscription"], div[class*="container"]'))
        .filter(card => isVisible(card) && (card.innerText || '').toLowerCase().includes(tLower))

      for (const card of candidateCards) {
        const inCard = searchIn(card)
        if (inCard) return inCard

        // Manage button inside the target card
        const manageBtns = queryDeep('button, a, div[role="button"], span[role="button"], [jsaction*="click"], [tabindex="0"]', card)
        for (const el of manageBtns) {
          if (!isVisible(el) || isDisallowedElement(el)) continue
          const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()
          if (text === 'ניהול' || text === 'manage' || text.includes('ניהול') || text.includes('manage')) {
            return el
          }
        }
      }
    }

    // Search on main page
    const onPage = searchIn(document)
    if (onPage) return onPage

    // 3. Check contextual "Manage" buttons ONLY on main page
    const pathname = window.location.pathname.toLowerCase()
    const pageCandidates = queryDeep('button, a, div[role="button"], span[role="button"], [role="link"], [jsaction*="click"], [tabindex="0"]', document)
    for (const el of pageCandidates) {
      if (!isVisible(el) || isDisallowedElement(el)) continue
      const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()

      if (text === 'ניהול המינוי' || text === 'manage subscription' || text === 'manage plan' || text === 'ניהול מנוי') {
        return el
      }

      if (text === 'ניהול' || text === 'manage') {
        const card = el.closest('tr, li, article, div[role="listitem"], [class*="subscription"], [class*="plan"], [class*="membership"]') || el.parentElement?.parentElement
        const contextText = card ? (card.innerText || card.textContent || '').toLowerCase() : ''

        const hasSubContext = /(מינוי|מנוי|subscription|membership|plan|renewal|מתחדש|recurring)/i.test(contextText)
        const hasIrrelevantContext = /(notification|privacy|password|address|profile|email|security|התראות|אבטחה|פרטיות|סיסמה|פרופיל)/i.test(contextText)

        if ((pathname.includes('/subscriptions') || hasSubContext) && !hasIrrelevantContext) {
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

  function injectLoginBridgeHUD(serviceName = '') {
    if (document.getElementById('subsnap-login-hud')) return
    hudInjected = true

    const isHebrew = /[\u0590-\u05FF]/.test(document.title + ' ' + (document.body.innerText || '').slice(0, 500)) || (navigator.language && navigator.language.startsWith('he'))

    // Highlight 1-Click Social / Google Login if present
    try {
      const socialLoginBtn = document.querySelector('button[data-provider="google"], div[data-provider="google"], a[href*="google"], [aria-label*="Google"], [data-testid*="google"], button[data-provider="apple"], [aria-label*="Apple"]')
      if (socialLoginBtn && isVisible(socialLoginBtn)) {
        socialLoginBtn.style.outline = '2.5px solid #3b82f6'
        socialLoginBtn.style.outlineOffset = '2px'
      }
    } catch (e) {}

    const hud = document.createElement('div')
    hud.id = 'subsnap-login-hud'
    hud.style.cssText = `
      position: fixed; bottom: 24px; left: 24px; z-index: 2147483647;
      background: #ffffff; border: 2px solid #3b82f6;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 0 24px rgba(59, 130, 246, 0.2);
      border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; gap: 12px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; direction: ${isHebrew ? 'rtl' : 'ltr'};
      min-width: 340px; max-width: 460px; animation: subsnapPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `

    hud.innerHTML = `
      <style>
        @keyframes subsnapPop { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      </style>
      <div style="width: 36px; height: 36px; border-radius: 10px; background: #eff6ff; border: 1.5px solid #bfdbfe; display: flex; align-items: center; justify-content: center; font-size: 18px;">
        🔑
      </div>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; gap: 6px;">
          <span>${isHebrew ? 'התחברות מהירה לחשבון' : 'Quick Account Login'}</span>
          <span style="font-size: 10px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 1px 6px; border-radius: 4px; font-weight: 800;">${isHebrew ? 'ממתין ⏳' : 'Waiting ⏳'}</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px; line-height: 1.35;">
          ${isHebrew ? 'התחבר בקליק (Google / סיסמה שמורה). SubSnap ימשיך אוטומטית לעמוד הביטול מיד בסיום!' : 'Sign in with Google or saved password. SubSnap will automatically leap to cancellation once connected!'}
        </div>
      </div>
      <button id="subsnap-login-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px 6px;">
        ✕
      </button>
    `

    document.body.appendChild(hud)
    hud.querySelector('#subsnap-login-close-btn').addEventListener('click', () => {
      hud.remove()
      hudInjected = false
    })
  }

  function injectDeadLinkRecoveryHUD(serviceName = '') {
    if (document.getElementById('subsnap-deadlink-hud')) return
    hudInjected = true

    const isHebrew = /[\u0590-\u05FF]/.test(document.title + ' ' + (document.body.innerText || '').slice(0, 500)) || (navigator.language && navigator.language.startsWith('he'))

    const hud = document.createElement('div')
    hud.id = 'subsnap-deadlink-hud'
    hud.style.cssText = `
      position: fixed; bottom: 24px; left: 24px; z-index: 2147483647;
      background: #ffffff; border: 2px solid #f59e0b;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 0 24px rgba(245, 158, 11, 0.25);
      border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; gap: 14px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; direction: ${isHebrew ? 'rtl' : 'ltr'};
      min-width: 360px; max-width: 500px; animation: subsnapPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `

    hud.innerHTML = `
      <style>
        @keyframes subsnapPop { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      </style>
      <div style="width: 38px; height: 38px; border-radius: 10px; background: #fef3c7; border: 1.5px solid #fde68a; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
        ⚠️
      </div>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 800; color: #92400e; display: flex; align-items: center; gap: 6px;">
          <span>${isHebrew ? 'נתיב הביטול אינו זמין (שגיאת 404)' : 'Cancellation Link Unavailable (404)'}</span>
          <span style="font-size: 10px; background: #fef3c7; color: #b45309; border: 1px solid #fde68a; padding: 1px 6px; border-radius: 4px; font-weight: 800;">${isHebrew ? 'ריפוי עצמי 🔄' : 'Self-Heal 🔄'}</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 3px; line-height: 1.4;">
          ${isHebrew ? 'העמוד הוסר או שכתובתו שונתה. SubSnap מחק את הקישור השגוי מהזיכרון.' : 'This page was moved or no longer exists. SubSnap purged the stale link from memory.'}
        </div>
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button id="subsnap-goto-home-btn" style="background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 800; cursor: pointer;">
            ${isHebrew ? 'עבור לדף הבית ➔' : 'Go to Homepage ➔'}
          </button>
          <button id="subsnap-google-search-btn" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
            ${isHebrew ? 'חפש ביטול בגוגל 🔍' : 'Search on Google 🔍'}
          </button>
        </div>
      </div>
      <button id="subsnap-deadlink-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px 6px; align-self: flex-start;">
        ✕
      </button>
    `

    document.body.appendChild(hud)

    hud.querySelector('#subsnap-goto-home-btn').addEventListener('click', () => {
      window.location.href = window.location.origin
    })

    hud.querySelector('#subsnap-google-search-btn').addEventListener('click', () => {
      const q = encodeURIComponent(`how to cancel ${serviceName || window.location.hostname} subscription`)
      window.location.href = `https://www.google.com/search?q=${q}`
    })

    hud.querySelector('#subsnap-deadlink-close-btn').addEventListener('click', () => {
      hud.remove()
      hudInjected = false
    })
  }

  function injectSearchResultActionHUD(serviceName, host, targetUrl) {
    if (document.getElementById('subsnap-search-hud')) return
    hudInjected = true

    const isHebrew = /[\u0590-\u05FF]/.test(document.title + ' ' + (document.body.innerText || '').slice(0, 500)) || (navigator.language && navigator.language.startsWith('he'))

    const hud = document.createElement('div')
    hud.id = 'subsnap-search-hud'
    hud.style.cssText = `
      position: fixed; bottom: 24px; left: 24px; z-index: 2147483647;
      background: #ffffff; border: 2px solid #10b981;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 0 24px rgba(16, 185, 129, 0.2);
      border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; gap: 14px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; direction: ${isHebrew ? 'rtl' : 'ltr'};
      min-width: 360px; max-width: 520px; animation: subsnapPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `

    hud.innerHTML = `
      <style>
        @keyframes subsnapPop { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      </style>
      <div style="width: 38px; height: 38px; border-radius: 10px; background: #ecfdf5; border: 1.5px solid #a7f3d0; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; color: #059669;">
        🎯
      </div>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 800; color: #065f46; display: flex; align-items: center; gap: 6px;">
          <span>${isHebrew ? `אותר נתיב ביטול עבור ${serviceName || host}` : `Cancellation Path Located: ${serviceName || host}`}</span>
          <span style="font-size: 10px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 4px; font-weight: 800;">Google ⚡</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 3px; line-height: 1.4;">
          ${isHebrew ? `סייר SubSnap זיהה את עמוד הביטול והתמיכה (${host}). לחץ למעבר ישיר והפעלת הטייס האוטומטי!` : `SubSnap extracted the cancellation portal (${host}). Click to leap straight to Auto-Pilot!`}
        </div>
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button id="subsnap-search-proceed-btn" style="background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 6px 14px; font-size: 11px; font-weight: 800; cursor: pointer;">
            ${isHebrew ? 'עבור ישירות לעמוד הביטול ➔' : 'Proceed to Cancellation ➔'}
          </button>
        </div>
      </div>
      <button id="subsnap-search-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px 6px; align-self: flex-start;">
        ✕
      </button>
    `

    document.body.appendChild(hud)

    hud.querySelector('#subsnap-search-proceed-btn').addEventListener('click', () => {
      // Save active intent for this target so Auto-Pilot immediately takes over upon landing
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          subsnap_active_intent: {
            name: serviceName || host,
            targetHost: host,
            cancelUrl: targetUrl,
            timestamp: Date.now()
          }
        }, () => {
          window.location.href = targetUrl
        })
      } else {
        window.location.href = targetUrl
      }
    })

    hud.querySelector('#subsnap-search-close-btn').addEventListener('click', () => {
      hud.remove()
      hudInjected = false
    })
  }

  function handleGoogleSearchCancellationExtractor() {
    const isGoogleSearch = window.location.hostname.includes('google.') && window.location.pathname.includes('/search')
    if (!isGoogleSearch) return false

    const urlParams = new URLSearchParams(window.location.search)
    const q = (urlParams.get('q') || '').toLowerCase()
    const isCancelQuery = /(cancel|ביטול|unsubscribe|how to cancel|איך לבטל|להפסיק מנוי)/i.test(q)
    if (!isCancelQuery) return false

    const cleanedQuery = q
      .replace(/how to cancel|how do i cancel|how can i cancel|cancel subscription|cancel|subscription|איך לבטל מנוי|איך לבטל|ביטול מנוי|ביטול|מנוי/gi, '')
      .trim()

    // Scan Google search results for authoritative cancellation / help / account links
    const resultLinks = Array.from(document.querySelectorAll('#search a[href^="http"], #rso a[href^="http"], div.g a[href^="http"]'))
      .filter(a => {
        const href = a.href || ''
        if (href.includes('google.com') || href.includes('youtube.com') || href.includes('webcache')) return false
        return true
      })

    let bestLink = null
    for (const a of resultLinks) {
      const href = (a.href || '').toLowerCase()
      const text = ((a.innerText || '') + ' ' + (a.title || '')).toLowerCase()

      if (
        (href.includes('help.') || href.includes('support.') || href.includes('/help') || href.includes('/support') || href.includes('account.') || href.includes('/billing') || href.includes('/subscription')) &&
        (text.includes('cancel') || text.includes('subscription') || text.includes('ביטול') || text.includes('מנוי') || href.includes('cancel'))
      ) {
        bestLink = a
        break
      }
    }

    if (!bestLink && resultLinks.length > 0) {
      bestLink = resultLinks[0]
    }

    if (bestLink) {
      const targetUrl = bestLink.href
      let displayHost = ''
      try {
        displayHost = new URL(targetUrl).hostname.replace(/^www\./, '')
      } catch (e) {
        displayHost = targetUrl
      }

      injectSearchResultActionHUD(
        cleanedQuery || displayHost,
        displayHost,
        targetUrl
      )
      return true
    }

    return false
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
        if (document.hidden) return // Pause countdown while tab is in background!

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

  function updateAIHUDUnresolved(hud, serviceName, host) {
    if (!hud) hud = document.getElementById('subsnap-ai-hud')
    if (!hud) return
    const isHebrew = /[\u0590-\u05FF]/.test(document.title + ' ' + (document.body.innerText || '').slice(0, 500)) || (navigator.language && navigator.language.startsWith('he'))

    hud.style.borderColor = '#f59e0b'
    hud.innerHTML = `
      <div style="width: 36px; height: 36px; border-radius: 10px; background: #fef3c7; border: 1.5px solid #fde68a; display: flex; align-items: center; justify-content: center; font-size: 18px;">
        💡
      </div>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 800; color: #92400e; display: flex; align-items: center; gap: 6px;">
          <span>${isHebrew ? 'לא אותר כפתור ביטול ישיר בעמוד זה' : 'No Direct Cancel Button On This Page'}</span>
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px; line-height: 1.35;">
          ${isHebrew ? 'סייר ה-AI סרק את האתר אך לא זיהה נתיב ביטול פעיל. מומלץ לבדוק במרכז העזרה או לעבור לדף הבית.' : 'AI Scout completed scanning. No active cancellation button found. Check help center or homepage.'}
        </div>
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button id="subsnap-ai-home-btn" style="background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
            ${isHebrew ? 'דף הבית ➔' : 'Homepage ➔'}
          </button>
          <button id="subsnap-ai-search-btn" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
            ${isHebrew ? 'חפש מדריך בגוגל 🔍' : 'Search Guide 🔍'}
          </button>
        </div>
      </div>
      <button id="subsnap-ai-unresolved-close" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px 6px; align-self: flex-start;">
        ✕
      </button>
    `
    hud.querySelector('#subsnap-ai-home-btn').addEventListener('click', () => {
      window.location.href = window.location.origin
    })
    hud.querySelector('#subsnap-ai-search-btn').addEventListener('click', () => {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent('how to cancel ' + (serviceName || host) + ' subscription')}`
    })
    hud.querySelector('#subsnap-ai-unresolved-close').addEventListener('click', () => {
      hud.remove()
      hudInjected = false
    })
  }

  function injectAutoPilotHUD(btn) {
    if (hudInjected || document.getElementById('subsnap-hud')) return
    hudInjected = true

    const isHebrew = /[\u0590-\u05FF]/.test(document.title + ' ' + (document.body.innerText || '').slice(0, 500)) || (navigator.language && navigator.language.startsWith('he'))

    btn.scrollIntoView({ behavior: 'smooth', block: 'center' })
    btn.style.outline = '3px solid #10b981'
    btn.style.outlineOffset = '3px'
    unlockDisabledAction(btn)

    const hud = document.createElement('div')
    hud.id = 'subsnap-hud'
    hud.style.cssText = `
      position: fixed; bottom: 24px; left: 24px; z-index: 2147483647;
      background: #ffffff; border: 1.5px solid #10b981;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 0 20px rgba(16, 185, 129, 0.15);
      border-radius: 16px; padding: 12px 16px; display: flex; align-items: center; gap: 12px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; direction: ${isHebrew ? 'rtl' : 'ltr'};
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
          <span>${isHebrew ? 'טייס אוטומטי של SubSnap' : 'SubSnap Auto-Pilot'}</span>
          <span id="subsnap-timer-badge" style="font-size: 10px; font-weight: 800; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 6px;">${isHebrew ? '5 שנ\'' : '5s'}</span>
        </div>
        <div id="subsnap-desc" style="font-size: 11px; color: #64748b; margin-top: 1px;">
          ${isHebrew ? 'נתיב הביטול אותר. מבטל בעוד 5 שניות...' : 'Subscription pathway located. Proceeding in 5s...'}
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; ${isHebrew ? 'margin-right: 8px;' : 'margin-left: 8px;'}">
        <button id="subsnap-action-btn" style="background: #0f172a; color: #ffffff; font-weight: 800; border: none; border-radius: 8px; padding: 6px 12px; font-size: 11px; cursor: pointer;">
          ${isHebrew ? 'בטל עכשיו ➔' : 'Proceed ➔'}
        </button>
        <button id="subsnap-stop-btn" style="background: #f1f5f9; color: #475569; font-weight: 700; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; font-size: 11px; cursor: pointer;">
          ${isHebrew ? 'עצור 🛑' : 'Stop'}
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
      autoPilotStepCount++
      descEl.textContent = isHebrew ? `מבצע שלב ${autoPilotStepCount}...` : `Executing Step ${autoPilotStepCount}...`
      timerBadge.textContent = isHebrew ? 'פעיל ⚡' : 'Active ⚡'
      forceClick(btn)

      // Multi-Step Funnel Continuity:
      // Allow DOM transitions and re-arm scan engine for subsequent steps (modals, surveys, confirmations)
      setTimeout(() => {
        if (isAlreadyCancelled()) {
          recordCancellationSuccess(window.location.hostname.replace(/^www\./, ''))
          hud.remove()
          hudInjected = false
          injectPeaceOfMindHUD(
            'המנוי בוטל בהצלחה! 🎉',
            'סייר SubSnap השלים את שלבי הביטול ואימת סיום חיוב פעיל.'
          )
          return
        }

        if (autoPilotStepCount >= 6) {
          descEl.textContent = isHebrew
            ? 'הטייס האוטומטי הגיע לשלב הסופי. אנא אשר את הביטול ידנית.'
            : 'Auto-Pilot reached step limit. Please confirm final step manually.'
          timerBadge.textContent = isHebrew ? 'ידני 🎯' : 'Manual 🎯'
          return
        }

        // Cleanly unblock for next step
        hud.remove()
        hudInjected = false
        startScanningEngine()
      }, 1200)
    }

    actionBtn.addEventListener('click', triggerCancel)
    stopBtn.addEventListener('click', () => {
      if (countdownTimer) clearInterval(countdownTimer)
      descEl.textContent = isHebrew ? 'הטייס האוטומטי נעצר.' : 'Auto-Pilot stopped.'
      timerBadge.textContent = isHebrew ? 'הופסק 🛑' : 'Halted 🛑'
      const cleanHost = window.location.hostname.toLowerCase().replace(/^www\./, '')
      sessionStorage.setItem('subsnap_halted_at_' + cleanHost, String(Date.now()))
      sessionStorage.removeItem('subsnap_halted_' + cleanHost)
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(['subsnap_active_intent'])
      }
      if (activeObserver) activeObserver.disconnect()
      if (activeScanInterval) clearInterval(activeScanInterval)
    })
    closeBtn.addEventListener('click', () => {
      if (countdownTimer) clearInterval(countdownTimer)
      hud.remove()
      hudInjected = false
      const cleanHost = window.location.hostname.toLowerCase().replace(/^www\./, '')
      sessionStorage.setItem('subsnap_halted_at_' + cleanHost, String(Date.now()))
      sessionStorage.removeItem('subsnap_halted_' + cleanHost)
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(['subsnap_active_intent'])
      }
      if (activeObserver) activeObserver.disconnect()
      if (activeScanInterval) clearInterval(activeScanInterval)
    })

    function startCountdown() {
      let secondsLeft = autoPilotStepCount > 0 ? 3 : 5
      if (autoPilotStepCount > 0) {
        descEl.textContent = isHebrew
          ? `שלב ${autoPilotStepCount + 1} אותר. ממשיך בעוד ${secondsLeft} שניות...`
          : `Step ${autoPilotStepCount + 1} located. Proceeding in ${secondsLeft}s...`
      }
      countdownTimer = setInterval(() => {
        if (document.hidden) return // Pause countdown while tab is in background!

        secondsLeft -= 1
        if (secondsLeft > 0) {
          timerBadge.textContent = isHebrew ? `${secondsLeft} שנ'` : `${secondsLeft}s`
          descEl.textContent = autoPilotStepCount > 0
            ? (isHebrew ? `שלב ${autoPilotStepCount + 1} אותר. ממשיך בעוד ${secondsLeft} שניות...` : `Step ${autoPilotStepCount + 1} located. Proceeding in ${secondsLeft}s...`)
            : (isHebrew ? `נתיב הביטול אותר. מבטל בעוד ${secondsLeft} שניות...` : `Subscription pathway located. Proceeding in ${secondsLeft}s...`)
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

    // Fix #3: Intelligent Prioritization with Shadow DOM support
    const allInteractive = queryDeep('button, a, div[role="button"], span[role="button"], input[type="submit"]')
      .filter(el => isVisible(el) && !isDisallowedElement(el))

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
      const existingHud = document.getElementById('subsnap-ai-hud')
      if (existingHud) {
        updateAIHUDUnresolved(existingHud, serviceName, cleanHost)
      } else {
        hudInjected = false
      }
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
      const existingHud = document.getElementById('subsnap-ai-hud')
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

      // Consume active intent so it never lingers or leaks
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(['subsnap_active_intent'])
      }

      // If valid target was resolved:
      if (targetEl) {
        if (existingHud) existingHud.remove()
        hudInjected = false

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
        if (existingHud) existingHud.remove()
        hudInjected = false
        injectPeaceOfMindHUD(
          'בשורות טובות: לא נמצא מנוי פעיל ✨',
          `סייר ה-AI סרק את אפשרויות העמוד עבור ${serviceName} ואימת שלא קיים מנוי בתשלום או כפתור ביטול פעיל.`
        )
        return
      }

      // Fallback: Never disappear into silence! Update HUD to unresolved guidance.
      updateAIHUDUnresolved(existingHud, serviceName, cleanHost)
    })
  }

  // --- Room 5: Trophy Room & Savings Engine ---
  function recordCancellationSuccess(serviceName = '') {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['subsnap_savings_stats'], (res) => {
          const stats = res && res.subsnap_savings_stats ? res.subsnap_savings_stats : {
            cancelledCount: 0,
            totalSavedIls: 0,
            services: []
          }

          const sName = serviceName || window.location.hostname.replace(/^www\./, '')
          const now = Date.now()
          const alreadyRecorded = stats.services && stats.services.some(s => s.name === sName && (now - s.timestamp < 86400000))
          if (!alreadyRecorded) {
            const estimatedMonthlySavings = 80 // Estimated average monthly SaaS savings in ILS (~$22)
            stats.cancelledCount = (stats.cancelledCount || 0) + 1
            stats.totalSavedIls = (stats.totalSavedIls || 0) + estimatedMonthlySavings
            if (!Array.isArray(stats.services)) stats.services = []
            stats.services.push({
              name: sName,
              timestamp: now,
              saved: estimatedMonthlySavings
            })
            chrome.storage.local.set({ subsnap_savings_stats: stats })
          }
        })
      }
    } catch (e) {}
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
      const isNavigatedToCancelPage = (window.location.href !== pending.urlBefore) && (findCancelButton() !== null)

      if (isCancelled || isNavigatedToCancelPage) {
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

  function checkActiveIntent(cleanHost) {
    return new Promise((resolve) => {
      // Clean legacy keys
      sessionStorage.removeItem('subsnap_halted_' + cleanHost)

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['subsnap_active_intent'], (res) => {
          const intent = res ? res.subsnap_active_intent : null
          if (!intent) return resolve(null)

          // 10 minutes session window
          if (Date.now() - intent.timestamp >= 600000) {
            return resolve(null)
          }

          if (!isHostMatch(intent.targetHost, cleanHost)) {
            return resolve(null)
          }

          // Check if this tab was explicitly stopped/halted AFTER this intent was launched
          const haltedAt = parseInt(sessionStorage.getItem('subsnap_halted_at_' + cleanHost) || '0', 10)
          if (haltedAt > intent.timestamp) {
            return resolve(null)
          }

          resolve(intent)
        })
      } else {
        resolve(null)
      }
    })
  }

  async function performScan() {
    const cleanHost = window.location.hostname.toLowerCase().replace(/^www\./, '')

    // 0. Search Engine Extraction: Automatically sniff cancellation guide links from Google Search
    if (handleGoogleSearchCancellationExtractor()) {
      return true
    }

    // Check if a previous candidate click achieved verified success
    verifyAndCommitPendingHeal()

    if (hudInjected) return false

    // Check if user initiated active intent
    const activeIntent = await checkActiveIntent(cleanHost)
    if (!activeIntent) {
      return false
    }

    const targetName = activeIntent.name || ''

    // 0. THE INVISIBLE LOGIN BRIDGE: Check if returning from a successful login
    const wasWaitingLogin = sessionStorage.getItem('subsnap_waiting_login') === 'true'
    if (wasWaitingLogin && !isLoginPage() && activeIntent && activeIntent.cancelUrl) {
      sessionStorage.removeItem('subsnap_waiting_login')
      const currentNorm = window.location.href.split('?')[0].split('#')[0].replace(/\/$/, '')
      const cancelNorm = activeIntent.cancelUrl.split('?')[0].split('#')[0].replace(/\/$/, '')

      if (currentNorm !== cancelNorm && !window.location.pathname.includes('/subscriptions') && !window.location.pathname.includes('/account')) {
        const isHebrew = /[\u0590-\u05FF]/.test(document.title + ' ' + (document.body.innerText || '').slice(0, 500)) || (navigator.language && navigator.language.startsWith('he'))
        injectPeaceOfMindHUD(
          isHebrew ? 'התחברת בהצלחה! ⚡' : 'Logged In Successfully! ⚡',
          isHebrew ? 'טייס SubSnap מקפיץ אותך מיד לעמוד ביטול המנוי...' : 'SubSnap Auto-Pilot is leaping directly to the cancellation pathway...'
        )
        setTimeout(() => {
          window.location.href = activeIntent.cancelUrl
        }, 800)
        return true
      }
    }

    // 1. LOGIN WALL DETECTED: Don't search for cancel buttons or waste AI on login forms!
    if (isLoginPage()) {
      sessionStorage.setItem('subsnap_waiting_login', 'true')
      injectLoginBridgeHUD(targetName)
      return true
    }

    // Tier 1.1: Check if already cancelled
    if (isAlreadyCancelled()) {
      recordCancellationSuccess(targetName || window.location.hostname.replace(/^www\./, ''))
      sessionStorage.setItem('subsnap_halted_at_' + cleanHost, String(Date.now()))
      sessionStorage.removeItem('subsnap_halted_' + cleanHost)
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(['subsnap_active_intent'])
      }
      if (activeObserver) activeObserver.disconnect()
      if (activeScanInterval) clearInterval(activeScanInterval)

      injectPeaceOfMindHUD(
        'המנוי כבר בוטל בהצלחה! 🎉',
        'סייר SubSnap זיהה שהמינוי כבר מבוטל. לא יבוצע חיוב נוסף.'
      )
      return true
    }

    // Tier 1.2: Check if cancel button is present on screen (Local or Redis Playbook)
    const btn = findCancelButton(targetName)
    if (btn && !hudInjected) {
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
      } else {
        // ALWAYS inject Dead Link Recovery HUD when no recovery element exists!
        // Never stay silent on a 404 page!
        injectDeadLinkRecoveryHUD(targetName || cleanHost)
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

        const isSearchEngine = (cleanHost === 'google.com' || cleanHost.endsWith('.google.com') || cleanHost.includes('bing.com') || cleanHost.includes('duckduckgo.com'))
        // TIER 3 ESCALATION: Strict Host Matching - ONLY if Tier 1 & Tier 2 failed on the EXACT intended service domain (and not on login, 404, or search engines!)
        if (!found && !hudInjected && !isLoginPage() && !isDeadOr404Page() && !isSearchEngine && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['subsnap_active_intent'], (res) => {
            const intent = res ? res.subsnap_active_intent : null
            const cleanHost = window.location.hostname.toLowerCase().replace(/^www\./, '')
            if (intent && isHostMatch(intent.targetHost, cleanHost) && (Date.now() - intent.timestamp < 180000)) {
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
