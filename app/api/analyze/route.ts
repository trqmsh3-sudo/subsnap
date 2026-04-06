import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const PROMPT = `You are analyzing a redacted bank statement image. Extract every recurring subscription charge you can identify.

Return ONLY a valid JSON array — no markdown, no explanation, no wrapper object. Each element must have exactly these fields:
- name: string (service name, e.g. "Netflix", "Spotify")
- amount: string (as it appears, e.g. "$14.99", "₪59")
- frequency: "monthly" | "yearly" | "weekly" | "unknown"
- category: "streaming" | "software" | "gaming" | "news" | "fitness" | "other"

If no subscriptions are found, return an empty array: []

Example output:
[
  { "name": "Netflix", "amount": "$15.49", "frequency": "monthly", "category": "streaming" },
  { "name": "Spotify", "amount": "$9.99", "frequency": "monthly", "category": "streaming" }
]`

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ subscriptions: [] })
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/png', data: imageBase64 },
            },
            {
              type: 'text',
              text: PROMPT,
            },
          ],
        },
      ],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : '[]'
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const subscriptions = JSON.parse(cleaned)

    return NextResponse.json({ subscriptions: Array.isArray(subscriptions) ? subscriptions : [] })
  } catch (error) {
    console.error('[analyze] error:', error)
    return NextResponse.json({ subscriptions: [] })
  }
}
