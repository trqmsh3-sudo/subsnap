import { NextRequest, NextResponse } from 'next/server'
import { findCancellationEntry, CANCELLATION_DB } from '@/lib/cancellationDb'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''

  if (!query.trim()) {
    return NextResponse.json({ entry: null })
  }

  // 1. Direct local matching
  const directMatch = findCancellationEntry(query)
  if (directMatch) {
    return NextResponse.json({ entry: directMatch })
  }

  // 2. Try simple fuzzy search against top services
  const qLower = query.toLowerCase()
  for (const item of CANCELLATION_DB) {
    if (item.keywords.some((k) => qLower.includes(k) || k.includes(qLower))) {
      return NextResponse.json({ entry: item })
    }
  }

  // 3. AI intent resolution if Gemini API key exists
  if (process.env.GEMINI_API_KEY) {
    try {
      const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const result = await model.generateContent([
        `The user entered this cancellation request: "${query}".
Identify the exact brand or service name they want to cancel (e.g. "Netflix", "Spotify", "Grok", "Adobe", "Amazon Prime", "Canva").
Return ONLY the service name in English, nothing else. If unknown, return "Unknown".`,
      ])
      const resolvedName = result.response.text().trim()
      if (resolvedName && resolvedName !== 'Unknown') {
        const aiMatch = findCancellationEntry(resolvedName)
        if (aiMatch) {
          return NextResponse.json({ entry: aiMatch, resolvedAs: resolvedName })
        }
        return NextResponse.json({
          entry: {
            name: resolvedName,
            loginUrl: `https://www.google.com/search?q=${encodeURIComponent(resolvedName + ' login')}`,
            cancelUrl: `https://www.google.com/search?q=${encodeURIComponent('how to cancel ' + resolvedName + ' subscription')}`,
            method: 'url',
            difficulty: 'easy',
            tier: 'manual',
            notes: `Direct search for ${resolvedName} cancellation`,
          },
          resolvedAs: resolvedName,
        })
      }
    } catch (err) {
      console.warn('[lookup] Gemini intent extraction fallback failed:', err)
    }
  }

  // Fallback google search deep link
  return NextResponse.json({
    entry: {
      name: query,
      loginUrl: `https://www.google.com/search?q=${encodeURIComponent(query + ' login')}`,
      cancelUrl: `https://www.google.com/search?q=${encodeURIComponent('how to cancel ' + query + ' subscription')}`,
      method: 'url',
      difficulty: 'easy',
      tier: 'manual',
      notes: 'Search for cancellation portal',
    },
  })
}
