import { NextRequest, NextResponse } from 'next/server'
import { findCancellationEntry, CANCELLATION_DB, CancellationEntry } from '@/lib/cancellationDb'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Dynamic runtime cache for newly discovered services by AI Scout
const DYNAMIC_CACHE = new Map<string, CancellationEntry>()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''

  if (!query.trim()) {
    return NextResponse.json({ entry: null })
  }

  const qLower = query.toLowerCase().trim()

  // 1. Check dynamic cache (previously discovered by AI)
  if (DYNAMIC_CACHE.has(qLower)) {
    return NextResponse.json({ entry: DYNAMIC_CACHE.get(qLower), source: 'cache' })
  }

  // 2. Direct local matching from static DB
  const directMatch = findCancellationEntry(query)
  if (directMatch) {
    return NextResponse.json({ entry: directMatch, source: 'static_db' })
  }

  // 3. Simple fuzzy keyword search
  for (const item of CANCELLATION_DB) {
    if (item.keywords.some((k) => qLower.includes(k) || k.includes(qLower))) {
      return NextResponse.json({ entry: item, source: 'fuzzy_db' })
    }
  }

  // 4. AUTONOMOUS AI SCOUT (Gemini 2.5 Flash)
  const apiKey = process.env.GEMINI_API_KEY
  if (apiKey) {
    try {
      const genai = new GoogleGenerativeAI(apiKey)
      const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

      const prompt = `You are SubSnap Autonomous Subscription Cancellation AI Scout.
Analyze this user query / website / service name: "${query}".

Extract the exact direct subscription cancellation URL, login URL, and Hebrew step-by-step cancellation instructions.

Return ONLY a valid JSON object matching this schema (no markdown, no backticks, no other text):
{
  "name": "Exact Service Name in English",
  "nameHe": "שם השירות בעברית (למשל: רידווייז, לום, ליניאר)",
  "loginUrl": "https://service.com/login",
  "cancelUrl": "https://service.com/settings/billing or direct cancellation endpoint",
  "notes": "הסבר תמציתי בעברית על אופן הביטול",
  "difficulty": "easy" or "hard",
  "steps": [
    "שלב 1 בעברית",
    "שלב 2 בעברית",
    "שלב 3 בעברית"
  ]
}

If it is an unknown arbitrary domain like "example.io", deduce the standard settings/billing route (e.g. https://example.io/settings/billing or https://example.io/account).
`

      const aiResponse = await model.generateContent([prompt])
      const text = aiResponse.response.text().trim()
      
      // Clean possible markdown code fences
      const cleanJson = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
      const parsed = JSON.parse(cleanJson)

      if (parsed && parsed.cancelUrl) {
        const entry: CancellationEntry = {
          name: parsed.name || query,
          nameHe: parsed.nameHe || parsed.name || query,
          keywords: [qLower, (parsed.name || '').toLowerCase(), (parsed.nameHe || '').toLowerCase()],
          loginUrl: parsed.loginUrl || `https://${qLower.replace(/^https?:\/\//, '')}/login`,
          cancelUrl: parsed.cancelUrl,
          method: 'url',
          notes: parsed.notes || 'עמוד ניהול וביטול מנוי',
          difficulty: parsed.difficulty === 'hard' ? 'hard' : 'easy',
          tier: 'auto',
          steps: Array.isArray(parsed.steps) ? parsed.steps : ['נכנסים להגדרות החשבון', 'בוחרים בניהול מנוי / ביטול', 'מאשרים את הפעולה']
        }

        // Cache in memory for instant subsequent lookups
        DYNAMIC_CACHE.set(qLower, entry)
        if (parsed.name) DYNAMIC_CACHE.set(parsed.name.toLowerCase(), entry)

        return NextResponse.json({ entry, source: 'ai_scout' })
      }
    } catch (err) {
      console.warn('[AI Scout Error]:', err)
    }
  }

  // 5. Smart Heuristic Fallback for arbitrary domain input (e.g. "something.io" or "app.xyz")
  const isDomain = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(query) || query.includes('http')
  const cleanDomain = query.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim()

  if (isDomain) {
    const heuristicEntry: CancellationEntry = {
      name: cleanDomain,
      nameHe: cleanDomain,
      keywords: [qLower, cleanDomain],
      loginUrl: `https://${cleanDomain}/login`,
      cancelUrl: `https://${cleanDomain}/settings/billing`,
      method: 'url',
      notes: `מעבר ישיר להגדרות החיוב של ${cleanDomain}`,
      difficulty: 'easy',
      tier: 'auto',
      steps: [
        `נכנסים להגדרות החשבון (Billing) ב-${cleanDomain}`,
        'לוחצים על Cancel Subscription או Manage Plan',
        'מאשרים את הביטול'
      ]
    }
    DYNAMIC_CACHE.set(qLower, heuristicEntry)
    return NextResponse.json({ entry: heuristicEntry, source: 'heuristic_domain' })
  }

  // Default fallback
  return NextResponse.json({
    entry: {
      name: query,
      loginUrl: `https://www.google.com/search?q=${encodeURIComponent(query + ' login')}`,
      cancelUrl: `https://www.google.com/search?q=${encodeURIComponent('how to cancel ' + query + ' subscription')}`,
      method: 'url',
      difficulty: 'easy',
      tier: 'manual',
      notes: 'חיפוש עמוד ביטול רשמי',
    },
    source: 'fallback'
  })
}
