import express from 'express'
import { chromium } from 'playwright'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const app = express()
app.use(express.json({ limit: '10mb' }))

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ─── Cost constants ───────────────────────────────────────────────────────────

const COST = {
  scoutCall: 0.000025,
  geminiCancel: 0.15,
  claudeCancel: 0.75,
}

function calcCost(model) {
  return COST.scoutCall + (model === 'claude' ? COST.claudeCancel : COST.geminiCancel)
}

function logCost(serviceName, model, steps) {
  const total = calcCost(model).toFixed(6)
  console.log(`[cost] service=${serviceName} | model=${model} | steps=${steps} | estimated=$${total}`)
}

// ─── Scout ────────────────────────────────────────────────────────────────────

async function scoutDifficulty(screenshotBase64, fallback) {
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
    console.error(`[scout] FAILED — status=${status} message="${msg}"`)
    console.warn(`[scout] using manual fallback: ${fallback}`)
    return fallback
  }
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

// ─── AI action getters ────────────────────────────────────────────────────────

async function getNextActionClaude(screenshotBase64, goal, steps) {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: screenshotBase64 } },
        { type: 'text', text: buildPrompt(goal, steps) },
      ],
    }],
  })
  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  return parseAction(raw)
}

async function getNextActionGemini(screenshotBase64, goal, steps) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent([
    { inlineData: { mimeType: 'image/png', data: screenshotBase64 } },
    buildPrompt(goal, steps),
  ])
  return parseAction(result.response.text())
}

// ─── Core cancel logic ────────────────────────────────────────────────────────

async function runCancel(cancelUrl, serviceName, difficulty, steps) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const timeoutMs = 90_000
  const timeoutHandle = setTimeout(async () => {
    console.warn(`[playwright] ${timeoutMs / 1000}s timeout — closing browser`)
    await browser.close().catch(() => {})
  }, timeoutMs)

  try {
    await page.goto(cancelUrl)
    await page.waitForLoadState('networkidle')

    const firstShot = await page.screenshot({ type: 'png' })
    const firstBase64 = firstShot.toString('base64')

    const scoutRating = await scoutDifficulty(firstBase64, difficulty)
    const model = scoutRating === 'hard' ? 'claude' : 'gemini'
    console.log(`[scout] service=${serviceName} | rated=${scoutRating} | model=${model === 'claude' ? 'claude-opus-4-5' : 'gemini-2.5-flash'}`)

    let stepCount = 0
    const maxSteps = 10
    let currentBase64 = firstBase64

    while (stepCount < maxSteps) {
      const action = model === 'claude'
        ? await getNextActionClaude(currentBase64, `Cancel ${serviceName} subscription`, steps)
        : await getNextActionGemini(currentBase64, `Cancel ${serviceName} subscription`, steps)

      console.log(`[step ${stepCount + 1}] action=${action.action} reason="${action.reason}"`)

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
        return { success: false, message: 'need_human — login required', model, stepsTaken: stepCount + 1, estimatedCost: calcCost(model) }
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
    logCost(serviceName, model, maxSteps)
    return { success: false, message: 'Max steps reached — please complete manually', model, stepsTaken: maxSteps, estimatedCost: calcCost(model) }

  } catch (error) {
    clearTimeout(timeoutHandle)
    console.error('[playwright] error:', error)
    await browser.close().catch(() => {})
    return { success: false, message: 'Automation failed — please complete manually' }
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
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

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`[server] SubSnap Railway server running on port ${PORT}`)
})
