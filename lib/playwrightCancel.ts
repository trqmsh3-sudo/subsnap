import { chromium } from 'playwright'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const anthropic = new Anthropic()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const PROMPT = (goal: string) => `You are helping cancel a subscription. Goal: ${goal}

Analyze this screenshot and return ONLY a JSON object:
{
  "action": "click" | "type" | "wait" | "done" | "need_human",
  "selector": "CSS selector or text to find element" (if click/type),
  "text": "text to type" (if type),
  "reason": "brief explanation"
}

If you see a login form, return need_human.
If cancellation is complete, return done.
If you see a cancel/unsubscribe button, click it.`

async function getNextActionClaude(screenshotBase64: string, goal: string): Promise<{
  action: 'click' | 'type' | 'wait' | 'done' | 'need_human'
  selector?: string
  text?: string
  reason: string
}> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: screenshotBase64 } },
        { type: 'text', text: PROMPT(goal) },
      ]
    }]
  })
  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

async function getNextActionGemini(screenshotBase64: string, goal: string): Promise<{
  action: 'click' | 'type' | 'wait' | 'done' | 'need_human'
  selector?: string
  text?: string
  reason: string
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContent([
    { inlineData: { mimeType: 'image/png', data: screenshotBase64 } },
    PROMPT(goal),
  ])
  const raw = result.response.text()
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

async function getNextAction(
  screenshotBase64: string,
  goal: string,
  difficulty: 'easy' | 'hard'
) {
  if (difficulty === 'hard') {
    return getNextActionClaude(screenshotBase64, goal)
  }
  return getNextActionGemini(screenshotBase64, goal)
}

export async function cancelSubscription(
  cancelUrl: string,
  serviceName: string,
  difficulty: 'easy' | 'hard' = 'easy'
): Promise<{ success: boolean; message: string }> {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    await page.goto(cancelUrl)
    await page.waitForLoadState('networkidle')

    let steps = 0
    const maxSteps = 10

    while (steps < maxSteps) {
      const screenshot = await page.screenshot({ type: 'png' })
      const base64 = screenshot.toString('base64')

      const action = await getNextAction(base64, `Cancel ${serviceName} subscription`, difficulty)
      console.log(`Step ${steps + 1}:`, action)

      if (action.action === 'done') {
        await browser.close()
        return { success: true, message: `${serviceName} cancelled successfully` }
      }

      if (action.action === 'need_human') {
        return { success: true, message: `Please complete login in the browser window, then the process will continue` }
      }

      if (action.action === 'click' && action.selector) {
        await page.click(action.selector).catch(() =>
          page.getByText(action.selector!).click()
        )
        await page.waitForTimeout(1500)
      }

      if (action.action === 'type' && action.selector && action.text) {
        await page.fill(action.selector, action.text)
        await page.waitForTimeout(500)
      }

      steps++
    }

    return { success: false, message: 'Max steps reached — please complete manually' }

  } catch (error) {
    console.error('Playwright error:', error)
    await browser.close()
    return { success: false, message: 'Automation failed — opening page manually' }
  }
}
