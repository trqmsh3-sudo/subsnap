import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ override: true, path: path.resolve(process.cwd(), '.env.local') })

import { chromium } from 'playwright'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const anthropic = new Anthropic()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// ─── Scout ────────────────────────────────────────────────────────────────────
// Sends a single screenshot to Gemini Flash and returns easy | medium | hard.
// Estimated cost: ~$0.000075 per call (gemini-1.5-flash image input at $0.075/1M tokens,
// ~1000 tokens per screenshot + prompt).
// Falls back to the manual difficulty tag if Scout throws.

async function scoutDifficulty(
  screenshotBase64: string,
  fallback: 'easy' | 'hard'
): Promise<'easy' | 'medium' | 'hard'> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent([
      { inlineData: { mimeType: 'image/png', data: screenshotBase64 } },
      `Look at this cancellation page screenshot. Rate the complexity: reply with only one word: easy, medium, or hard.
Easy = direct cancel button visible. Medium = multi-step flow. Hard = chat required, phone required, or heavy dark patterns.`,
    ])
    const rating = result.response.text().trim().toLowerCase()
    console.log(`[scout] raw response: "${rating}"`)
    if (rating === 'easy' || rating === 'medium' || rating === 'hard') {
      return rating
    }
    console.warn(`[scout] Unexpected rating "${rating}", using fallback: ${fallback}`)
    return fallback === 'hard' ? 'hard' : 'easy'
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string; errorDetails?: unknown }
    console.error(`[scout] FAILED — status=${e?.status ?? 'n/a'} message="${e?.message ?? String(err)}"`)
    if (e?.errorDetails) console.error(`[scout] errorDetails:`, JSON.stringify(e.errorDetails, null, 2))
    console.warn(`[scout] using manual fallback: ${fallback}`)
    return fallback === 'hard' ? 'hard' : 'easy'
  }
}

// ─── Action prompts ───────────────────────────────────────────────────────────

const ACTION_PROMPT = (goal: string, steps?: string[]) => {
  const stepsBlock = steps && steps.length > 0
    ? `\n\nFollow these steps in order:\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`
    : ''
  return `You are helping cancel a subscription. Goal: ${goal}${stepsBlock}
Analyze this screenshot and return ONLY a JSON object:
{
  "action": "click" | "type" | "wait" | "done" | "need_human",
  "selector": "CSS selector or text to find element (prefer visible text over CSS)" (if click/type),
  "text": "text to type" (if type),
  "reason": "brief explanation"
}

If you see a login form, return need_human.
If cancellation is complete or a confirmation message is shown, return done.
If you see a cancel/unsubscribe/end membership button, click it.
Prefer clicking by visible text (e.g. "End membership") over CSS selectors.`
}

type ActionResult = {
  action: 'click' | 'type' | 'wait' | 'done' | 'need_human'
  selector?: string
  text?: string
  reason: string
}

async function getNextActionClaude(screenshotBase64: string, goal: string, steps?: string[]): Promise<ActionResult> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: screenshotBase64 } },
        { type: 'text', text: ACTION_PROMPT(goal, steps) },
      ]
    }]
  })
  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

async function getNextActionGemini(screenshotBase64: string, goal: string, steps?: string[]): Promise<ActionResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent([
    { inlineData: { mimeType: 'image/png', data: screenshotBase64 } },
    ACTION_PROMPT(goal, steps),
  ])
  const raw = result.response.text()
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

function pickModel(scoutRating: 'easy' | 'medium' | 'hard'): 'gemini' | 'claude' {
  return scoutRating === 'hard' ? 'claude' : 'gemini'
}

// ─── Cost estimation ──────────────────────────────────────────────────────────

const COST = {
  scoutCall: 0.000025,      // one Gemini Flash image call for Scout
  geminiCancel: 0.15,       // flat per-cancellation estimate (Gemini steps)
  claudeCancel: 0.75,       // flat per-cancellation estimate (Claude steps)
}

function logCost(serviceName: string, model: 'gemini' | 'claude', stepCount: number) {
  const base = model === 'claude' ? COST.claudeCancel : COST.geminiCancel
  const total = (COST.scoutCall + base).toFixed(6)
  console.log(
    `[cost] service=${serviceName} | model=${model} | steps=${stepCount} | estimated=$${total}`
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface CancelResult {
  success: boolean
  message: string
  model?: 'gemini' | 'claude'
  stepsTaken?: number
  estimatedCost?: number
}

function calcCost(model: 'gemini' | 'claude'): number {
  return COST.scoutCall + (model === 'claude' ? COST.claudeCancel : COST.geminiCancel)
}

export async function cancelSubscription(
  cancelUrl: string,
  serviceName: string,
  manualDifficulty: 'easy' | 'hard' = 'easy',
  tier: 'auto' | 'session' | 'manual' = 'auto',
  steps?: string[],
  options: { headless?: boolean } = {}
): Promise<CancelResult> {
  const browser = await chromium.launch({ headless: options.headless ?? false })
  const page = await browser.newPage()

  const timeoutMs = options.headless ? 90_000 : 30_000
  const timeoutHandle = setTimeout(async () => {
    console.warn(`[playwright] ${timeoutMs / 1000}s timeout reached — closing browser`)
    await browser.close().catch(() => {})
  }, timeoutMs)

  try {
    // Tier 2 (session): show branded bridge page first, then navigate to cancel URL
    if (tier === 'session') {
      const bridgePath = path.resolve(process.cwd(), 'public', 'cancel-bridge.html')
      const bridgeFile = `file:///${bridgePath.replace(/\\/g, '/')}` +
        `?service=${encodeURIComponent(serviceName)}&url=${encodeURIComponent(cancelUrl)}`
      await page.goto(bridgeFile)
      // Wait for the bridge to redirect itself (1s animation + buffer)
      await page.waitForURL(cancelUrl, { timeout: 10000 }).catch(() => {
        // If auto-redirect didn't fire (e.g. file:// navigation blocked), go directly
        return page.goto(cancelUrl)
      })
    } else {
      await page.goto(cancelUrl)
    }

    await page.waitForLoadState('networkidle')

    // Scout: assess page difficulty with a single Gemini call
    const firstScreenshot = await page.screenshot({ type: 'png' })
    const firstBase64 = firstScreenshot.toString('base64')
    const scoutRating = await scoutDifficulty(firstBase64, manualDifficulty)
    const model = pickModel(scoutRating)

    console.log(`[scout] service=${serviceName} | rated=${scoutRating} | model=${model === 'claude' ? 'claude-opus-4-5' : 'gemini-2.5-flash'} | manual-fallback=${manualDifficulty}`)

    let stepCount = 0
    const maxSteps = 10

    // Re-use the already-taken first screenshot for step 0
    let currentBase64 = firstBase64

    while (stepCount < maxSteps) {
      const action = model === 'claude'
        ? await getNextActionClaude(currentBase64, `Cancel ${serviceName} subscription`, steps)
        : await getNextActionGemini(currentBase64, `Cancel ${serviceName} subscription`, steps)

      console.log(`[step ${stepCount + 1}] model=${model} action=${action.action} reason="${action.reason}"`)

      if (action.action === 'done') {
        clearTimeout(timeoutHandle)
        logCost(serviceName, model, stepCount + 1)
        await browser.close()
        return { success: true, message: `${serviceName} cancelled successfully`, model, stepsTaken: stepCount + 1, estimatedCost: calcCost(model) }
      }

      if (action.action === 'need_human') {
        clearTimeout(timeoutHandle)
        logCost(serviceName, model, stepCount + 1)
        await browser.close()
        return { success: false, message: `need_human — login required`, model, stepsTaken: stepCount + 1, estimatedCost: calcCost(model) }
      }

      if (action.action === 'click' && action.selector) {
        await page.click(action.selector).catch(() =>
          page.getByRole('button', { name: action.selector! }).click()
            .catch(() => page.getByRole('link', { name: action.selector! }).click()
              .catch(() => page.getByText(action.selector!, { exact: false }).first().click()))
        )
        await page.waitForTimeout(1500)
      }

      if (action.action === 'type' && action.selector && action.text) {
        await page.fill(action.selector, action.text)
        await page.waitForTimeout(500)
      }

      stepCount++

      // Take fresh screenshot for next step
      const next = await page.screenshot({ type: 'png' })
      currentBase64 = next.toString('base64')
    }

    clearTimeout(timeoutHandle)
    logCost(serviceName, model, maxSteps)
    return { success: false, message: 'Max steps reached — please complete manually', model, stepsTaken: maxSteps, estimatedCost: calcCost(model) }

  } catch (error) {
    clearTimeout(timeoutHandle)
    console.error('[playwright] error:', error)
    await browser.close().catch(() => {})
    return { success: false, message: 'Automation failed — opening page manually' }
  }
}
