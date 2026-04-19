# SubSnap Launch Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit every page visually and technically, fix all issues, and confirm the full upload → analyze → cancel flow works end-to-end.

**Architecture:** Audit-first approach — screenshot all pages at mobile (390px) and desktop (1440px), review all API routes and lib code, compile a defect list, fix everything, then run a live end-to-end test.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS 4, Playwright MCP for screenshots, Gemini 2.5 Flash for AI analysis, Upstash Redis for credits, Lemon Squeezy for payments.

---

## Known Defects (found during planning)

| # | File | Issue |
|---|------|-------|
| D1 | `app/page.tsx` BottomNav | `href="\"` — backslash instead of `/` on Overview link |
| D2 | `app/page.tsx` BottomNav | 4 items with `px-5` + long "SUBSCRIPTIONS" label overflows 390px — "PRICING" clipped |
| D3 | `app/api/checkout/route.ts` | Imports `PLANS` from `@/lib/credits` (server bundle with Redis) instead of `@/lib/plans` |

---

## Files to Modify

| File | Change |
|------|--------|
| `app/page.tsx` | Fix BottomNav href backslash bug; fix nav overflow (reduce padding, shorten labels) |
| `app/app/page.tsx` | Fix BottomNav overflow if found during audit |
| `app/api/checkout/route.ts` | Fix PLANS import to use `@/lib/plans` directly |

---

## Task 1: Start Dev Server and Take Visual Audit Screenshots

**Files:** None modified — audit only.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Wait until you see `Ready` in the terminal output (usually ~5s).

- [ ] **Step 2: Screenshot landing page — mobile**

Use Playwright MCP. Resize to 390×844, navigate to `http://localhost:3000`, take full-page screenshot saved to `.playwright-mcp/audit-landing-mobile.png`.

- [ ] **Step 3: Screenshot landing page — desktop**

Resize to 1440×900, navigate to `http://localhost:3000`, take full-page screenshot saved to `.playwright-mcp/audit-landing-desktop.png`.

- [ ] **Step 4: Screenshot dashboard — mobile**

Resize to 390×844, navigate to `http://localhost:3000/app`, take full-page screenshot saved to `.playwright-mcp/audit-dashboard-mobile.png`.

- [ ] **Step 5: Screenshot dashboard — desktop**

Resize to 1440×900, take full-page screenshot saved to `.playwright-mcp/audit-dashboard-desktop.png`.

- [ ] **Step 6: Screenshot legal pages — mobile and desktop**

For each of `/privacy`, `/terms`, `/refund`, `/success`: resize to 390×844 and 1440×900, take screenshots saved to `.playwright-mcp/audit-{page}-mobile.png` and `.playwright-mcp/audit-{page}-desktop.png`.

- [ ] **Step 7: Review all screenshots**

Look at every screenshot. Log any visual issues you see in a running list — overflow, clipping, misaligned elements, broken images, unreadable text, inconsistent spacing. Add anything not already in the Known Defects table above.

---

## Task 2: Fix Bottom Nav on Landing Page

**Files:**
- Modify: `app/page.tsx` (BottomNav function, lines 3–22)

- [ ] **Step 1: Fix href backslash bug and overflow**

Replace the entire BottomNav function in `app/page.tsx`:

```tsx
function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-6 pt-3 bg-[#2d3449]/60 backdrop-blur-xl rounded-t-[2rem] z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
      <Link href="/" className="flex flex-col items-center justify-center bg-gradient-to-br from-[#69ffe9] to-[#44e2cd] text-[#003731] rounded-full px-4 py-2 transition-transform duration-150 active:scale-90">
        <span className="material-symbols-outlined text-[22px]">dashboard</span>
        <span className="text-[9px] font-medium uppercase tracking-normal">Overview</span>
      </Link>
      <Link href="/app" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-3 py-2 hover:text-[#44E2CD] transition-all active:scale-90">
        <span className="material-symbols-outlined text-[22px]">subscriptions</span>
        <span className="text-[9px] font-medium uppercase tracking-normal">Scans</span>
      </Link>
      <Link href="/#how-it-works" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-3 py-2 hover:text-[#44E2CD] transition-all active:scale-90">
        <span className="material-symbols-outlined text-[22px]">bar_chart</span>
        <span className="text-[9px] font-medium uppercase tracking-normal">Insights</span>
      </Link>
      <Link href="/#pricing" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-3 py-2 hover:text-[#44E2CD] transition-all active:scale-90">
        <span className="material-symbols-outlined text-[22px]">settings</span>
        <span className="text-[9px] font-medium uppercase tracking-normal">Pricing</span>
      </Link>
    </nav>
  )
}
```

Changes made:
- `href="\"` → `href="/"` (backslash bug fix)
- Container `px-4` → `px-2`
- Inactive items `px-5` → `px-3`
- Icon size `text-[24px]` (default) → `text-[22px]`
- Label `text-[10px] tracking-[0.1em]` → `text-[9px] tracking-normal`
- "SUBSCRIPTIONS" → "Scans" (fits on narrow screens)

- [ ] **Step 2: Screenshot to verify fix**

Resize Playwright to 390×844, navigate to `http://localhost:3000`, screenshot to `.playwright-mcp/fix-landing-nav-mobile.png`. Confirm all 4 labels are fully visible and nothing is clipped.

- [ ] **Step 3: Screenshot desktop to confirm no regression**

Resize to 1440×900, screenshot landing page. The nav should be hidden on desktop (class `md:hidden`).

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "fix: bottom nav overflow and broken href on landing page"
```

---

## Task 3: Fix Bottom Nav on Dashboard Page

**Files:**
- Modify: `app/app/page.tsx` (BottomNav function, lines 13–37)

- [ ] **Step 1: Check current dashboard nav on mobile**

Screenshot `http://localhost:3000/app` at 390×844. Confirm whether "PRICING" label is clipped (same issue may exist — items use `px-5`).

- [ ] **Step 2: Fix padding on dashboard BottomNav**

Replace the BottomNav function in `app/app/page.tsx`:

```tsx
function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-6 pt-3 bg-[#2d3449]/60 backdrop-blur-xl rounded-t-[2rem] z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
      <Link href="/" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-3 py-2 hover:text-[#44E2CD] transition-all active:scale-90 duration-150">
        <span className="material-symbols-outlined text-[22px]">home</span>
        <span className="text-[9px] font-medium uppercase tracking-normal mt-0.5">Home</span>
      </Link>
      <Link href="/app" className="flex flex-col items-center justify-center bg-gradient-to-br from-[#69ffe9] to-[#44e2cd] text-[#003731] rounded-full px-4 py-2 active:scale-90 transition-transform duration-150">
        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
        <span className="text-[9px] font-medium uppercase tracking-normal mt-0.5">Dashboard</span>
      </Link>
      <Link href="/privacy" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-3 py-2 hover:text-[#44E2CD] transition-all active:scale-90 duration-150">
        <span className="material-symbols-outlined text-[22px]">shield</span>
        <span className="text-[9px] font-medium uppercase tracking-normal mt-0.5">Privacy</span>
      </Link>
      <Link href="/#pricing" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-3 py-2 hover:text-[#44E2CD] transition-all active:scale-90 duration-150">
        <span className="material-symbols-outlined text-[22px]">payments</span>
        <span className="text-[9px] font-medium uppercase tracking-normal mt-0.5">Pricing</span>
      </Link>
    </nav>
  )
}
```

- [ ] **Step 3: Screenshot dashboard mobile to verify**

Resize to 390×844, navigate to `http://localhost:3000/app`, screenshot to `.playwright-mcp/fix-dashboard-nav-mobile.png`. Confirm all 4 labels fit.

- [ ] **Step 4: Commit**

```bash
git add app/app/page.tsx
git commit -m "fix: bottom nav overflow on dashboard mobile"
```

---

## Task 4: Fix PLANS Import in Checkout Route

**Files:**
- Modify: `app/api/checkout/route.ts` line 2

- [ ] **Step 1: Fix the import**

In `app/api/checkout/route.ts`, change line 2 from:

```ts
import { PLANS } from '@/lib/credits'
```

to:

```ts
import { PLANS } from '@/lib/plans'
```

This prevents the server-only Redis client from being imported transitively in the checkout route.

- [ ] **Step 2: Verify TypeScript still passes**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 3: Commit**

```bash
git add app/api/checkout/route.ts
git commit -m "fix: import PLANS from lib/plans not lib/credits in checkout route"
```

---

## Task 5: Fix Any Additional Visual Issues Found in Audit

**Files:** Varies depending on Task 1 findings.

- [ ] **Step 1: Work through each issue logged in Task 1, Step 7**

For each issue:
1. Identify the exact file and lines responsible
2. Apply the minimal fix
3. Screenshot to verify
4. Commit with a descriptive message: `fix: <description>`

Common things to check:
- Text overflow on narrow screens (add `truncate` or reduce font size)
- Images not loading (check `src` paths and `alt` attributes)
- Buttons too close to screen edge (add `px-4` minimum)
- Footer misalignment on mobile
- Legal pages: readable body text, working back navigation

---

## Task 6: TypeScript and Code Quality Check

**Files:** None (verification only).

- [ ] **Step 1: Run TypeScript compiler**

```bash
npx tsc --noEmit
```

Expected: no output. If errors appear, fix them — each error will point to a file and line number.

- [ ] **Step 2: Check for console errors in browser**

Use Playwright MCP `browser_console_messages` after loading `http://localhost:3000` and `http://localhost:3000/app`. Note any errors or warnings.

- [ ] **Step 3: Fix any TypeScript errors or critical console errors found**

Commit each fix separately with `fix: <description>`.

---

## Task 7: End-to-End Flow Test — Upload → Analyze → Cancel Links

**Files:** None modified — live test.

- [ ] **Step 1: Navigate to dashboard**

Playwright: resize to 390×844, navigate to `http://localhost:3000/app`.

- [ ] **Step 2: Upload a real bank statement PDF**

Use Playwright `browser_file_upload` to upload a real PDF bank statement (any statement with known subscription charges). If no real PDF is available, create a simple test PDF with text like "NETFLIX $15.49" and "SPOTIFY $9.99".

- [ ] **Step 3: Confirm redaction fires before network request**

Use Playwright `browser_network_requests` to verify that no network request to `/api/analyze` fires until after the redaction step completes. The request body should contain `imageBase64` only (no raw PDF data).

- [ ] **Step 4: Confirm analyze response**

After the Redactor component sends the image, check the network response from `/api/analyze`. Expected: `{ subscriptions: [...] }` with at least one entry if the PDF contained subscription charges.

- [ ] **Step 5: Confirm cancellation links**

Click "Cancel Guide" on one of the identified subscriptions in the Preview component. Confirm it opens a cancellation URL (either a direct cancel page or a Google search fallback).

- [ ] **Step 6: Screenshot final state**

Take a full-page screenshot of the dashboard after analysis completes. Save to `.playwright-mcp/e2e-result.png`.

---

## Task 8: Lemon Squeezy Payment Flow Verification

**Files:** None modified — verification only.

- [ ] **Step 1: Test checkout session creation**

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"planId":"scan","userId":"test-user-001"}'
```

Expected response:
```json
{ "url": "https://subsnap.lemonsqueezy.com/checkout/..." }
```

If you get `{ "error": "Checkout creation failed" }`, check:
- `LEMONSQUEEZY_API_KEY` is set in `.env.local`
- The `variantId` `1518339` exists in your Lemon Squeezy store
- The `STORE_ID` `341528` matches your store

- [ ] **Step 2: Verify webhook signature check**

```bash
curl -X POST http://localhost:3000/api/webhooks/lemonsqueezy \
  -H "Content-Type: application/json" \
  -H "x-signature: invalidsig" \
  -d '{"meta":{"event_name":"order_created"}}'
```

Expected: `{ "error": "Invalid signature" }` with status 400. This confirms the HMAC check is working.

- [ ] **Step 3: Verify credit grant via webhook (dry run)**

Generate a valid HMAC for the test payload using `LEMONSQUEEZY_WEBHOOK_SECRET` from `.env.local`:

```bash
node -e "
const { createHmac } = require('crypto');
const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
const body = JSON.stringify({
  meta: {
    event_name: 'order_created',
    custom_data: { userId: 'test-user-001', credits: '1' }
  },
  data: { attributes: { status: 'paid' } }
});
const sig = createHmac('sha256', secret).update(body).digest('hex');
console.log('sig:', sig);
console.log('body:', body);
"
```

Then POST that body with the correct signature to `/api/webhooks/lemonsqueezy`. Expected: `{ "received": true }` and Redis should have 1 credit for `test-user-001`.

Verify with:
```bash
node -e "
const { Redis } = require('@upstash/redis');
const r = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
r.get('credits:test-user-001').then(v => console.log('credits:', v));
"
```

- [ ] **Step 4: Clean up test data**

```bash
node -e "
const { Redis } = require('@upstash/redis');
const r = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
r.del('credits:test-user-001').then(() => console.log('cleaned'));
"
```

---

## Task 9: Final Visual Pass and Sign-Off

- [ ] **Step 1: Take final screenshots of all pages at both breakpoints**

Take fresh screenshots after all fixes:
- Landing mobile (390px) and desktop (1440px)
- Dashboard mobile and desktop
- Privacy mobile and desktop

Save to `.playwright-mcp/final-{page}-{breakpoint}.png`.

- [ ] **Step 2: Compare against audit screenshots from Task 1**

Confirm every issue logged in Task 1 is now fixed. Nothing clipped. Nothing overflowing. All labels visible.

- [ ] **Step 3: Final TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: launch readiness — all visual and technical fixes complete"
```
