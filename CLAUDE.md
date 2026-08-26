# SubSnap — Privacy-First Subscription Canceller

## Core Rules
- Always local redaction first — never send raw bank data to server
- Playwright must use stealth mode in production
- Every Cancel must have a fallback deep-link if automation fails
- Never store credentials plain text
- Credit gate must run before AI (free scan consumed before Gemini call)

## Stack
- Next.js 15 App Router + TypeScript strict + Tailwind CSS 4
- Playwright browser automation (Node/Express server)
- Gemini 2.5 Flash / 2.0 Flash for bank statement analysis and cancellation automation (100% Free Tier via Google AI Studio)
- Upstash Redis for credits, rate limiting, scan logging (with in-memory fallback for local/zero-cost mode)
- LemonSqueezy for payments (optional)

## Redis Key Patterns
- `credits:{userId}` — integer credit balance
- `free_scan:{userId}` — boolean, true = free scan already used
- `scan_log:{userId}` — list of `{count, at}` JSON entries (last 20, for refund audit)
- `free_used:{userId}` — boolean, free cancellation guide used
- `blocked:{ip}` — rate limit log entries

## Cancellation Tier System
- `auto` — Playwright runs autonomously (Netflix, Spotify, YouTube, Disney+, Canva, ChatGPT)
- `session` — Playwright with Claude (hard sites: Adobe, Amazon Prime)
- `manual` — links only, no automation (Dropbox, Google One, phone/chat-only services)
- Services not in DB — show greyed "Manual cancel" label, no button

## Deployment Architecture
- **Frontend:** Vercel (`www.subsnap.net`) — auto-deploy from GitHub main is BROKEN, use `npx vercel --prod`
- **Automation backend:** Railway (`https://subsnap-production.up.railway.app`) — runs Express + Playwright
- **Railway status:** Run `railway status` in `railway-server/` before assuming it's live
- **Health check:** GET `/health` on Railway server before debugging cancellation failures

## Anti-Hallucination Rules
1. Never assume a deployment is live because code was pushed — Vercel auto-deploy is broken
2. If `/api/cancel` returns errors, check Railway health first (`GET https://subsnap-production.up.railway.app/health`)
3. Check `.env.local` vs Vercel/Railway env var parity — mismatches have caused production bugs
4. LemonSqueezy API key in `.env.local` is TEST MODE — live purchases won't grant credits until swapped

## Known Blockers (as of now)
- Railway server not deployed — all `auto`/`session` tier cancellations fail with 500
- LemonSqueezy API key is test mode — real purchases won't trigger webhook credit grants
- Railway CLI requires manual `railway login` before any deploy commands

## Commands
- `npm run dev` — local dev server
- `npx tsc --noEmit` — type check
- `npx vercel --prod` — deploy frontend to production
- `railway up` (in `railway-server/`) — deploy automation backend

## Key Files
- `lib/redact.ts` — client-side redaction logic
- `lib/cancellationDb.ts` — cancel URLs, difficulty, tier; hand-curated + jdm-db.json (2,484 entries)
- `lib/credits.ts` — Redis credit management (getCredits, addCredits, deductCredit, hasFreeScan, consumeFreeScan, logScanResult)
- `lib/userId.ts` — anonymous UUID persisted to localStorage
- `lib/plans.ts` — LemonSqueezy plan definitions (split from credits.ts to prevent Redis leaking into client bundle)
- `railway-server/server.js` — Express + Playwright automation server (deploy to Railway)
- `app/api/analyze/route.ts` — Gemini vision + credit gate
- `app/api/cancel/route.ts` — relays to Railway server
- `app/api/checkout/route.ts` — LemonSqueezy checkout creation
- `app/api/webhooks/lemonsqueezy/route.ts` — grants credits on `order_created`
