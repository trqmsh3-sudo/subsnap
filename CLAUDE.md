# SubSnap — Privacy-First Subscription Canceller

## Core Rules
- Always local redaction first — never send raw bank data to server
- Playwright must use stealth mode in production
- Every Cancel must have a fallback deep-link if automation fails
- Never store credentials plain text
- Stripe charge must happen before AI runs

## Stack
- Next.js App Router + TypeScript strict + Tailwind
- Playwright for browser automation
- Claude API for analysis, Gemini Flash for easy sites
- Stripe for payments

## Commands
- npm run dev
- npx tsc --noEmit
- npx playwright test

## Key Files
- lib/redact.ts — redaction logic
- lib/cancellationDb.ts — cancel URLs + difficulty
- lib/playwrightCancel.ts — automation
- lib/credits.ts — credit management
- app/api/analyze/route.ts — Claude vision
- app/api/cancel/route.ts — cancel trigger
- app/api/checkout/route.ts — Stripe checkout
