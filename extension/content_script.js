/**
 * SubSnap 3-Tier Escalation & Self-Learning Architecture (v1.1.0)
 * Tier 1: Local Deterministic (0ms, $0)
 * Tier 2: Global Distributed Cache (Redis)
 * Tier 3: AI Emergency Escalation with Prioritized Scanning, Pinned DOM References,
 *         Syntax-Safe Selector Resolution, and Two-Phase Outcome Verification.
 */

(function () {
  if (window.__subsnap_loaded) return

  const curHost = window.location.hostname.toLowerCase().replace(/^www\./, '')
  const isOAuthPopup = curHost.startsWith('accounts.google.') || curHost.startsWith('appleid.apple.') || curHost.includes('login.microsoftonline.')
  if (isOAuthPopup) {
    // Surgical Tweezers Guard: Never interfere with third-party OAuth popup windows (Google/Apple/Microsoft Sign-In)
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['subsnap_active_intent'], (res) => {
          const intent = res ? res.subsnap_active_intent : null
          const target = (intent && intent.targetHost) ? intent.targetHost.toLowerCase() : ''
          if (target && (target.includes('google') || target.includes('apple') || target.includes('microsoft'))) {
            startScanningEngine()
          }
        })
      }
    } catch (e) {}
    return
  }

  window.__subsnap_loaded = true
  console.log('[SubSnap] Content script initialized on:', window.location.href)

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

    const isXOrTwitter = (h) => h === 'x.com' || h.endsWith('.x.com') || h === 'twitter.com' || h.endsWith('.twitter.com')
    if (isXOrTwitter(t) && isXOrTwitter(c)) return true

    return false
  }

  // Escapes text before it's interpolated into an innerHTML template, so HUD copy sourced
  // from user input or an AI response (guidanceHe, planName, service names, etc.) can never
  // be parsed as markup on the page the extension is running on.
  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  }

  // sessionStorage throws SecurityError in some browser privacy-mode configurations —
  // these mirror the defensive style already used for every chrome.storage call in this file.
  function safeSessionGet(key) {
    try { return sessionStorage.getItem(key) } catch (e) { return null }
  }
  function safeSessionSet(key, value) {
    try { sessionStorage.setItem(key, value) } catch (e) {}
  }
  function safeSessionRemove(key) {
    try { sessionStorage.removeItem(key) } catch (e) {}
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
      const opts = { bubbles: true, cancelable: true, view: window }
      if (typeof PointerEvent !== 'undefined') {
        el.dispatchEvent(new PointerEvent('pointerdown', opts))
        el.dispatchEvent(new PointerEvent('pointerup', opts))
      }
      el.dispatchEvent(new MouseEvent('mousedown', opts))
      el.dispatchEvent(new MouseEvent('mouseup', opts))
      el.click()

      const parentForm = el.closest('form')
      if (parentForm && (el.type === 'submit' || el.getAttribute('type') === 'submit')) {
        try {
          if (typeof parentForm.requestSubmit === 'function') parentForm.requestSubmit(el)
        } catch (e) {}
      }
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
      bodyText.includes("even ai can't find this page") ||
      bodyText.includes("even ai can’t find this page") ||
      bodyText.includes("took a wrong turn") ||
      bodyText.includes("lost in space") ||
      bodyText.includes("looks like you're lost") ||
      bodyText.includes("looks like you’re lost") ||
      bodyText.includes("whoops, looks like") ||
      bodyText.includes("nothing to see here") ||
      bodyText.includes("העמוד אינו קיים") ||
      bodyText.includes("דף זה אינו קיים")
    )

    if (isDead && !staleEvicted) {
      staleEvicted = true
      const cleanHost = window.location.hostname.toLowerCase().replace(/^www\./, '')
      try {
        if (chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: 'evictStalePlaybook', hostname: cleanHost })
        }
      } catch (e) {}
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
    const search = window.location.search.toLowerCase()

    // 1. Direct URL Path or Subdomain check (Universal Gateway)
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
    if (isLoginPath) return true

    // 1.1 Auth redirect query parameter (e.g. ?redirect=/settings, ?next=, ?return_to=)
    const hasAuthRedirectParam = (
      search.includes('redirect=') ||
      search.includes('return_to=') ||
      search.includes('next=') ||
      search.includes('callbackurl=')
    )
    const pageText = (document.body.innerText || '').slice(0, 1500).toLowerCase()
    const hasAccountChooserText = /jump back in|welcome back|choose an account|בחר חשבון|התחבר|כניסה|continue with another account|sign in to|log in to/i.test(pageText)
    if (hasAuthRedirectParam && hasAccountChooserText) return true

    // 2. DOM Password / Credential / SSO / Login Form check
    const hasPasswordField = !!document.querySelector('input[type="password"]')
    if (hasPasswordField && !pathname.includes('/account') && !pathname.includes('/security')) {
      return true
    }

    const hasLoginForm = !!document.querySelector('form[action*="login"], form[action*="signin"], form[data-testid*="login"]')
    if (hasLoginForm) return true

    const hasSignInHeading = /התחברות|התחבר לחשבון|כניסה לחשבון|sign in|log in|login|welcome back|jump back in/i.test(document.title + ' ' + (document.querySelector('h1, h2')?.innerText || ''))
    const hasSSOButton = !!document.querySelector('button[data-provider="google"], button[data-testid*="google"], a[href*="accounts.google.com"], [aria-label*="Google" i][role="button"]')
    if (hasSignInHeading && (hasSSOButton || hasAccountChooserText)) {
      return true
    }

    return false
  }

  function findPrimaryLoginButton() {
    const candidates = queryDeep('button, a, input[type="submit"], div[role="button"]')
      .filter(el => isVisible(el) && !isDisallowedElement(el))

    for (const el of candidates) {
      const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()
      if (/^(continue|sign in|log in|login|next|המשך|התחבר|כניסה|הבא)$/i.test(text)) {
        return el
      }
      if (/(continue as|sign in with|log in with|התחבר באמצעות|המשך כ)/i.test(text)) {
        return el
      }
    }
    return null
  }

  function isLoggedOutState() {
    const pathname = window.location.pathname.toLowerCase()

    // 1. Direct login page check takes absolute precedence!
    if (isLoginPage()) return true

    // 2. Check if user is on a logged-out guest SPA (like ChatGPT with Log in button & Welcome back modal)
    const hasLogOutPrompt = /(welcome back|stay logged out|sign up for free|התחברות לחשבון)/i.test(document.body.innerText || '')
    const hasLoginButton = Array.from(document.querySelectorAll('a, button')).some(el => {
      if (!isVisible(el)) return false
      const text = (el.innerText || el.textContent || '').toLowerCase().trim()
      const href = (el.getAttribute('href') || '').toLowerCase()
      return (
        text === 'log in' || text === 'sign in' || text === 'signin' || text === 'login' ||
        text === 'התחברות' || text === 'התחבר' || text === 'כניסה' ||
        href.includes('/login') || href.includes('/signin')
      )
    })

    const hasUserProfile = !!document.querySelector(
      '[data-testid*="avatar"], [data-testid*="user-menu"], [data-testid*="profile"], ' +
      'button[aria-label*="Profile" i], button[aria-label*="Account" i], ' +
      '[class*="avatar"], [class*="user-profile"], [class*="user-menu"]'
    )

    if (hasLoginButton && !hasUserProfile) {
      return true
    }

    if (hasLogOutPrompt && hasLoginButton) {
      return true
    }

    // 3. Active application URLs with active user session are logged in!
    if (
      pathname.startsWith('/app') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/console') ||
      pathname.startsWith('/workspace') ||
      pathname.startsWith('/project') ||
      pathname.startsWith('/billing')
    ) {
      return false
    }

    // 4. If page displays free plan or cancelled state, user is authenticated
    if (isNoActiveSubscriptionState() || isAlreadyCancelled()) {
      return false
    }

    return false
  }

  function isAlreadyCancelled() {
    const dialog = getActiveDialogScope()
    const scopeText = (dialog !== document ? dialog.innerText : document.body.innerText || '').toLowerCase()
    const fullText = (document.body.innerText || '').toLowerCase()

    const hasCancelledHeader = (
      /\bבוטל\b|מבוטל|המינוי בוטל|המינוי שלכם בוטל|המינוי שלך בוטל|בוטל ב-|בוטל בתאריך|להרשמה מחדש|שחזור מנוי|חידוש מנוי|המינוי שלך יסתיים בתאריך|המינוי יסתיים ב-|הגישה מסתיימת בתאריך|הגישה תסתיים ב-|הגישה מסתיימת ב-|הישארו בתוכנית|הישאר בתוכנית|הישארו במנוי|להישאר בתוכנית|פג תוקף|חיוב חוזר: לא פעיל|חיוב חוזר מבוטל|subscription cancelled|subscription canceled|plan canceled|plan cancelled|membership cancelled|your subscription has been cancelled|your plan has been cancelled|access ends on|access will end on|your access ends|plan ends on|plan will end on|subscription ends on|keep your plan|re-subscribe|resubscribe|recurring:\s*inactive|recurring inactive|renewal:\s*inactive|auto-renew.*off|auto-renewal.*disabled|expires on:/i.test(scopeText) ||
      /\bהמינוי שלכם בוטל\b|\bהמינוי שלך בוטל\b|\bהמינוי בוטל\b|\bהגישה מסתיימת בתאריך\b|\bהישארו בתוכנית\b|\byour subscription has been cancelled\b|\baccess ends on\b|recurring:\s*inactive|expires on:/i.test(fullText)
    )

    // Intermediate warning/confirmation phrases (if these are present, cancellation is not finished yet)
    const isAskingConfirmation = /האם לבטל|בטוח שברצונך לבטל|are you sure you want to cancel|מה סיבת הביטול|למה אתה רוצה לבטל|למה לבטל|reason.*cancel/i.test(scopeText)

    if (hasCancelledHeader && !isAskingConfirmation) {
      return true
    }

    // If an intermediate dialog is open and it's NOT a completed cancellation modal, user is still in funnel
    if (dialog !== document) {
      return false
    }

    return false
  }

  function isNoActiveSubscriptionState() {
    const finContext = extractPageFinancialContext()
    // STRICT ANTI-FREE SHIELD: If paid indicators (amount or recurring active) exist, NEVER declare free tier!
    if (finContext.hasAmount || finContext.hasRecurringActive) {
      return false
    }

    // 0. Only an ACTIVE cancellation modal or survey blocks free-plan detection (feature tooltips do NOT block!)
    const activeSurvey = document.querySelector('[role="dialog"], dialog, div[aria-modal="true"]')
    if (activeSurvey) {
      const sText = (activeSurvey.innerText || '').toLowerCase()
      if (/למה.*לבטל|בטוח שברצונך לבטל|reason.*cancel|sure you want to cancel|keep my plan|stay on pro|keep pro/i.test(sText)) {
        return false
      }
    }

    const bodyText = (document.body.innerText || '').toLowerCase()

    // 0.1 If the page is in an active cancellation flow or survey, abort free-plan check
    if (/למה.*לבטל|בטוח שברצונך לבטל|תקופת הניסיון|להמשיך בביטול|בטל מינוי|בטל מנוי/i.test(bodyText)) {
      return false
    }

    // 0.2 Universal Modern SaaS "Current Plan: Free" card / badge detector (Grammarly, Notion, Figma, Canva, etc.)
    const hasCurrentPlanBadge = Array.from(document.querySelectorAll('button, div, span, p, a, [role="button"]')).some(el => {
      const t = (el.innerText || '').trim().toLowerCase()
      if (t === 'current plan' || t === 'תוכנית נוכחית' || t === 'your plan' || t === 'active plan' || t === 'תוכנית נוכחית: חינם') {
        const parentBox = el.closest('div, section, article, td, li') || el.parentElement
        const boxText = parentBox ? (parentBox.innerText || '').toLowerCase() : ''
        return boxText.includes('free') || boxText.includes('חינם') || boxText.includes('basic') || boxText.includes('בסיסי')
      }
      return false
    })
    if (hasCurrentPlanBadge) {
      return true
    }

    // 0.3 Regex check for Free Plan container with current plan
    if (/free[\s\S]{0,120}current plan/i.test(bodyText) || /current plan[\s\S]{0,120}free/i.test(bodyText)) {
      return true
    }

    const isXHost = window.location.hostname.includes('x.com') || window.location.hostname.includes('twitter.com')
    const hasXSignUpLink = !!document.querySelector('a[href*="premium_sign_up"], [data-testid*="premium_sign_up"]')
    const hasXIneligible = isXHost && (
      /subscriptions[\s\S]{0,100}ineligible/i.test(bodyText) ||
      /creator studio/i.test(bodyText) ||
      window.location.pathname.includes('/creators/studio') ||
      window.location.pathname.includes('/creators') ||
      bodyText.includes('ineligible')
    )
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
      'join premium',
      'get premium',
      'try premium',
      'upgrade to pro',
      'upgrade to premium',
      'upgrade to plus',
      'upgrade to supergrok',
      'upgrade to max',
      'upgrade to ultra',
      'upgrade now',
      'upgrade plan',
      '30-day free trial',
      '14-day free trial',
      '7-day free trial',
      'start free trial',
      'start trial',
      'free trial',
      'switch to premium',
      'supergrok',
      'included with supergrok',
      'unlock extended capabilities',
      'declaration of subscriber\'s status',
      'non-professional (private) subscriber',
      'professional (commercial) subscriber',
      'choose your plan',
      'compare plans',
      'pick a plan',
      'select a plan',
      'view plans',
      'try plus',
      'try pro',
      'try supergrok',
      'try advanced',
      'get plus',
      'get pro',
      'get supergrok',
      'get advanced',
      // Hebrew Free Tier Indicators
      'שדרג עכשיו',
      'תקופת ניסיון חינם',
      'ניסיון חינם',
      'התחל תקופת ניסיון',
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
    'השהיית מנוי',
    // Keep subscription traps (e.g. "השאירו את Canva Pro", "Keep Canva Pro")
    'השאירו את',
    'השאירו',
    'הישאר במנוי',
    'להישאר במנוי',
    'הישאר בתוכנית',
    'שמור על המנוי',
    'keep my subscription',
    'keep subscription',
    'keep plan',
    'keep pro',
    'keep my plan',
    // Irrelevant management & tutorial traps (e.g. "Manage projects in Asana", "How to create a project")
    'manage project',
    'manage projects',
    'manage task',
    'manage tasks',
    'manage team',
    'manage file',
    'manage files',
    'manage cookies',
    'manage tags',
    'ניהול פרויקט',
    'ניהול פרויקטים',
    'ניהול משימות',
    'ניהול עובדים',
    'ניהול קבצים',
    'ניהול צוות',
    'how to create',
    'video tutorial',
    'video tutorials',
    'tutorial',
    'tutorials',
    'מדריך וידאו'
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
  try {
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'fetchPlaybook', hostname }, (res) => {
        if (res && res.success && res.data && Array.isArray(res.data.selectors)) {
          ACTIVE_SELECTORS = [...res.data.selectors, ...ACTIVE_SELECTORS]
        }
      })
    }
  } catch (e) {}

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
    'להמשיך בביטול',
    'המשך בביטול',
    'המשך לביטול',
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

  function dismissPromotionalPopups() {
    const modals = Array.from(document.querySelectorAll('dialog[open], [role="dialog"], [aria-modal="true"], div[class*="modal"], div[class*="popup"], div[class*="banner"]'))
      .filter(el => isVisible(el) && (el.innerText || '').trim().length > 10)

    for (const modal of modals) {
      const text = (modal.innerText || modal.textContent || '').toLowerCase()
      const isPromo = (
        /hackathon|register now|webinar|newsletter|join our community|subscribe to our|cookie consent|accept all cookies|סגור פרסומת|הירשם לניוזלטר/i.test(text) &&
        !/cancel|subscription|billing|מנוי|ביטול|חיוב|keep plan|sure you want to/i.test(text)
      )

      if (isPromo) {
        let closeBtn = null
        try {
          closeBtn = modal.querySelector(
            'button[aria-label*="close" i], button[aria-label*="dismiss" i], button[title*="close" i], ' +
            '[class*="close-button" i], [class*="modal-close" i], [data-testid*="close" i], ' +
            'button svg, div[role="button"]:has(svg), button'
          )
        } catch (e) {}
        if (closeBtn && isVisible(closeBtn)) {
          console.log('[SubSnap] Auto-dismissing promotional pop-up to clear screen...')
          forceClick(closeBtn)
          return true
        }
      }
    }
    return false
  }

  function resolveSurveyStep(scopeRoot) {
    if (!scopeRoot || scopeRoot === document) return null
    const text = (scopeRoot.innerText || scopeRoot.textContent || '').toLowerCase()
    const isSurvey = /(סיבת הביטול|למה.*לבטל|מדוע.*לבטל|ספר לנו למה|reason.*cancel|why.*leaving|why.*cancel|tell us why|help us improve)/i.test(text)
    if (!isSurvey) return null

    // Helper to get text associated with a radio button (including parent or associated label)
    const getRadioText = (el) => {
      const label = el.closest('label') || el.parentElement || (el.id ? document.querySelector(`label[for="${el.id}"]`) : null)
      return ((label ? label.innerText : '') + ' ' + (el.innerText || el.textContent || '')).toLowerCase()
    }

    // 1. Find and select neutral radio option to unblock Next/Continue button
    const radios = Array.from(scopeRoot.querySelectorAll('input[type="radio"], [role="radio"], label, [data-value]'))
      .filter(r => isVisible(r))

    if (radios.length > 0) {
      const isAlreadyChecked = radios.some(r => r.checked || r.getAttribute('aria-checked') === 'true')
      if (!isAlreadyChecked) {
        let preferred = radios.find(r => {
          const rText = getRadioText(r)
          return /(אחר|other|לא רוצה להשיב|המחיר גבוה|יקר|decline|expensive|not.*use|מספיק)/i.test(rText)
        })
        if (!preferred) preferred = radios[radios.length - 1] // Often "Other" is at the bottom
        if (preferred) {
          if (preferred.tagName === 'INPUT' && preferred.type === 'radio') {
            preferred.checked = true
            preferred.dispatchEvent(new Event('change', { bubbles: true }))
            preferred.dispatchEvent(new Event('input', { bubbles: true }))
          }
          const clickTarget = preferred.closest('label') || preferred
          forceClick(clickTarget)
        }
      }
    }

    // 2. Open feedback textarea / text input - autofill neutral reason to unblock form validation
    const inputs = Array.from(scopeRoot.querySelectorAll('textarea, input[type="text"]')).filter(i => isVisible(i))
    for (const input of inputs) {
      if (!input.value || input.value.trim().length === 0) {
        const isHebrew = /[\u0590-\u05FF]/.test(document.title + ' ' + (document.body.innerText || '').slice(0, 500))
        const val = isHebrew ? 'יקר מדי / סיבות תקציב' : 'Too expensive / Budget reasons'
        input.focus()
        input.value = val
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    // 3. Locate forward progress button (Continue / Next OR direct Cancel / בטל מינוי!)
    const actionCandidates = queryDeep('button, a, div[role="button"], span[role="button"], [tabindex="0"]', scopeRoot)
    for (const btn of actionCandidates) {
      if (!isVisible(btn) || isDisallowedElement(btn)) continue
      const btnText = (btn.innerText || btn.textContent || btn.value || '').toLowerCase().trim()
      if (/(השאירו|הישאר|keep|stay)/i.test(btnText)) continue

      if (/(המשך|continue|next|proceed|advance|להמשיך בביטול|המשך בביטול|בטל מינוי|בטל מנוי|cancel subscription|cancel plan)/i.test(btnText)) {
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

        // Manage button inside the target card - MUST BE STRICTLY SUBSCRIPTION RELATED!
        const manageBtns = queryDeep('button, a, div[role="button"], span[role="button"], [jsaction*="click"], [tabindex="0"]', card)
        for (const el of manageBtns) {
          if (!isVisible(el) || isDisallowedElement(el)) continue
          const text = (el.innerText || el.textContent || el.value || '').toLowerCase().trim()
          const isStrictSubscriptionManage = (
            text === 'ניהול המינוי' || text === 'ניהול מנוי' || text === 'ניהול תוכנית' || text === 'ניהול חבילה' ||
            text === 'manage subscription' || text === 'manage plan' || text === 'manage membership' || text === 'manage billing' ||
            ((text === 'ניהול' || text === 'manage') && /(מינוי|מנוי|subscription|membership|plan|billing|חיוב)/i.test(card.innerText || ''))
          )
          if (isStrictSubscriptionManage) {
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

  function isNavigationDisallowed(el) {
    if (!el) return true
    const text = (el.innerText || el.textContent || el.value || '').toLowerCase()
    const href = (el.getAttribute('href') || '').toLowerCase()
    const aria = (el.getAttribute('aria-label') || '').toLowerCase()
    const id = (el.id || '').toLowerCase()
    const cls = (el.className || '').toString().toLowerCase()
    const combined = `${text} ${href} ${aria} ${id} ${cls}`

    // 1. NEVER click Login, Sign In, SSO, Auth, or Signup buttons as in-app navigation!
    if (/sign in|log in|signin|login|auth|sso|google|apple|github|התחבר|כניסה לחשבון|הרשמה|sign up|signup/i.test(combined)) {
      return true
    }

    // 2. NEVER click external Help Center, Docs, or Support links as in-app navigation!
    if (/help\.|support\.|zendesk|intercom|\/help|\/support|\/faq|\/docs|מרכז תמיכה|עזרה|מדריך/i.test(combined)) {
      return true
    }

    // 3. Disallow destructors and pause traps
    return isDisallowedElement(el)
  }

  function findNavigationRecoveryElement() {
    const currentHref = window.location.href.toLowerCase()
    const currentPath = window.location.pathname.toLowerCase()

    // Helper to check if a link points to the CURRENT broken/404 URL
    const isCurrentBrokenLink = (el) => {
      const href = (el.getAttribute('href') || '').toLowerCase()
      if (!href) return false
      return currentHref.endsWith(href) || currentPath === href || href === window.location.pathname
    }

    // 1. Direct billing/subscription/manage links (Prioritize over generic settings!)
    const billingCandidates = Array.from(document.querySelectorAll(
      'a[href*="subscription"], a[href*="manage_subscription"], a[href*="billing"], ' +
      'a[href*="monetization"], [data-testid*="subscription"], [data-testid*="billing"]'
    )).filter(el => isVisible(el) && !isNavigationDisallowed(el) && !isCurrentBrokenLink(el))

    if (billingCandidates.length > 0) {
      return billingCandidates[0]
    }

    // 2. High-priority text scanning for navigation anchors (Premium, Subscriptions, Billing, Monetization)
    const elements = Array.from(document.querySelectorAll('a, div[role="link"], div[role="button"], button, [tabindex="0"], span'))
    for (const el of elements) {
      if (!isVisible(el) || isNavigationDisallowed(el) || isCurrentBrokenLink(el)) continue
      const text = (el.innerText || el.textContent || '').toLowerCase().trim()

      if (
        text === 'premium' ||
        text === 'פרימיום' ||
        text === 'billing' ||
        text === 'חיוב' ||
        text === 'subscription' ||
        text === 'subscriptions' ||
        text === 'subscription info' ||
        text === 'subscription-info' ||
        text === 'subscription information' ||
        text === 'פרטי מנוי' ||
        text === 'פרטי המנוי' ||
        text === 'פרטי החשבון' ||
        text === 'manage subscriptions' ||
        text === 'manage subscription' ||
        text === 'manage plan' ||
        text === 'monetization' ||
        text === 'creator subscriptions' ||
        text === 'admin console' ||
        text === 'admin' ||
        text === 'ניהול מערכת' ||
        text === 'לוח בקרה'
      ) {
        return el.closest('a, div[role="link"], div[role="button"], button, [tabindex="0"]') || el
      }
    }

    // 3. User Avatar / Profile Menu triggers
    const avatarCandidates = Array.from(document.querySelectorAll(
      '[data-testid*="avatar"], [data-testid*="user-menu"], [data-testid*="profile"], ' +
      'button[aria-label*="Profile" i], button[aria-label*="User" i], button[aria-label*="Account" i], ' +
      'div[aria-label*="Profile" i], div[aria-label*="Account" i], ' +
      '[class*="avatar"], [class*="user-profile"], [class*="profile-button"]'
    )).filter(el => isVisible(el) && !isNavigationDisallowed(el) && !isCurrentBrokenLink(el))

    if (avatarCandidates.length > 0) {
      return avatarCandidates[0]
    }

    // 4. Account & Settings navigation fallback
    const settingsCandidates = Array.from(document.querySelectorAll(
      'a[href*="settings"], a[href*="account"], [data-testid*="settings"], [data-testid*="account"], ' +
      '[aria-label*="Settings" i], [aria-label*="Account" i], [aria-label*="הגדרות"], [aria-label*="חשבון"]'
    )).filter(el => isVisible(el) && !isNavigationDisallowed(el) && !isCurrentBrokenLink(el))

    if (settingsCandidates.length > 0) {
      return settingsCandidates[0]
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
          <span>${escapeHtml(title)}</span>
          <span style="font-size: 10px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 4px; font-weight: 800;">בטוח ✓</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px; line-height: 1.35;">${escapeHtml(desc)}</div>
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

    // Universal Login Target Recognition: Account chooser / Continue / Google SSO button
    let loginBtn = null
    try {
      loginBtn = findPrimaryLoginButton() || document.querySelector('button[data-provider="google"], div[data-provider="google"], a[href*="google"], [aria-label*="Google"], [data-testid*="google"], button[data-provider="apple"], [aria-label*="Apple"]')
      if (loginBtn && isVisible(loginBtn)) {
        loginBtn.style.outline = '3px solid #3b82f6'
        loginBtn.style.outlineOffset = '3px'
      }
    } catch (e) {}

    const sName = serviceName || window.location.hostname.replace(/^www\./, '')
    const hud = document.createElement('div')
    hud.id = 'subsnap-login-hud'
    hud.style.cssText = `
      position: fixed; bottom: 24px; left: 24px; z-index: 2147483647;
      background: #ffffff; border: 2px solid #3b82f6;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 0 24px rgba(59, 130, 246, 0.2);
      border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; gap: 12px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; direction: ${isHebrew ? 'rtl' : 'ltr'};
      min-width: 340px; max-width: 480px; animation: subsnapPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `

    hud.innerHTML = `
      <style>
        @keyframes subsnapPop { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      </style>
      <div style="width: 38px; height: 38px; border-radius: 10px; background: #eff6ff; border: 1.5px solid #bfdbfe; display: flex; align-items: center; justify-content: center; font-size: 18px;">
        🔑
      </div>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; gap: 6px;">
          <span>${isHebrew ? `התחברות לחשבון (${escapeHtml(sName)})` : `Sign in to ${escapeHtml(sName)}`}</span>
          <span style="font-size: 10px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 1px 6px; border-radius: 4px; font-weight: 800;">${isHebrew ? 'ממתין ⏳' : 'Waiting ⏳'}</span>
        </div>
        <div id="subsnap-login-subtext" style="font-size: 11px; color: #475569; margin-top: 2px; line-height: 1.35;">
          ${isHebrew ? 'התחבר לחשבונך. SubSnap יקפיץ אותך מיד לעמוד הביטול בסיום!' : 'Sign in to your account. SubSnap will leap directly to cancellation upon login!'}
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        ${loginBtn ? `
          <button id="subsnap-login-action-btn" style="background: #2563eb; color: #ffffff; border: none; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 800; cursor: pointer; white-space: nowrap;">
            ${isHebrew ? 'התחבר ➔' : 'Sign In ➔'}
          </button>
        ` : ''}
        <button id="subsnap-login-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px 6px;">
          ✕
        </button>
      </div>
    `

    document.body.appendChild(hud)

    const actionBtn = hud.querySelector('#subsnap-login-action-btn')
    if (actionBtn && loginBtn) {
      actionBtn.addEventListener('click', () => {
        // Surgical Tweezers: Check if credentials fields are present and empty
        const emptyInput = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input:not([type])'))
          .find(inp => isVisible(inp) && !inp.disabled && !inp.readOnly && !inp.value.trim())

        if (emptyInput) {
          emptyInput.focus()
          emptyInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
          emptyInput.style.transition = 'all 0.3s ease'
          emptyInput.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.45)'
          emptyInput.style.borderColor = '#2563eb'

          const subtext = hud.querySelector('#subsnap-login-subtext')
          if (subtext) {
            subtext.textContent = isHebrew
              ? 'הזן את פרטי הכניסה (או בחר Google/Facebook). מיד עם ההתחברות נקפיץ אותך לביטול!'
              : 'Enter your credentials (or choose Google/Facebook). SubSnap will leap upon login!'
            subtext.style.color = '#2563eb'
            subtext.style.fontWeight = '700'
          }
          return
        }

        // When credentials exist, execute click!
        safeSessionSet('subsnap_waiting_login', 'true')
        if (chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ subsnap_waiting_login: cleanHost })
        }
        forceClick(loginBtn)
      })
    }

    // Attach listeners to any user login actions on page to ensure state persistence
    try {
      const loginTriggers = queryDeep('form, button[type="submit"], input[type="submit"], button[data-provider], a[href*="google"], a[href*="facebook"], [aria-label*="Google"], [aria-label*="Facebook"]')
      loginTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          safeSessionSet('subsnap_waiting_login', 'true')
          if (chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ subsnap_waiting_login: cleanHost })
          }
        }, { capture: true })
      })
    } catch (e) {}

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
          <button id="subsnap-goto-settings-btn" style="background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 800; cursor: pointer;">
            ${isHebrew ? 'פתח הגדרות חשבון ➔' : 'Open Account Settings ➔'}
          </button>
          <button id="subsnap-google-search-btn" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
            ${isHebrew ? 'סרוק נתיב ביטול 🔍' : 'Probe Cancel Path 🔍'}
          </button>
        </div>
      </div>
      <button id="subsnap-deadlink-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px 6px; align-self: flex-start;">
        ✕
      </button>
    `

    document.body.appendChild(hud)

    hud.querySelector('#subsnap-goto-settings-btn').addEventListener('click', () => {
      window.location.href = `https://${window.location.hostname}/settings`
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
          <span>${isHebrew ? `בטל את מנוי ${escapeHtml(serviceName || host)} בקליק אחד` : `Cancel ${escapeHtml(serviceName || host)} in 1-Click`}</span>
          <span style="font-size: 10px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 4px; font-weight: 800;">Direct ⚡</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 3px; line-height: 1.4;">
          ${isHebrew ? `סייר SubSnap פותח ישירות את אתר השירות (${escapeHtml(host)}) ומפעיל את הטייס האוטומטי לביטול!` : `SubSnap will open the service site (${escapeHtml(host)}) directly and engage Auto-Pilot!`}
        </div>
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button id="subsnap-search-proceed-btn" style="background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 7px 16px; font-size: 11px; font-weight: 800; cursor: pointer;">
            ${isHebrew ? `פתח את ${escapeHtml(host)} ובטל עכשיו ➔` : `Open ${escapeHtml(host)} & Cancel Now ➔`}
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

    // BANNED DOMAINS: Forums, social networks, news aggregators and blogs are NOT services to cancel!
    const BANNED_RESULT_DOMAINS = [
      'reddit.com', 'quora.com', 'twitter.com', 'x.com', 'facebook.com',
      'instagram.com', 'tiktok.com', 'pinterest.com', 'youtube.com',
      'medium.com', 'substack.com', 'wikipedia.org', 'theverge.com',
      'tomsguide.com', 'wikihow.com', 'businessinsider.com', 'cnet.com'
    ]

    // Scan Google search results for authoritative cancellation / help / account links
    const resultLinks = Array.from(document.querySelectorAll('#search a[href^="http"], #rso a[href^="http"], div.g a[href^="http"]'))
      .filter(a => {
        const href = (a.href || '').toLowerCase()
        if (
          href.includes('google.com/search') ||
          href.includes('google.com/preferences') ||
          href.includes('google.com/policies') ||
          href.includes('google.com/url') ||
          href.includes('webcache')
        ) {
          return false
        }
        try {
          const uHost = new URL(href).hostname.replace(/^www\./, '')
          if (BANNED_RESULT_DOMAINS.some(b => uHost === b || uHost.endsWith('.' + b))) {
            return false
          }
        } catch (e) {
          return false
        }
        return true
      })

    let bestLink = null
    for (const a of resultLinks) {
      const href = (a.href || '').toLowerCase()
      const text = ((a.innerText || '') + ' ' + (a.title || '')).toLowerCase()

      if (
        (href.includes('help.') || href.includes('support.') || href.includes('/help') || href.includes('/support') || href.includes('account.') || href.includes('/billing') || href.includes('/subscription') || href.includes('settings')) &&
        (text.includes('cancel') || text.includes('subscription') || text.includes('ביטול') || text.includes('מנוי') || href.includes('cancel') || text.includes('manage') || text.includes('membership'))
      ) {
        bestLink = a
        break
      }
    }

    if (!bestLink && resultLinks.length > 0) {
      bestLink = resultLinks[0]
    }

    if (bestLink) {
      const rawTargetUrl = bestLink.href
      let displayHost = ''
      try {
        displayHost = new URL(rawTargetUrl).hostname.replace(/^www\./, '')
      } catch (e) {
        displayHost = rawTargetUrl
      }

      // DIRECT ACTION: Automatically bypass informational help subdomains to launch the actual application directly!
      let rootAppHost = displayHost.replace(/^(help|support|faq|kb)\./, '')
      let operationalUrl = rawTargetUrl

      // Special resolution for Google services (Gemini, Google One, Google Workspace)
      if (displayHost.includes('google.com')) {
        if (cleanedQuery.includes('gemini') || q.includes('gemini')) {
          rootAppHost = 'one.google.com'
          operationalUrl = 'https://one.google.com/settings'
        } else if (cleanedQuery.includes('workspace') || q.includes('workspace')) {
          rootAppHost = 'admin.google.com'
          operationalUrl = 'https://admin.google.com'
        } else {
          rootAppHost = 'myaccount.google.com'
          operationalUrl = 'https://myaccount.google.com/subscriptions'
        }
      } else if (displayHost.startsWith('help.') || displayHost.startsWith('support.') || displayHost.includes('zendesk') || displayHost.includes('intercom')) {
        operationalUrl = `https://${rootAppHost}`
      }

      injectSearchResultActionHUD(
        cleanedQuery || rootAppHost,
        rootAppHost,
        operationalUrl
      )
      return true
    }

    return false
  }

  function isHelpArticlePage() {
    const hostname = window.location.hostname.toLowerCase()
    const pathname = window.location.pathname.toLowerCase()
    const isHelpDomain = hostname.startsWith('help.') || hostname.startsWith('support.') || hostname.includes('intercom.help') || hostname.includes('zendesk.com')
    const isArticlePath = pathname.includes('/articles/') || pathname.includes('/article/') || pathname.includes('/help/') || pathname.includes('/kb/') || pathname.includes('/support/') || pathname.includes('/faq')

    if (!isHelpDomain && !isArticlePath) return false

    const title = (document.title || '').toLowerCase()
    const headingEl = document.querySelector('h1, h2')
    const heading = (headingEl ? headingEl.innerText : '').toLowerCase()
    return /cancel.*subscri|how.*cancel|איך לבטל|ביטול מנוי|stop.*plan|end.*member/i.test(title + ' ' + heading)
  }

  function injectHelpArticleHUD(serviceName, directUrl, googlePlayUrl, appleUrl) {
    if (document.getElementById('subsnap-helparticle-hud')) return
    hudInjected = true

    const isHebrew = /[\u0590-\u05FF]/.test(document.title + ' ' + (document.body.innerText || '').slice(0, 500)) || (navigator.language && navigator.language.startsWith('he'))

    const hud = document.createElement('div')
    hud.id = 'subsnap-helparticle-hud'
    hud.style.cssText = `
      position: fixed; bottom: 24px; left: 24px; z-index: 2147483647;
      background: #ffffff; border: 2px solid #3b82f6;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 0 24px rgba(59, 130, 246, 0.22);
      border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; gap: 14px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; direction: ${isHebrew ? 'rtl' : 'ltr'};
      min-width: 380px; max-width: 560px; animation: subsnapPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `

    hud.innerHTML = `
      <style>
        @keyframes subsnapPop { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      </style>
      <div style="width: 38px; height: 38px; border-radius: 10px; background: #eff6ff; border: 1.5px solid #bfdbfe; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; color: #2563eb;">
        📖
      </div>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; gap: 6px;">
          <span>${isHebrew ? `מדלג על המאמר ועובר ל-${escapeHtml(serviceName || 'האתר')}` : `Jumping to ${escapeHtml(serviceName || 'App')}`}</span>
          <span id="subsnap-help-timer" style="font-size: 10px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 1px 6px; border-radius: 4px; font-weight: 800;">3s ⚡</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 3px; line-height: 1.4;">
          ${isHebrew ? 'סייר SubSnap מאתר את האפליקציה ומדלג ישירות לביצוע הביטול בפועל:' : 'SubSnap is bypassing this article to execute cancellation directly on the app:'}
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
          ${directUrl ? `
            <button id="subsnap-help-web-btn" style="background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 800; cursor: pointer;">
              ${isHebrew ? 'פתח את האתר ובטל עכשיו ➔' : 'Open Website & Cancel ➔'}
            </button>
          ` : ''}
          ${googlePlayUrl ? `
            <button id="subsnap-help-play-btn" style="background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
              Google Play ➔
            </button>
          ` : ''}
          ${appleUrl ? `
            <button id="subsnap-help-apple-btn" style="background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
              Apple ID ➔
            </button>
          ` : ''}
        </div>
      </div>
      <button id="subsnap-help-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px 6px; align-self: flex-start;">
        ✕
      </button>
    `

    document.body.appendChild(hud)

    if (directUrl) {
      const hopCount = parseInt(safeSessionGet('subsnap_helphop_count') || '0', 10)
      const canAutoHop = hopCount === 0

      let autoHopTimer = null
      if (canAutoHop) {
        safeSessionSet('subsnap_helphop_count', String(hopCount + 1))
        let secondsLeft = 3
        autoHopTimer = setInterval(() => {
          if (document.hidden) return
          secondsLeft -= 1
          const badge = hud.querySelector('#subsnap-help-timer')
          if (badge) badge.textContent = `${secondsLeft}s`
          if (secondsLeft <= 0) {
            clearInterval(autoHopTimer)
            if (hud.isConnected) {
              hud.querySelector('#subsnap-help-web-btn')?.click()
            }
          }
        }, 1000)
      } else {
        const badge = hud.querySelector('#subsnap-help-timer')
        if (badge) badge.textContent = 'מדריך 📖'
      }

      hud.querySelector('#subsnap-help-close-btn')?.addEventListener('click', () => {
        if (autoHopTimer) clearInterval(autoHopTimer)
      })

      hud.querySelector('#subsnap-help-web-btn')?.addEventListener('click', () => {
        clearInterval(autoHopTimer)
        let host = serviceName
        try { host = new URL(directUrl).hostname.replace(/^www\./, '') } catch(e) {}
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({
            subsnap_active_intent: {
              name: serviceName,
              targetHost: host,
              cancelUrl: directUrl,
              timestamp: Date.now()
            }
          }, () => { window.location.href = directUrl })
        } else {
          window.location.href = directUrl
        }
      })
    }

    if (googlePlayUrl) {
      hud.querySelector('#subsnap-help-play-btn')?.addEventListener('click', () => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({
            subsnap_active_intent: {
              name: serviceName,
              targetHost: 'play.google.com',
              cancelUrl: googlePlayUrl,
              timestamp: Date.now()
            }
          }, () => { window.location.href = googlePlayUrl })
        } else {
          window.location.href = googlePlayUrl
        }
      })
    }

    if (appleUrl) {
      hud.querySelector('#subsnap-help-apple-btn')?.addEventListener('click', () => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({
            subsnap_active_intent: {
              name: serviceName,
              targetHost: 'apple.com',
              cancelUrl: appleUrl,
              timestamp: Date.now()
            }
          }, () => { window.location.href = appleUrl })
        } else {
          window.location.href = appleUrl
        }
      })
    }

    hud.querySelector('#subsnap-help-close-btn').addEventListener('click', () => {
      hud.remove()
      hudInjected = false
    })
  }

  function handleHelpArticleExtractor() {
    if (!isHelpArticlePage()) return false

    const articleLinks = Array.from(document.querySelectorAll('article a[href^="http"], main a[href^="http"], [class*="article"] a[href^="http"], [class*="content"] a[href^="http"], #content a[href^="http"]'))

    let directPortalLink = null
    let googlePlayLink = null
    let appleLink = null

    const currentHost = window.location.hostname.toLowerCase().replace(/^www\./, '')
    const rootDomain = currentHost.replace(/^(help|support|faq|kb)\./, '')

    for (const a of articleLinks) {
      const href = a.href || ''
      const hrefLower = href.toLowerCase()
      const textLower = (a.innerText || '').toLowerCase()

      if (hrefLower.includes('play.google.com/store/account/subscriptions')) {
        googlePlayLink = href
      } else if (hrefLower.includes('apple.com') && (hrefLower.includes('subscriptions') || textLower.includes('apple'))) {
        appleLink = href
      } else if (
        (hrefLower.includes(rootDomain) && !hrefLower.includes('help.') && !hrefLower.includes('support.')) ||
        hrefLower.includes('stripe.com') ||
        textLower.includes('interface') ||
        textLower.includes('log in') ||
        textLower.includes('sign in') ||
        textLower.includes('account') ||
        textLower.includes('portal')
      ) {
        if (!directPortalLink) directPortalLink = href
      }
    }

    if (!directPortalLink && rootDomain && rootDomain.includes('.')) {
      directPortalLink = `https://${rootDomain}`
    }

    injectHelpArticleHUD(rootDomain, directPortalLink, googlePlayLink, appleLink)
    return true
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
          <span>${escapeHtml(title)}</span>
          <span id="subsnap-heal-timer" style="font-size: 10px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 4px; font-weight: 800;">2s</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px; line-height: 1.35;">${escapeHtml(desc)}</div>
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
          <span>${escapeHtml(title)}</span>
          <span style="font-size: 10px; background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; padding: 1px 6px; border-radius: 4px; font-weight: 800;">פעיל ⚡</span>
        </div>
        <div id="subsnap-ai-desc" style="font-size: 11px; color: #475569; margin-top: 2px; line-height: 1.35;">${escapeHtml(desc)}</div>
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

  function updateAIHUDUnresolved(hud, serviceName, host, customTitle, customSub) {
    if (!hud) hud = document.getElementById('subsnap-ai-hud')
    if (!hud) return
    const isHebrew = /[\u0590-\u05FF]/.test(document.title + ' ' + (document.body.innerText || '').slice(0, 500)) || (navigator.language && navigator.language.startsWith('he'))

    const displayTitle = customTitle || (isHebrew ? 'הנחיית סייר ה-AI של SubSnap 🤖' : 'SubSnap AI Scout Guidance 🤖')
    const displaySub = customSub || (isHebrew ? 'סייר ה-AI סרק את האתר. השתמש בכפתורים מטה למעבר להגדרות החשבון או למדריך הרשמי.' : 'AI Scout analyzed the page. Use the buttons below for account settings or official guide.')

    hud.style.borderColor = '#6366f1'
    hud.innerHTML = `
      <div style="width: 36px; height: 36px; border-radius: 10px; background: #eef2ff; border: 1.5px solid #c7d2fe; display: flex; align-items: center; justify-content: center; font-size: 18px;">
        🤖
      </div>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 800; color: #3730a3; display: flex; align-items: center; gap: 6px;">
          <span>${escapeHtml(displayTitle)}</span>
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px; line-height: 1.35;">
          ${escapeHtml(displaySub)}
        </div>
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button id="subsnap-ai-settings-btn" style="background: #0f172a; color: #ffffff; border: none; border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
            ${isHebrew ? 'הגדרות חשבון ➔' : 'Account Settings ➔'}
          </button>
          <button id="subsnap-ai-search-btn" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
            ${isHebrew ? 'מדריך ביטול 🔍' : 'Cancel Guide 🔍'}
          </button>
        </div>
      </div>
      <button id="subsnap-ai-unresolved-close" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px 6px; align-self: flex-start;">
        ✕
      </button>
    `
    hud.querySelector('#subsnap-ai-settings-btn').addEventListener('click', () => {
      window.location.href = `https://${window.location.hostname}/settings`
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

        // Smart loop guard: only halt if the EXACT same button was clicked 3 times without DOM advancement
        const isStuckOnSameElement = (window.__subsnap_last_clicked_btn === btn)
        if (isStuckOnSameElement) {
          window.__subsnap_same_btn_clicks = (window.__subsnap_same_btn_clicks || 0) + 1
        } else {
          window.__subsnap_last_clicked_btn = btn
          window.__subsnap_same_btn_clicks = 1
        }

        if (window.__subsnap_same_btn_clicks >= 3) {
          descEl.textContent = isHebrew
            ? 'הטייס האוטומטי זיהה את הכפתור. אנא אשר את הלחיצה ידנית.'
            : 'Auto-Pilot located target. Please click to confirm manually.'
          timerBadge.textContent = isHebrew ? 'ידני 🎯' : 'Manual 🎯'
          return
        }

        // Cleanly unblock for next step in the cancellation funnel
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
      safeSessionSet('subsnap_halted_at_' + cleanHost, String(Date.now()))
      safeSessionRemove('subsnap_halted_' + cleanHost)
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
      safeSessionSet('subsnap_halted_at_' + cleanHost, String(Date.now()))
      safeSessionRemove('subsnap_halted_' + cleanHost)
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

  // --- Tier 3: Emergency AI Escalation with Prioritization, Financial Context & Pinned Elements ---

  function extractPageFinancialContext() {
    try {
      const fullText = (document.body.innerText || '').slice(0, 15000)
      const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean)
      const relevantLines = []

      const financialRegex = /(\$|€|£|₪|\busd\b|\bils\b|next payment|next billing|recurring|active|renews|renewal|current plan|plan:|billing cycle|free plan|canceled|cancelled|expired|החיוב הבא|תשלום הבא|מתחדש|מנוי פעיל|תוכנית)/i

      for (const line of lines) {
        if (line.length < 150 && financialRegex.test(line)) {
          relevantLines.push(line)
          if (relevantLines.length >= 15) break
        }
      }

      const tabs = Array.from(document.querySelectorAll('[role="tab"], nav a, div[class*="tab"] a, div[class*="tab"] button, ul[class*="nav"] li, a[href*="billing"]'))
        .map(el => (el.innerText || '').trim())
        .filter(t => t && t.length < 35)
        .slice(0, 10)

      return {
        pageTitle: document.title,
        url: window.location.href,
        signals: relevantLines,
        tabs,
        hasAmount: /\$\s*\d+([.,]\d+)?|\b\d+([.,]\d+)?\s*(usd|eur|ils|₪|€|£)/i.test(fullText),
        hasRecurringActive: /recurring:\s*active/i.test(fullText) || /status:\s*active/i.test(fullText)
      }
    } catch (e) {
      return { signals: [], tabs: [], hasAmount: false, hasRecurringActive: false }
    }
  }

  async function triggerAIEscalation(intent) {
    if (isLoginPage() || isLoggedOutState()) return
    if (aiEscalationAttempted || hudInjected) return
    aiEscalationAttempted = true
    lastEscalatedUrl = window.location.href

    const cleanHost = window.location.hostname.toLowerCase().replace(/^www\./, '')
    const serviceName = intent ? intent.name : cleanHost

    injectAIEscalationHUD(
      'סייר AI מתערב בחילוץ 🤖',
      `לא אותר כפתור ביטול מוכר. סייר Gemini סורק את אלמנטי העמוד של ${serviceName}...`
    )

    const pageContext = extractPageFinancialContext()

    // Query interactive elements including dark pattern chevrons, tabs, and toggles
    const allInteractive = queryDeep('button, a, div[role="button"], span[role="button"], input[type="submit"], [class*="chevron"], [class*="caret"], [class*="arrow"], [class*="toggle"], [data-testid*="dropdown"], [data-testid*="toggle"], [aria-expanded], [aria-haspopup], [role="tab"]')
      .filter(el => isVisible(el) && !isDisallowedElement(el))

    const scoredElements = allInteractive.map(el => {
      let score = 0
      const text = (el.innerText || el.textContent || el.value || '').toLowerCase()
      const inMain = !!el.closest('main, [role="main"], #main, .main, [class*="settings"], [class*="billing"], [class*="account"]')
      const inNav = !!el.closest('nav, header, [role="navigation"]')

      if (inMain) score += 6
      if (inNav) score -= 8
      if (/subscri|member|plan|bill|renew|cancel|end|deactiv|active|recurring/i.test(text)) score += 15
      if (/pref|manage|opt|setting/i.test(text)) score += 4
      if (el.matches && el.matches('[class*="chevron"], [class*="caret"], [aria-expanded], [role="tab"]')) score += 6

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

    try {
    chrome.runtime.sendMessage({
      action: 'domScout',
      payload: {
        serviceName,
        hostname: cleanHost,
        elements: payloadElements,
        pageContext
      }
    }, (res) => {
      const existingHud = document.getElementById('subsnap-ai-hud')
      let targetEl = null

      const accountState = (res && res.data && res.data.accountState) || 'unknown'
      const detectedAmount = (res && res.data && res.data.detectedAmount) || null
      const nextPaymentDate = (res && res.data && res.data.nextPaymentDate) || null
      const planName = (res && res.data && res.data.planName) || ''
      const guidanceHe = (res && res.data && res.data.guidanceHe) || ''
      const isHebrew = /[\u0590-\u05FF]/.test(document.title + ' ' + (document.body.innerText || '').slice(0, 500)) || (navigator.language && navigator.language.startsWith('he'))

      // Fix #1: Wrap querySelector in isolated try/catch
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

      // Fix #2: Fallback to PINNED DOM Reference
      if (!targetEl && res && res.success && res.data && typeof res.data.bestMatchIndex === 'number' && res.data.bestMatchIndex >= 0) {
        const candidate = prioritized[res.data.bestMatchIndex]
        if (candidate && candidate.el && candidate.el.isConnected && isVisible(candidate.el) && !isDisallowedElement(candidate.el)) {
          targetEl = candidate.el
        }
      }

      // SCENARIO 1: Valid Target Element Resolved (Cancel button, Dropdown chevron, or Backtrack navigation)
      if (targetEl) {
        if (existingHud) existingHud.remove()
        hudInjected = false

        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        targetEl.style.outline = '3px solid #10b981'
        targetEl.style.outlineOffset = '3px'

        const isBacktrack = res && res.data && (res.data.actionType === 'backtrack' || res.data.actionType === 'navigate_to_billing')
        const hudTitle = isBacktrack
          ? (isHebrew ? `🔄 סייר AI מתקן מסלול: ${planName || serviceName}` : `🔄 AI Course Correction: ${planName || serviceName}`)
          : (accountState === 'active_paid' && detectedAmount
            ? (isHebrew ? `💳 מנוי פעיל: ${planName || serviceName} (${detectedAmount})` : `💳 Active Plan: ${planName || serviceName} (${detectedAmount})`)
            : (isHebrew ? 'נתיב הביטול אותר ע"י AI 🤖⚡' : 'AI Located Cancellation Pathway 🤖⚡'))

        const hudSub = isBacktrack
          ? (isHebrew ? 'אתה בעמוד שדרוג תוכניות. סייר ה-AI חוזר אוטומטית לעמוד ניהול החיובים וביטול המנוי...' : 'You are on an upgrade page. AI Scout is automatically returning to the billing cancellation pathway...')
          : (guidanceHe || (isHebrew ? 'ה-AI פיצח את הנתיב. ממשיך ומאמת את התוצאה...' : 'SubSnap AI identified the path. Proceeding...'))

        injectSelfHealingHUD(hudTitle, hudSub, () => {
          try {
            safeSessionSet('subsnap_pending_verification', JSON.stringify({
              host: cleanHost,
              urlBefore: window.location.href,
              selector: res.data ? res.data.targetSelector : null,
              timestamp: Date.now()
            }))
            stagePlaybookStep({
              type: 'click',
              selector: (res && res.data && res.data.targetSelector) || getElementSelector(targetEl),
              text: targetEl.innerText || ''
            })
          } catch (e) {}

          forceClick(targetEl)
          setTimeout(startScanningEngine, 1200)
        })
        return
      }

      // SCENARIO 1.5: Autonomous Recovery URL Navigation (Dead-End / Upgrade / 404 Recovery)
      if (res && res.data && res.data.recoveryUrl) {
        if (existingHud) existingHud.remove()
        hudInjected = false

        const navTitle = isHebrew
          ? `🔄 סייר AI מנווט להגדרות החיוב (${planName || serviceName})`
          : `🔄 AI Navigating to Billing Settings (${planName || serviceName})`

        const navSub = isHebrew
          ? 'עובר אוטומטית לעמוד ניהול החיובים וביטול המנוי...'
          : 'Automatically transitioning to subscription management...'

        injectSelfHealingHUD(navTitle, navSub, () => {
          window.location.href = res.data.recoveryUrl
        })
        return
      }

      // SCENARIO 2: Active Paid Subscription on Dead-End Page (Autonomous Fallback to Billing Settings)
      if (accountState === 'active_paid' || detectedAmount || (pageContext.hasAmount && pageContext.hasRecurringActive)) {
        if (existingHud) existingHud.remove()
        hudInjected = false

        const isUpgradeUrl = window.location.href.includes('/upgrade') || window.location.href.includes('/pricing')
        const fallbackBillingUrl = `https://${window.location.hostname}/settings/billing`

        const title = isHebrew
          ? `💳 מנוי פעיל: ${planName || serviceName} ${detectedAmount ? `(${detectedAmount})` : ''}`
          : `💳 Active Subscription: ${planName || serviceName} ${detectedAmount ? `(${detectedAmount})` : ''}`

        const sub = isUpgradeUrl
          ? (isHebrew ? 'אתה בעמוד שדרוג תוכניות. סייר ה-AI מעביר אותך כעת לעמוד ניהול החיובים וביטול המנוי...' : 'You are on an upgrade page. AI Scout is redirecting to the billing management dashboard...')
          : (guidanceHe || (isHebrew ? `המנוי שלך פעיל${nextPaymentDate ? ` (חיוב הבא: ${nextPaymentDate})` : ''}. לחץ על הגדרות חשבון להמשך ביטול.` : `Active subscription detected${nextPaymentDate ? ` (Next payment: ${nextPaymentDate})` : ''}.`))

        if (isUpgradeUrl) {
          injectSelfHealingHUD(title, sub, () => {
            window.location.href = fallbackBillingUrl
          })
          return
        }

        // Highlight any chevron or billing tab on page to empower user immediately
        const chevronOrTab = document.querySelector('[class*="chevron"], [aria-expanded], a[href*="billing"], [role="tab"]')
        if (chevronOrTab && isVisible(chevronOrTab)) {
          chevronOrTab.scrollIntoView({ behavior: 'smooth', block: 'center' })
          chevronOrTab.style.outline = '3px solid #f59e0b'
          chevronOrTab.style.outlineOffset = '3px'
        }

        injectPeaceOfMindHUD(title, sub)
        return
      }

      // SCENARIO 3: Genuine Positive Free Tier (ZERO dollar amount, ZERO active recurring)
      if ((accountState === 'free_tier' || (res && res.data && res.data.isFreeTier)) && !pageContext.hasAmount && !pageContext.hasRecurringActive) {
        if (existingHud) existingHud.remove()
        hudInjected = false
        if (chrome.storage && chrome.storage.local) {
          chrome.storage.local.remove(['subsnap_active_intent'])
        }
        injectPeaceOfMindHUD(
          isHebrew ? 'בשורות טובות: אין מנוי פעיל! 🛡️' : 'Good News: No Active Subscription! 🛡️',
          isHebrew ? `סייר ה-AI אימת שחשבונך ב-${serviceName || cleanHost} הוא ללא מנוי בתשלום.` : `SubSnap verified your account on ${serviceName || cleanHost} has no recurring paid subscription.`
        )
        return
      }

      // SCENARIO 4: Already Cancelled
      if (accountState === 'already_cancelled') {
        if (existingHud) existingHud.remove()
        hudInjected = false
        if (chrome.storage && chrome.storage.local) {
          chrome.storage.local.remove(['subsnap_active_intent'])
        }
        recordCancellationSuccess(serviceName)
        injectPeaceOfMindHUD(
          isHebrew ? 'המנוי כבר בוטל בהצלחה! 🎉' : 'Subscription Already Cancelled! 🎉',
          isHebrew
            ? `סייר SubSnap זיהה שהחיוב החוזר ב-${serviceName || cleanHost} כבוי (Recurring: Inactive). לא יבוצע חיוב נוסף.`
            : `SubSnap verified that recurring billing on ${serviceName || cleanHost} is Inactive. No further charges will occur.`
        )
        return
      }

      // SCENARIO 5: Fallback unresolved guidance with live Gemini AI analysis
      const aiTitle = isHebrew
        ? (accountState === 'active_paid' ? `💳 מנוי ${planName || serviceName || ''} פעיל ${detectedAmount ? `(${detectedAmount})` : ''}` : `הנחיית סייר AI (${serviceName || cleanHost})`)
        : (accountState === 'active_paid' ? `💳 Active ${planName || serviceName || ''} ${detectedAmount ? `(${detectedAmount})` : ''}` : `AI Guidance (${serviceName || cleanHost})`)

      const aiSub = (isHebrew ? (guidanceHe || (res && res.data && res.data.guidanceHe)) : (guidanceEn || (res && res.data && res.data.guidanceEn))) || (isHebrew
        ? `סייר ה-AI סרק את העמוד. לחץ על 'הגדרות חשבון' כדי לעבור לעמוד ניהול החיובים.`
        : `AI Scout analyzed the page. Click 'Account Settings' to navigate to billing management.`)

      updateAIHUDUnresolved(existingHud, serviceName, cleanHost, aiTitle, aiSub)
    })
    } catch (e) {
      console.warn('[SubSnap] domScout sendMessage failed:', e)
    }
  }

  // --- Room 5: Autonomous Playbook Recorder & Continuous Learning Fleet ---

  function getElementSelector(el) {
    if (!el) return ''
    if (el.getAttribute('data-testid')) return `[data-testid="${el.getAttribute('data-testid')}"]`
    if (el.getAttribute('data-uia')) return `[data-uia="${el.getAttribute('data-uia')}"]`
    if (el.id) return `#${el.id}`
    if (el.getAttribute('aria-label')) return `${el.tagName.toLowerCase()}[aria-label="${el.getAttribute('aria-label')}"]`
    if (el.className && typeof el.className === 'string') {
      const firstClass = el.className.split(/\s+/).filter(c => c && !c.includes(':') && !c.startsWith('subsnap'))[0]
      if (firstClass) return `${el.tagName.toLowerCase()}.${firstClass}`
    }
    return el.tagName.toLowerCase()
  }

  function stagePlaybookStep(stepInfo) {
    try {
      let staged = JSON.parse(safeSessionGet('subsnap_staged_playbook') || '[]')
      staged.push({
        stepNumber: staged.length + 1,
        type: stepInfo.type || 'click',
        selector: stepInfo.selector || '',
        fallbackText: (stepInfo.text || '').slice(0, 60),
        timestamp: Date.now()
      })
      safeSessionSet('subsnap_staged_playbook', JSON.stringify(staged))
    } catch (e) {}
  }

  function commitVerifiedPlaybook(serviceName, cleanHost) {
    try {
      const staged = JSON.parse(safeSessionGet('subsnap_staged_playbook') || '[]')
      safeSessionRemove('subsnap_staged_playbook')

      if (Array.isArray(staged) && staged.length > 0) {
        // Anti-poison check
        const validSteps = staged.filter(s => {
          const t = (s.selector + ' ' + (s.fallbackText || '')).toLowerCase()
          return !t.includes('buy') && !t.includes('upgrade') && !t.includes('purchase') &&
                 !t.includes('购买') && !t.includes('升级') && !t.includes('delete')
        })

        if (validSteps.length > 0) {
          if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
              action: 'reportVerifiedPlaybook',
              payload: {
                host: cleanHost,
                serviceName: serviceName || cleanHost,
                cancelUrl: window.location.href,
                steps: validSteps
              }
            })
          }
        }
      }
    } catch (e) {}
  }

  function recordCancellationSuccess(serviceName = '') {
    try {
      const cleanHost = window.location.hostname.toLowerCase().replace(/^www\./, '')
      const sName = serviceName || cleanHost

      // Commit verified Golden Playbook to global fleet!
      commitVerifiedPlaybook(sName, cleanHost)

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['subsnap_savings_stats', 'subsnap_learned_services'], (res) => {
          // 1. Commit to Learned Services (Local Persistent Memory)
          let learned = (res && Array.isArray(res.subsnap_learned_services)) ? res.subsnap_learned_services : []
          const exists = learned.some(s => s.name === sName || s.host === cleanHost)
          if (!exists) {
            learned.push({
              name: sName,
              host: cleanHost,
              cancelUrl: window.location.href,
              savedAt: Date.now()
            })
            chrome.storage.local.set({ subsnap_learned_services: learned })
          }

          // 2. Report to Global Redis (Collective Fleet Memory - AI as Pathfinder)
          if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
              action: 'reportHealedUrl',
              payload: {
                host: cleanHost,
                healedUrl: window.location.href,
                serviceName: sName
              }
            })
          }

          // 3. Trophy Room Stats
          const stats = res && res.subsnap_savings_stats ? res.subsnap_savings_stats : {
            cancelledCount: 0,
            totalSavedIls: 0,
            services: []
          }

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
      const pendingRaw = safeSessionGet('subsnap_pending_verification')
      if (!pendingRaw) return
      const pending = JSON.parse(pendingRaw)

      // Expire candidates after 60 seconds
      if (Date.now() - pending.timestamp > 60000) {
        safeSessionRemove('subsnap_pending_verification')
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
        safeSessionRemove('subsnap_pending_verification')
      }
    } catch (e) {}
  }

  // --- Main Tiered Scan Engine ---

  function checkActiveIntent(cleanHost) {
    return new Promise((resolve) => {
      // Clean legacy keys
      safeSessionRemove('subsnap_halted_' + cleanHost)

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['subsnap_active_intent'], (res) => {
          const intent = res ? res.subsnap_active_intent : null
          console.log('[SubSnap checkActiveIntent]', { cleanHost, intentTarget: intent?.targetHost, match: intent ? isHostMatch(intent.targetHost, cleanHost) : false })
          if (!intent) return resolve(null)

          // 5 minutes session window - clean up if expired!
          if (Date.now() - intent.timestamp >= 300000) {
            chrome.storage.local.remove(['subsnap_active_intent'])
            return resolve(null)
          }

          if (!isHostMatch(intent.targetHost, cleanHost)) {
            return resolve(null)
          }

          // Check if this tab was explicitly stopped/halted AFTER this intent was launched
          const haltedAt = parseInt(safeSessionGet('subsnap_halted_at_' + cleanHost) || '0', 10)
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

    // 0.1 Help Center Article Extraction: Automatically extract direct app/portal links from articles
    if (handleHelpArticleExtractor()) {
      return true
    }

    // Check if a previous candidate click achieved verified success
    verifyAndCommitPendingHeal()

    // Clean up stale Login HUD if user has transitioned into active app or authenticated session!
    const staleLoginHud = document.getElementById('subsnap-login-hud')
    if (staleLoginHud && (!isLoginPage() && !isLoggedOutState())) {
      console.log('[SubSnap] Removing stale login bridge HUD after successful login')
      staleLoginHud.remove()
      hudInjected = false
    }

    if (hudInjected) return false

    // Auto-dismiss marketing / promotional overlays (like hackathon / newsletter popups)
    dismissPromotionalPopups()

    // Check if user initiated active intent
    const activeIntent = await checkActiveIntent(cleanHost)
    if (!activeIntent) {
      return false
    }

    const targetName = activeIntent.name || ''

    // Tier 0.2: Universal Non-Subscription Platform Shield (100% Universal, Zero Hardcoded Domains)
    const isExplicitlyFree = !!activeIntent.isNonSubscription ||
      (activeIntent.notes && (
        activeIntent.notes.includes('ללא מנויים') ||
        activeIntent.notes.includes('אין חיוב') ||
        activeIntent.notes.includes('no recurring paid subscriptions') ||
        activeIntent.notes.includes('free community') ||
        activeIntent.notes.includes('free service')
      ))

    if (isExplicitlyFree) {
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(['subsnap_active_intent'])
      }
      injectPeaceOfMindHUD(
        'פלטפורמה חינמית ללא מנויים! 🛡️',
        `סייר SubSnap זיהה כי ${targetName || cleanHost} הינה פלטפורמה חינמית ללא מנוי פעיל. אין חיוב ואין צורך בביטול.`
      )
      return true
    }

    // 0. THE INVISIBLE LOGIN BRIDGE: Check if returning from a successful login
    let wasWaitingLogin = safeSessionGet('subsnap_waiting_login') === 'true'
    if (!wasWaitingLogin && chrome.storage && chrome.storage.local) {
      const stored = await new Promise(r => chrome.storage.local.get(['subsnap_waiting_login'], r))
      if (stored && stored.subsnap_waiting_login === cleanHost) {
        wasWaitingLogin = true
      }
    }

    if (wasWaitingLogin && !isLoginPage() && activeIntent && activeIntent.cancelUrl) {
      safeSessionRemove('subsnap_waiting_login')
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(['subsnap_waiting_login'])
      }
      try {
        const cancelUrlObj = new URL(activeIntent.cancelUrl)
        const currentUrlObj = new URL(window.location.href)
        const hasSpecificPath = cancelUrlObj.pathname && cancelUrlObj.pathname !== '/' && !cancelUrlObj.pathname.startsWith('/login')

        if (hasSpecificPath && cancelUrlObj.pathname !== currentUrlObj.pathname && !currentUrlObj.pathname.includes('/subscriptions') && !currentUrlObj.pathname.includes('/account')) {
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
      } catch (e) {}
    }

    // Tier 1.1: Check if already cancelled
    if (isAlreadyCancelled()) {
      recordCancellationSuccess(targetName || window.location.hostname.replace(/^www\./, ''))
      safeSessionSet('subsnap_halted_at_' + cleanHost, String(Date.now()))
      safeSessionRemove('subsnap_halted_' + cleanHost)
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

    // Tier 1.3: Check if Free Account / No Active Subscription (ONLY if no cancel button or modal is active!)
    if (isNoActiveSubscriptionState()) {
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(['subsnap_active_intent'])
      }
      if (activeObserver) activeObserver.disconnect()
      if (activeScanInterval) clearInterval(activeScanInterval)
      safeSessionRemove('subsnap_staged_playbook')

      const isHebrew = /[\u0590-\u05FF]/.test(document.title + ' ' + (document.body.innerText || '').slice(0, 500)) || (navigator.language && navigator.language.startsWith('he'))
      injectPeaceOfMindHUD(
        isHebrew ? 'בשורות טובות: אין מנוי פעיל לתשלום! ✨' : 'Good News: No Active Paid Subscription! ✨',
        isHebrew 
          ? `החשבון שלך ב-${targetName || 'שירות'} נמצא בתוכנית חינמית (Free plan). לא קיים חיוב פעיל ואין צורך בביטול.` 
          : `Your account on ${targetName || 'service'} is on the Free plan. No active recurring billing found.`
      )
      return true
    }

    // 1. LOGIN WALL DETECTED: Only if no active plan or app state was found!
    if (isLoggedOutState()) {
      safeSessionSet('subsnap_waiting_login', 'true')
      injectLoginBridgeHUD(targetName)
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
              safeSessionSet('subsnap_pending_verification', JSON.stringify({
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
    const maxAttempts = 2 // Fast 1s local check, then IMMEDIATE AI Trailblazer if needed!

    activeObserver = new MutationObserver(async () => {
      if (!hudInjected) {
        let found = false
        try {
          found = await performScan()
        } catch (e) {
          console.warn('[SubSnap] performScan (observer) failed:', e)
        }
        if (found && activeObserver) activeObserver.disconnect()
      }
    })

    activeObserver.observe(document.body, { childList: true, subtree: true })

    activeScanInterval = setInterval(async () => {
      scanAttempts++
      let found = false
      try {
        found = await performScan()
      } catch (e) {
        console.warn('[SubSnap] performScan (interval) failed:', e)
      }

      if (found || scanAttempts >= maxAttempts) {
        clearInterval(activeScanInterval)
        if (activeObserver) activeObserver.disconnect()

        const cleanHost = window.location.hostname.toLowerCase().replace(/^www\./, '')
        const isSearchEngine = (cleanHost === 'google.com' || cleanHost.endsWith('.google.com') || cleanHost.includes('bing.com') || cleanHost.includes('duckduckgo.com'))
        // IMMEDIATE AI TRAILBLAZER: If Tier 1 & Tier 2 haven't found a proven button within 1 second, engage AI Trailblazer immediately!
        if (!found && !hudInjected && !isLoginPage() && !isDeadOr404Page() && !isSearchEngine && !isHelpArticlePage() && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['subsnap_active_intent'], (res) => {
            const intent = res ? res.subsnap_active_intent : null
            if (intent && isHostMatch(intent.targetHost, cleanHost) && (Date.now() - intent.timestamp < 180000)) {
              triggerAIEscalation(intent)
            }
          })
        }
      }
    }, 500)
  }

  startScanningEngine()

  // --- UNIVERSAL SPA ROUTER WATCHER (Next.js, React, Vue, Angular) ---
  // When an app transitions from /login to /app via client-side routing, popstate does not fire.
  // We monitor URL mutations directly via history hooks and reactive polling.
  let lastMonitoredUrl = window.location.href

  function onUniversalUrlChange() {
    if (window.location.href === lastMonitoredUrl) return
    lastMonitoredUrl = window.location.href
    console.log('[SubSnap] Universal SPA route changed to:', window.location.href)

    // Remove any lingering login HUD when navigating inside the app
    const staleLoginHud = document.getElementById('subsnap-login-hud')
    if (staleLoginHud) {
      staleLoginHud.remove()
      hudInjected = false
    }

    aiEscalationAttempted = false
    setTimeout(startScanningEngine, 250)
  }

  // Intercept history pushState & replaceState
  try {
    const origPushState = history.pushState
    history.pushState = function () {
      const res = origPushState.apply(this, arguments)
      setTimeout(onUniversalUrlChange, 50)
      return res
    }

    const origReplaceState = history.replaceState
    history.replaceState = function () {
      const res = origReplaceState.apply(this, arguments)
      setTimeout(onUniversalUrlChange, 50)
      return res
    }
  } catch (e) {}

  window.addEventListener('popstate', onUniversalUrlChange)
  window.addEventListener('hashchange', onUniversalUrlChange)

  // Reactive URL Poller (catches client-side framework transitions even in sandboxes)
  setInterval(onUniversalUrlChange, 350)
})()
