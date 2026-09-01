import { NextRequest, NextResponse } from 'next/server'
import { findCancellationEntry, CANCELLATION_DB, CancellationEntry } from '@/lib/cancellationDb'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Redis } from '@upstash/redis'

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

const DYNAMIC_CACHE = new Map<string, CancellationEntry>()

async function verifyCandidateUrl(url: string, brandQuery: string = ''): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3500)
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })
    clearTimeout(timeout)

    // 1. Status check: 404, 410, 502, 503 are dead (401, 403, 302 indicate protected auth endpoints that exist!)
    if (res.status === 404 || res.status === 410 || res.status === 502 || res.status === 503) {
      return false
    }

    const text = (await res.text()).slice(0, 5000).toLowerCase()

    // 1.1 Soft 404 check (Modern SPA witty 404 pages)
    if (
      text.includes("even ai can't find this page") ||
      text.includes("even ai can’t find this page") ||
      text.includes("took a wrong turn") ||
      text.includes("lost in space") ||
      text.includes("looks like you're lost") ||
      text.includes("page not found") ||
      text.includes("404 not found") ||
      text.includes("this page doesn't exist") ||
      text.includes("this page doesn’t exist")
    ) {
      console.warn(`[URL Validator] REJECTED soft 404 / missing route: ${url}`)
      return false
    }

    // 2. Anti-Directory / Anti-Apache / Anti-Server Default check (Prevents index of / Apache listings)
    if (
      text.includes('index of /') ||
      text.includes('apache/2.') ||
      text.includes('directory listing for') ||
      text.includes('welcome to nginx') ||
      text.includes('iis windows server') ||
      text.includes('default web site page')
    ) {
      console.warn(`[URL Validator] REJECTED server directory listing: ${url}`)
      return false
    }

    // 3. Anti-Parked / Anti-Squatting check
    if (
      text.includes('domain for sale') ||
      text.includes('buy this domain') ||
      text.includes('this domain is parked') ||
      text.includes('hugedomains') ||
      text.includes('sedoparking') ||
      text.includes('namecheap.com/domains') ||
      text.includes('godaddy.com/domainsearch')
    ) {
      console.warn(`[URL Validator] REJECTED parked domain: ${url}`)
      return false
    }

    // 4. Brand Sanity check (Only if query is longer than 3 chars)
    const cleanBrand = brandQuery.toLowerCase().replace(/subscription|cancel|מנוי|ביטול/g, '').trim()
    if (cleanBrand.length >= 4) {
      const urlHost = new URL(url).hostname.toLowerCase()
      // If brand is not mentioned anywhere in host or page content, suspicious candidate!
      const mentionsBrand = urlHost.includes(cleanBrand) || text.includes(cleanBrand)
      if (!mentionsBrand) {
        console.warn(`[URL Validator] REJECTED domain without brand presence: ${url} for brand ${cleanBrand}`)
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

function ensureValidWebUrl(urlStr: string, fallbackName: string, secondaryCandidate?: string): string {
  try {
    const candidate = (urlStr || '').trim()
    if (candidate) {
      const u = new URL(candidate.startsWith('http') ? candidate : `https://${candidate}`)
      if (u.hostname && u.hostname.includes('.') && !u.hostname.endsWith('.') && u.hostname.length >= 4) {
        return u.toString()
      }
    }
  } catch {}

  if (secondaryCandidate) {
    try {
      const s = secondaryCandidate.trim()
      const u2 = new URL(s.startsWith('http') ? s : `https://${s}`)
      if (u2.hostname && u2.hostname.includes('.') && !u2.hostname.endsWith('.') && u2.hostname.length >= 4) {
        return u2.origin
      }
    } catch {}
  }

  return `https://www.google.com/search?q=${encodeURIComponent('how to cancel ' + fallbackName + ' subscription')}`
}

function isCachedEntryValid(entry: any): boolean {
  if (!entry || !entry.cancelUrl) return false
  try {
    const u = new URL(entry.cancelUrl.startsWith('http') ? entry.cancelUrl : `https://${entry.cancelUrl}`)
    return !!(u.hostname && u.hostname.includes('.') && !u.hostname.endsWith('.') && u.hostname.length >= 4)
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''
  const force = searchParams.get('force') === 'true'

  if (!query.trim()) {
    return NextResponse.json({ entry: null })
  }

  const qLower = query.toLowerCase().trim()

  // 1. Direct verified matching from primary CANCELLATION_DB (highest source of truth)
  const directMatch = findCancellationEntry(query)
  if (directMatch) {
    return NextResponse.json({ entry: directMatch, source: 'static_db' })
  }

  // 2. Simple fuzzy keyword search in CANCELLATION_DB
  for (const item of CANCELLATION_DB) {
    if (item.keywords.some((k) => qLower.includes(k) || k.includes(qLower))) {
      return NextResponse.json({ entry: item, source: 'fuzzy_db' })
    }
  }

  // 3. Check Global Redis Distributed Cache (unless force re-scan requested)
  if (!force && redis) {
    try {
      const cached = await redis.get<CancellationEntry>(`scout:${qLower}`)
      if (cached) {
        if (isCachedEntryValid(cached)) {
          return NextResponse.json({ entry: cached, source: 'global_redis_cache' })
        } else {
          // Corrupted entry (e.g. https://formspr) - auto-purge from Redis!
          try { await redis.del(`scout:${qLower}`) } catch {}
        }
      }
    } catch {}
  }

  // 4. Check local in-memory cache (unless force re-scan requested)
  if (!force && DYNAMIC_CACHE.has(qLower)) {
    const mem = DYNAMIC_CACHE.get(qLower)
    if (isCachedEntryValid(mem)) {
      return NextResponse.json({ entry: mem, source: 'cache' })
    } else {
      DYNAMIC_CACHE.delete(qLower)
    }
  }

  // 5. AUTONOMOUS AI SCOUT (Gemini 2.5 Flash)
  const apiKey = process.env.GEMINI_API_KEY
  if (apiKey) {
    try {
      const genai = new GoogleGenerativeAI(apiKey)
      const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

      const prompt = `You are SubSnap Autonomous Subscription Cancellation AI Scout.
Analyze this user query / website / service name: "${query}".

First, determine whether this website/service actually operates a recurring paid subscription model (e.g. Netflix, Spotify, ChatGPT Plus, SaaS tools) OR if it is a free service/community/hackathon/informational site WITHOUT paid subscriptions (e.g. Lablab.ai, Wikipedia, Ynet, free open-source tools).

Return ONLY a valid JSON object matching this schema (no markdown, no backticks, no other text):
{
  "name": "Exact Service Name in English",
  "nameHe": "שם השירות בעברית",
  "isSubscriptionService": true or false,
  "serviceType": "subscription" or "free_community_or_content",
  "loginUrl": "https://service.com/login",
  "cancelUrl": "https://service.com/settings/billing or direct cancellation endpoint, or root URL if no subscriptions",
  "notes": "Direct cancellation pathway instructions, or clear notice if this platform has no subscriptions",
  "difficulty": "easy" or "hard",
  "steps": [
    "Step 1",
    "Step 2"
  ]
}
`

      const aiResponse = await model.generateContent([prompt])
      const text = aiResponse.response.text().trim()
      
      const cleanJson = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
      const parsed = JSON.parse(cleanJson)

      if (parsed && (parsed.cancelUrl || parsed.loginUrl)) {
        let verifiedCancelUrl = ensureValidWebUrl(parsed.cancelUrl, parsed.name || query, parsed.loginUrl)
        if (parsed.isSubscriptionService !== false) {
          const isCancelAlive = await verifyCandidateUrl(verifiedCancelUrl, query)
          if (!isCancelAlive) {
            console.warn(`[AI Scout Pre-flight Guard]: Candidate URL failed sanity check: ${verifiedCancelUrl}`)
            // Fallback to domain root extracted safely from loginUrl or cancelUrl
            verifiedCancelUrl = ensureValidWebUrl('', parsed.name || query, parsed.loginUrl || parsed.cancelUrl)
          }
        }

        const safeLoginUrl = ensureValidWebUrl(parsed.loginUrl || '', parsed.name || query, verifiedCancelUrl)

        const entry: CancellationEntry & { isSubscriptionService?: boolean } = {
          name: parsed.name || query,
          nameHe: parsed.nameHe || parsed.name || query,
          keywords: [qLower, (parsed.name || '').toLowerCase(), (parsed.nameHe || '').toLowerCase()],
          loginUrl: safeLoginUrl,
          cancelUrl: verifiedCancelUrl,
          method: 'url',
          notes: parsed.notes || 'Official billing and cancellation pathway',
          difficulty: parsed.difficulty === 'hard' ? 'hard' : 'easy',
          tier: 'auto',
          steps: Array.isArray(parsed.steps) ? parsed.steps : ['Go to account settings', 'Click cancel subscription', 'Confirm']
        }
        if (parsed.isSubscriptionService === false) {
          entry.isSubscriptionService = false
        }

        if (redis && isCachedEntryValid(entry)) {
          try {
            await redis.set(`scout:${qLower}`, entry)
            if (parsed.name) await redis.set(`scout:${parsed.name.toLowerCase()}`, entry)
          } catch {}
        }

        if (isCachedEntryValid(entry)) {
          DYNAMIC_CACHE.set(qLower, entry)
          if (parsed.name) DYNAMIC_CACHE.set(parsed.name.toLowerCase(), entry)
        }

        return NextResponse.json({ entry, source: 'ai_scout_persisted' })
      }
    } catch (err) {
      console.warn('[AI Scout Error]:', err)
    }
  }

  // 6. Smart Heuristic Fallback (Strictly for actual domains with dots & TLDs like domain.com)
  const cleanDomain = query.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim()
  const isDomain = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(cleanDomain)

  if (isDomain) {
    const candidateBilling = `https://${cleanDomain}/settings/billing`
    const isBillingAlive = await verifyCandidateUrl(candidateBilling, cleanDomain)
    const targetUrl = isBillingAlive ? candidateBilling : `https://${cleanDomain}`

    const heuristicEntry: CancellationEntry = {
      name: cleanDomain,
      nameHe: cleanDomain,
      keywords: [qLower, cleanDomain],
      loginUrl: `https://${cleanDomain}/login`,
      cancelUrl: targetUrl,
      method: 'url',
      notes: isBillingAlive ? `Direct verified navigation to ${cleanDomain} billing settings` : `Official site for ${cleanDomain}`,
      difficulty: 'easy',
      tier: 'auto',
      steps: [
        `Navigate to account settings on ${cleanDomain}`,
        'Check subscription or billing status',
        'Confirm cancellation if subscribed'
      ]
    }

    if (redis) {
      try {
        await redis.set(`scout:${qLower}`, heuristicEntry)
      } catch {}
    }
    DYNAMIC_CACHE.set(qLower, heuristicEntry)
    return NextResponse.json({ entry: heuristicEntry, source: 'heuristic_domain' })
  }

  return NextResponse.json({
    entry: {
      name: query,
      loginUrl: `https://www.google.com/search?q=${encodeURIComponent(query + ' login')}`,
      cancelUrl: `https://www.google.com/search?q=${encodeURIComponent('how to cancel ' + query + ' subscription')}`,
      method: 'url',
      difficulty: 'easy',
      tier: 'manual',
      notes: 'Searching official cancellation pathway',
    },
    source: 'fallback'
  })
}
