# SubSnap Launch Readiness — Design Spec
**Date:** 2026-04-19  
**Goal:** Ship a 100% working system — visually polished and technically sound on both mobile and desktop.

---

## Approach: Audit-First, Fix in One Pass

Do a complete audit of every page and every critical flow before touching code. Log every issue. Fix everything. Then run a live end-to-end test to confirm the system works with real data.

---

## Audit Scope

### Pages (mobile 390px + desktop 1440px)
| Page | Route |
|------|-------|
| Landing | `/` |
| Dashboard | `/app` |
| Privacy | `/privacy` |
| Terms | `/terms` |
| Refund | `/refund` |

### Visual Checks (per page, per breakpoint)
- Layout overflow or clipping (known: bottom nav on mobile)
- Spacing, padding, alignment
- Typography legibility
- Broken or missing images/icons
- Responsive breakpoint transitions (mobile → tablet → desktop)
- Interactive states (hover, active, focus)

### Technical Checks
- PDF upload → client-side parse → client-side redact pipeline
- `/api/analyze` — Gemini vision call, response parsing, rate limiting
- `/api/checkout` — Lemon Squeezy session creation
- `/api/webhooks/lemonsqueezy` — payment webhook → Redis credit grant
- Credit balance read/write (localStorage + Redis)
- Cancellation DB lookup (`findCancellationEntry`)
- Playwright cancel automation route (`/api/cancel`)
- TypeScript strict compliance (`npx tsc --noEmit`)

### End-to-End Flow
1. Upload a real bank statement PDF on `/app`
2. Confirm client-side redaction fires before any network request
3. Confirm `/api/analyze` returns subscription objects
4. Confirm cancellation links resolve correctly
5. Confirm Lemon Squeezy checkout → webhook → credit grant cycle works

---

## Known Issue to Fix
- **Bottom nav clipping on mobile:** 4 nav items with `px-5` overflow on 390px screens, "PRICING" tab cut off. Fix: reduce item padding and verify all 4 labels are fully visible.

---

## Success Criteria
- Every page renders correctly on 390px mobile and 1440px desktop with zero overflow/clipping
- TypeScript compiler reports zero errors
- Full upload → analyze → cancel-link flow completes without errors
- Lemon Squeezy payment flow grants credits correctly
- No raw bank data leaves the browser before redaction
