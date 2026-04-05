import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json()

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `Analyze this bank or credit card statement and extract all recurring subscriptions.
Return ONLY a JSON array, no explanation:
[{ "name": string, "amount": string, "frequency": string, "category": string }]
frequency: monthly | yearly | weekly
category: streaming | software | fitness | news | gaming | other`,
          },
        ],
      },
    ],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : '[]'
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    const subscriptions = JSON.parse(cleaned)
    return NextResponse.json({ subscriptions })
  } catch {
    console.error('Claude parse error:', cleaned)
    return NextResponse.json({ subscriptions: [] })
  }
}
