import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Redis } from '@upstash/redis'

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { serviceName, hostname, elements, pageContext } = body

    if (!Array.isArray(elements) || elements.length === 0) {
      return NextResponse.json({ targetSelector: null, bestMatchIndex: -1, reason: 'no_elements' })
    }

    // 1. Quick check against Redis distributed cache (only for direct deterministic buttons)
    if (redis && hostname) {
      try {
        const cached = await redis.get<string>(`selector:${hostname.toLowerCase()}`)
        if (cached) {
          return NextResponse.json({ targetSelector: cached, source: 'redis_cache', confidence: 1.0 })
        }
      } catch {}
    }

    // 2. Run Gemini 2.5 Flash on the DOM snapshot + Financial Context
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ targetSelector: null, bestMatchIndex: -1, reason: 'no_api_key' })
    }

    const genai = new GoogleGenerativeAI(apiKey)
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are SubSnap Autonomous Subscription & Billing AI Scout.
Analyze this subscription/account page for "${serviceName || hostname}".

PAGE FINANCIAL CONTEXT (Raw text signals, active plan, billing dates, amounts from DOM):
${JSON.stringify(pageContext || {}, null, 2)}

INTERACTIVE ELEMENTS ON PAGE (buttons, links, chevrons, tabs, dropdowns):
${JSON.stringify(elements.slice(0, 45), null, 2)}

YOUR 2-STAGE ANALYSIS MISSION:

STAGE 1: FINANCIAL STATE DIAGNOSIS
Determine the user's ACTUAL subscription status based on the Page Financial Context and page text:
1. "active_paid": The page indicates an active paid subscription (e.g. Next payment: $199, Recurring: Active, Billing cycle, Renews on, Pro/Plus/One tier with price).
2. "free_tier": The user is explicitly on a Free/Basic plan with ZERO recurring charges (e.g. "Current Plan: Free", and NO dollar recurring charges or renew dates).
3. "already_cancelled": The subscription was already cancelled (e.g. "Cancelled", "Cancels on", "Expires on", "Renewal: Inactive").
4. "unknown": Cannot determine with confidence.

STAGE 2: CANCELLATION PATHWAY IDENTIFICATION & AUTONOMOUS RECOVERY
Find the single interactive element or lever that progresses toward cancellation:
- Direct cancel buttons (e.g. "Cancel subscription", "End plan", "Turn off auto-renew").
- DARK PATTERNS & DROPDOWNS: Enterprise SaaS (like Semrush, HubSpot, Zoom) hides cancellation behind chevrons (e.g. "Recurring: Active ⌵", a chevron/caret icon, or a settings gear).
- Sub-tabs or Menus (e.g. "Subscription info", "Billing info", "Payments", "Manage Plan", or Avatar/Profile dropdown) if currently on a dashboard or overview page.
- Retention Survey (e.g. "Why are you leaving?", radio options, feedback textareas, "Continue to cancel").
- BACKTRACK / DEAD-END RECOVERY: If currently on an Upgrade page, Pricing page, or wrong sub-tab (e.g. /upgrade or /pricing) while user has an active paid subscription, pick the Back button (like "Back", "Return to settings", or back arrow) and set actionType to "backtrack", or provide the direct billing URL in "recoveryUrl" and set actionType to "navigate_to_billing".

STRICT CRITICAL RULES:
1. If the financial context has a price, payment date, or says "Recurring: Active", you MUST diagnose accountState as "active_paid"! You are STRICTLY FORBIDDEN from declaring "free_tier" or saying no subscription exists!
2. NEVER pick "Delete account", "Close account", "Buy", "Upgrade", "Purchase", or "Compare plans". Those are NOT cancellation!
3. If on an upgrade page with an active subscription, help the user return/navigate to billing (e.g. direct billing settings URL or back button) so the cancellation button can be accessed.
4. If on a dashboard or homepage without direct cancel buttons, pick the navigation link (e.g. "Subscription info", "Billing", "Account", or Avatar) that leads toward subscriptions and set actionType to "navigate_to_billing".
5. If accountState is "active_paid" and a chevron or dropdown (like "Recurring: Active ⌵") controls billing renewal, pick THAT element's index.

Return ONLY a valid JSON object matching this schema:
{
  "accountState": "active_paid" | "free_tier" | "already_cancelled" | "unknown",
  "detectedAmount": "string with currency like $199.00 or null",
  "nextPaymentDate": "string like September 6, 2026 or null",
  "planName": "string like Semrush One or Claude Pro or null",
  "bestMatchIndex": number (0-based index in the elements array, or -1 if no trigger can be found),
  "targetSelector": "CSS selector if uniquely identifiable, or null",
  "actionType": "click_cancel" | "open_dropdown" | "navigate_to_billing" | "backtrack" | "fill_survey" | "switch_tab" | "contact_support" | "none",
  "recoveryUrl": "string like https://service.com/settings/billing or null",
  "confidence": number (0.0 to 1.0),
  "guidanceHe": "Clear Hebrew message explaining status and next step",
  "guidanceEn": "Clear English message explaining status and next step"
}
`

    const aiResponse = await model.generateContent([prompt])
    const text = aiResponse.response.text().trim()
    const cleanJson = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleanJson)

    // Values that would break out of the CSS attribute-selector string or corrupt the
    // shared Redis-cached selector for every future user of this hostname.
    const isUnsafeForSelector = (v: unknown): v is string => typeof v === 'string' && /["<>`]/.test(v)

    if (parsed) {
      let derivedSelector = parsed.targetSelector || null
      if (parsed.bestMatchIndex >= 0 && parsed.bestMatchIndex < elements.length) {
        const matched = elements[parsed.bestMatchIndex]
        derivedSelector = (matched.testid && !isUnsafeForSelector(matched.testid)) ? `[data-testid="${matched.testid}"]` :
                          (matched.uia && !isUnsafeForSelector(matched.uia)) ? `[data-uia="${matched.uia}"]` :
                          (matched.id && !isUnsafeForSelector(matched.id)) ? `#${matched.id}` :
                          (matched.aria && !isUnsafeForSelector(matched.aria)) ? `${matched.tag}[aria-label="${matched.aria}"]` :
                          derivedSelector
      }

      if (derivedSelector && parsed.actionType === 'click_cancel' && redis && hostname && parsed.confidence >= 0.8) {
        try {
          await redis.set(`selector:${hostname.toLowerCase()}`, derivedSelector, { ex: 60 * 60 * 24 * 7 })
        } catch {}
      }

      return NextResponse.json({
        accountState: parsed.accountState || 'unknown',
        detectedAmount: parsed.detectedAmount || null,
        nextPaymentDate: parsed.nextPaymentDate || null,
        planName: parsed.planName || null,
        bestMatchIndex: typeof parsed.bestMatchIndex === 'number' ? parsed.bestMatchIndex : -1,
        targetSelector: derivedSelector,
        actionType: parsed.actionType || 'none',
        recoveryUrl: parsed.recoveryUrl || null,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
        guidanceHe: parsed.guidanceHe || null,
        guidanceEn: parsed.guidanceEn || null,
        isFreeTier: parsed.accountState === 'free_tier',
        source: 'gemini_cognitive_scout'
      })
    }

    return NextResponse.json({
      accountState: 'unknown',
      targetSelector: null,
      bestMatchIndex: -1,
      isFreeTier: false,
      source: 'no_match'
    })
  } catch (err) {
    console.warn('[DOM Scout Error]:', err)
    return NextResponse.json({ accountState: 'unknown', targetSelector: null, bestMatchIndex: -1, error: String(err) })
  }
}
