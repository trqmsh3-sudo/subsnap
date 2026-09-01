import express from 'express'
import { chromium } from 'playwright'
import { GoogleGenerativeAI } from '@google/generative-ai'

const app = express()
app.use(express.json({ limit: '10mb' }))

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Log env var presence at startup
console.log('[startup] GEMINI_API_KEY set:', !!process.env.GEMINI_API_KEY)

// ─── Scout ────────────────────────────────────────────────────────────────────

async function scoutDifficulty(screenshotBase64, fallback) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const result = await model.generateContent([
        { inlineData: { mimeType: 'image/png', data: screenshotBase64 } },
        `Look at this cancellation page screenshot. Rate the complexity: reply with only one word: easy, medium, or hard.
Easy = direct cancel button visible. Medium = multi-step flow. Hard = chat required, phone required, or heavy dark patterns.`,
      ])
      const rating = result.response.text().trim().toLowerCase()
      console.log(`[scout] raw response: "${rating}"`)
      if (rating === 'easy' || rating === 'medium' || rating === 'hard') return rating
      console.warn(`[scout] unexpected rating "${rating}", using fallback: ${fallback}`)
      return fallback
    } catch (err) {
      const status = err?.status ?? 'n/a'
      const msg = err?.message ?? String(err)
      console.error(`[scout] Gemini FAILED — status=${status} message="${msg}"`)
    }
  }

  console.warn(`[scout] GEMINI_API_KEY not configured or failed, using fallback: ${fallback}`)
  return fallback
}

// ─── Action prompt ────────────────────────────────────────────────────────────

function buildPrompt(goal, steps) {
  const stepsBlock = steps?.length
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

If you see a login form with empty fields, return need_human.
If cancellation is complete or a confirmation message is shown, return done.
If you see a cancel/unsubscribe/end membership button, click it.
Prefer clicking by visible text (e.g. "End membership") over CSS selectors.`
}

function parseAction(raw) {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

// ─── AI action getter ─────────────────────────────────────────────────────────

async function getNextActionGemini(screenshotBase64, goal, steps) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not set in server environment')
  }
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent([
    { inlineData: { mimeType: 'image/png', data: screenshotBase64 } },
    buildPrompt(goal, steps),
  ])
  const raw = result.response.text()
  try {
    return parseAction(raw)
  } catch {
    console.error('[gemini] failed to parse JSON:', raw.slice(0, 200))
    throw new Error(`Gemini returned non-JSON response: ${raw.slice(0, 100)}`)
  }
}

// ─── Core cancel logic ────────────────────────────────────────────────────────

async function runCancel(cancelUrl, serviceName, difficulty, steps) {
  console.log(`[playwright] launching browser for ${serviceName}`)
  let browser
  let timeoutHandle

  try {
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    const timeoutMs = 90_000
    timeoutHandle = setTimeout(async () => {
      console.warn(`[playwright] ${timeoutMs / 1000}s timeout — closing browser`)
      await browser.close().catch(() => {})
    }, timeoutMs)

    console.log(`[playwright] navigating to ${cancelUrl}`)
    await page.goto(cancelUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    console.log('[playwright] page loaded, taking screenshot')

    const firstShot = await page.screenshot({ type: 'png' })
    const firstBase64 = firstShot.toString('base64')

    const scoutRating = await scoutDifficulty(firstBase64, difficulty)
    const modelName = 'gemini-2.5-flash'
    console.log(`[scout] service=${serviceName} | rated=${scoutRating} | model=${modelName}`)

    let stepCount = 0
    const maxSteps = 10
    let currentBase64 = firstBase64

    while (stepCount < maxSteps) {
      console.log(`[step ${stepCount + 1}] getting next action from ${modelName}`)
      const action = await getNextActionGemini(currentBase64, `Cancel ${serviceName} subscription`, steps)

      console.log(`[step ${stepCount + 1}] action=${action.action} reason="${action.reason}"`)

      if (action.action === 'done') {
        clearTimeout(timeoutHandle)
        await browser.close()
        return { success: true, message: `${serviceName} cancelled successfully`, model: modelName, stepsTaken: stepCount + 1, estimatedCost: 0 }
      }

      if (action.action === 'need_human') {
        clearTimeout(timeoutHandle)
        await browser.close()
        return { success: false, message: 'need_human — login required', model: modelName, stepsTaken: stepCount + 1, estimatedCost: 0 }
      }

      if (action.action === 'click' && action.selector) {
        await page.click(action.selector).catch(() =>
          page.getByRole('button', { name: action.selector }).click()
            .catch(() => page.getByRole('link', { name: action.selector }).click()
              .catch(() => page.getByText(action.selector, { exact: false }).first().click()))
        )
        await page.waitForTimeout(1500)
      }

      if (action.action === 'type' && action.selector && action.text) {
        await page.fill(action.selector, action.text)
        await page.waitForTimeout(500)
      }

      stepCount++
      const next = await page.screenshot({ type: 'png' })
      currentBase64 = next.toString('base64')
    }

    clearTimeout(timeoutHandle)
    return { success: false, message: 'Max steps reached — please complete manually', model: modelName, stepsTaken: maxSteps, estimatedCost: 0 }

  } catch (error) {
    clearTimeout(timeoutHandle)
    const msg = error?.message ?? String(error)
    console.error('[playwright] error:', msg)
    if (browser) await browser.close().catch(() => {})
    return { success: false, message: `Automation error: ${msg}` }
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

app.get('/debug', (_req, res) => {
  res.json({
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    NODE_VERSION: process.version,
  })
})

app.post('/cancel', async (req, res) => {
  const { serviceName, cancelUrl, difficulty = 'easy', steps } = req.body

  if (!serviceName || !cancelUrl) {
    return res.status(400).json({ success: false, message: 'serviceName and cancelUrl are required' })
  }

  console.log(`[cancel] serviceName=${serviceName} | url=${cancelUrl} | difficulty=${difficulty}`)

  const result = await runCancel(cancelUrl, serviceName, difficulty, steps)
  return res.json(result)
})

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`[server] SubSnap Railway server running on port ${PORT}`)
})
