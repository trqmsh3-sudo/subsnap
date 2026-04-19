# Credit Gate & Scan Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate the AI scan behind a free-scan-per-user allowance + paid credits, and log every scan result to Redis so refund eligibility can be verified.

**Architecture:** A persistent anonymous userId is generated in localStorage on first visit. Every call to `/api/analyze` includes that userId. The server checks Redis: if the user has never scanned, allow for free and mark it used; otherwise require 1 credit. After every scan the result count is written to Redis for refund auditing. The first cancellation guide remains separately free via the existing `hasFreeCancel` system.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Upstash Redis (@upstash/redis), localStorage for userId persistence.

---

## Business Rules (reference)

| Action | Cost |
|--------|------|
| First document scan | Free |
| First cancellation guide | Free (existing `hasFreeCancel`) |
| Additional scans OR full cancellations on same doc | 1 credit ($5) |
| Credit grants | Lemon Squeezy webhook → `addCredits(userId, 1)` |

---

## Files

| File | Change |
|------|--------|
| `lib/userId.ts` | **Create** — generate + persist anonymous UUID in localStorage |
| `lib/credits.ts` | **Modify** — add `hasFreeScan`, `useFreeScan`, `logScanResult`, `getScanLog` |
| `app/api/analyze/route.ts` | **Modify** — accept userId, check free scan / credits, log result |
| `app/app/page.tsx` | **Modify** — generate userId client-side, pass to analyze fetch and PricingCards |

---

## Task 1: Create lib/userId.ts — persistent anonymous user identity

**Files:**
- Create: `lib/userId.ts`

- [ ] **Step 1: Create the file**

```ts
// lib/userId.ts
const KEY = 'subsnap_user_id'

export function getUserId(): string {
  if (typeof window === 'undefined') return 'anonymous'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add lib/userId.ts
git commit -m "feat: add persistent anonymous userId to localStorage"
```

---

## Task 2: Add free scan tracking and scan logging to lib/credits.ts

**Files:**
- Modify: `lib/credits.ts`

The file currently exports: `getCredits`, `addCredits`, `deductCredit`, `hasFreeCancel`, `useFreeCancel`.

Add four new exports after `useFreeCancel`:

- [ ] **Step 1: Add the four new functions**

Open `lib/credits.ts`. After the `useFreeCancel` function, add:

```ts
// ─── Free scan (one per user, separate from free cancel) ─────────────────────

export async function hasFreeScan(userId: string): Promise<boolean> {
  const used = await redis.get<boolean>(`free_scan:${userId}`)
  return !used
}

export async function useFreeScan(userId: string): Promise<void> {
  await redis.set(`free_scan:${userId}`, true)
}

// ─── Scan result logging (for refund verification) ────────────────────────────

export async function logScanResult(userId: string, count: number): Promise<void> {
  const entry = JSON.stringify({ count, at: new Date().toISOString() })
  await redis.lpush(`scan_log:${userId}`, entry)
  await redis.ltrim(`scan_log:${userId}`, 0, 19) // keep last 20 entries
}

export async function getScanLog(userId: string): Promise<Array<{ count: number; at: string }>> {
  const raw = await redis.lrange<string>(`scan_log:${userId}`, 0, 19)
  return raw.map((r) => {
    try { return JSON.parse(r) } catch { return { count: 0, at: '' } }
  })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add lib/credits.ts
git commit -m "feat: add free scan tracking and scan result logging to credits"
```

---

## Task 3: Gate /api/analyze with credit check and result logging

**Files:**
- Modify: `app/api/analyze/route.ts`

The full new file content — replace the entire file:

- [ ] **Step 1: Replace app/api/analyze/route.ts**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { analyzeRatelimit, logBlocked } from '@/lib/ratelimit'
import { hasFreeScan, useFreeScan, deductCredit, getCredits, logScanResult } from '@/lib/credits'

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
  // ── Rate limit by IP ──────────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const { success, reset } = await analyzeRatelimit.limit(ip)
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000)
    await logBlocked(ip, '/api/analyze', retryAfter)
    return NextResponse.json(
      { error: 'Too many requests', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  const { imageBase64, userId } = await req.json()

  if (!imageBase64) {
    return NextResponse.json({ subscriptions: [] })
  }

  // ── Credit gate ───────────────────────────────────────────────────────────
  const uid = typeof userId === 'string' && userId.length > 0 ? userId : 'anonymous'

  const free = await hasFreeScan(uid)
  if (free) {
    await useFreeScan(uid)
  } else {
    const credits = await getCredits(uid)
    if (credits <= 0) {
      return NextResponse.json(
        { error: 'No credits', message: 'Purchase a scan credit to continue.' },
        { status: 402 }
      )
    }
    await deductCredit(uid)
  }

  // ── AI analysis ───────────────────────────────────────────────────────────
  try {
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent([
      PROMPT,
      { inlineData: { mimeType: 'image/png', data: imageBase64 } },
    ])

    const raw = result.response.text()
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const subscriptions = JSON.parse(cleaned)
    const list = Array.isArray(subscriptions) ? subscriptions : []

    // Log result for refund verification
    await logScanResult(uid, list.length)

    return NextResponse.json({ subscriptions: list })
  } catch (error) {
    console.error('[analyze] error:', error)
    return NextResponse.json({ subscriptions: [] })
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/api/analyze/route.ts
git commit -m "feat: gate analyze route with free scan check and credit deduction"
```

---

## Task 4: Wire userId in dashboard page

**Files:**
- Modify: `app/app/page.tsx`

The dashboard needs to:
1. Generate/read the userId client-side on mount
2. Pass userId to the analyze fetch call
3. Pass userId to `<PricingCards />`
4. Show a "no credits" error if the API returns 402

- [ ] **Step 1: Update app/app/page.tsx**

Read the current file first. Then make these targeted changes:

**a) Add userId state (after the existing `useState` declarations, around line 40):**

```tsx
const [userId, setUserId] = useState<string>('anonymous')

useEffect(() => {
  import('@/lib/userId').then(({ getUserId }) => setUserId(getUserId()))
}, [])
```

Add `useEffect` to the existing React import: `import { useState, useCallback, useEffect } from 'react'`

**b) Update handleRedacted to pass userId and handle 402 (replace existing handleRedacted):**

```tsx
const handleRedacted = useCallback(async (base64: string) => {
  setAnalyzing(true)
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64, userId }),
    })
    if (res.status === 402) {
      setSubscriptions([])
      setAnalyzed(true)
      alert('You\'ve used your free scan. Purchase a credit to scan again.')
      return
    }
    const data = await res.json()
    setSubscriptions(data.subscriptions ?? [])
  } finally {
    setAnalyzing(false)
    setAnalyzed(true)
  }
}, [userId])
```

**c) Pass userId to PricingCards (find `<PricingCards />` and update it):**

```tsx
<PricingCards userId={userId} />
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/app/page.tsx
git commit -m "feat: pass userId to analyze API and PricingCards from dashboard"
```

---

## Task 5: End-to-end verification

**Files:** None modified — verification only.

- [ ] **Step 1: Restart dev server**

Kill and restart to pick up the new code:
```bash
npx kill-port 3000 2>/dev/null || true
npm run dev &
sleep 8
```

- [ ] **Step 2: Test first scan is free**

Use a fresh test userId:
```bash
curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==","userId":"verify-test-001"}'
```

Expected: `{"subscriptions":[]}` with status 200 (not 402).

- [ ] **Step 3: Test second scan requires credit**

Same userId, second request:
```bash
curl -s -w "\nHTTP:%{http_code}" -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==","userId":"verify-test-001"}'
```

Expected: `{"error":"No credits","message":"Purchase a scan credit to continue."}` with `HTTP:402`.

- [ ] **Step 4: Test scan log was written**

```bash
npx tsx -e "
import { getScanLog } from './lib/credits';
getScanLog('verify-test-001').then(log => {
  console.log('scan log:', JSON.stringify(log, null, 2));
  process.exit(0);
});
"
```

Expected: one entry with `count: 0` (1x1 white PNG has no subscriptions) and a timestamp.

- [ ] **Step 5: Test credit grants access**

Add 1 credit to the test user and verify scan works again:
```bash
npx tsx -e "
import { addCredits } from './lib/credits';
addCredits('verify-test-001', 1).then(() => {
  console.log('credit added');
  process.exit(0);
});
"
```

Then re-run the scan from Step 3. Expected: `{"subscriptions":[]}` with status 200.

- [ ] **Step 6: Clean up test user data**

```bash
npx tsx -e "
import { Redis } from '@upstash/redis';
const r = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! });
Promise.all([
  r.del('free_scan:verify-test-001'),
  r.del('credits:verify-test-001'),
  r.del('scan_log:verify-test-001'),
]).then(() => { console.log('cleaned'); process.exit(0); });
"
```

- [ ] **Step 7: Final TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "chore: credit gate verified end-to-end"
```

---

## How to verify a refund request

When a customer emails claiming "nothing was found":

1. Get their order ID from Lemon Squeezy dashboard
2. Find their userId from the order's custom data (stored in LS checkout metadata)
3. Run:

```bash
npx tsx -e "
import { getScanLog } from './lib/credits';
getScanLog('THEIR-USER-ID').then(log => {
  console.log(JSON.stringify(log, null, 2));
  process.exit(0);
});
"
```

4. If every entry shows `count: 0` → refund. If any entry shows `count > 0` → the scan worked.
