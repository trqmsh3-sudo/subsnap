import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ override: true, path: path.resolve(process.cwd(), '.env.local') })

import { cancelSubscription, type CancelResult } from '../lib/playwrightCancel.js'
import { CANCELLATION_DB } from '../lib/cancellationDb.js'

// ─── Config ───────────────────────────────────────────────────────────────────

const PORT = process.env.TEST_PORT ?? '3009'
const BASE = `http://localhost:${PORT}`

const TEST_CASES = [
  { label: 'Test Easy', dbKey: 'Test Easy' },
  { label: 'Test Hard', dbKey: 'Test Hard' },
] as const

// ─── Server check ─────────────────────────────────────────────────────────────

async function checkServer(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/test-easy`, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}

// ─── Run one test ─────────────────────────────────────────────────────────────

interface TestResult {
  label: string
  model: string
  steps: number
  cost: number
  status: string
}

async function runTest(label: string, dbKey: string): Promise<TestResult> {
  const entry = CANCELLATION_DB.find(e => e.name.toLowerCase() === dbKey.toLowerCase())
  if (!entry) throw new Error(`No DB entry found for "${dbKey}"`)

  // Override URL to use current port and always run auto (no bridge in headless test)
  const urlPath = new URL(entry.cancelUrl).pathname
  const cancelUrl = `${BASE}${urlPath}`

  console.log(`\n▶ Running: ${label} → ${cancelUrl}`)

  const result: CancelResult = await cancelSubscription(
    cancelUrl,
    label,
    entry.difficulty,
    'auto',          // force auto — no session bridge in headless test
    entry.steps,
    { headless: true }
  )

  const model = result.model ?? 'unknown'
  const steps = result.stepsTaken ?? 0
  const cost = result.estimatedCost ?? 0
  const status = result.success
    ? 'SUCCESS'
    : result.message.startsWith('need_human')
      ? 'need_human'
      : result.message.includes('Timeout')
        ? 'TIMEOUT'
        : result.message.includes('Max steps')
          ? 'MAX_STEPS'
          : 'FAILED'

  return { label, model, steps, cost, status }
}

// ─── Report printer ───────────────────────────────────────────────────────────

function printReport(results: TestResult[]) {
  const totalPerCancel = results.reduce((sum, r) => sum + r.cost, 0) / results.length
  const per1000 = (totalPerCancel * 1000).toFixed(2)

  const pad = (s: string, n: number) => s.padEnd(n)

  console.log('\n' + '═'.repeat(51))
  console.log('SubSnap Cost Test Report')
  console.log('═'.repeat(51))

  for (const r of results) {
    const modelStr  = pad(`model=${r.model}`,   14)
    const stepsStr  = pad(`steps=${r.steps}`,   9)
    const costStr   = pad(`cost=$${r.cost.toFixed(6)}`, 18)
    const statusStr = `status=${r.status}`
    console.log(`${pad(r.label + ':', 12)} ${modelStr} ${stepsStr} ${costStr} ${statusStr}`)
  }

  console.log('─'.repeat(51))
  console.log(`Total estimated cost per 1000 cancellations: $${per1000}`)
  console.log('═'.repeat(51) + '\n')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Checking dev server at ${BASE}...`)
  const up = await checkServer()
  if (!up) {
    console.error(`\n✗ Dev server not reachable at ${BASE}.`)
    console.error(`  Start it with: npm run dev`)
    console.error(`  Then re-run:   npx tsx scripts/test-costs.ts`)
    console.error(`  Override port: TEST_PORT=3010 npx tsx scripts/test-costs.ts\n`)
    process.exit(1)
  }
  console.log('✓ Server is up\n')

  const results: TestResult[] = []

  for (const tc of TEST_CASES) {
    try {
      const r = await runTest(tc.label, tc.dbKey)
      results.push(r)
    } catch (err) {
      console.error(`✗ ${tc.label} threw:`, err)
      results.push({ label: tc.label, model: 'unknown', steps: 0, cost: 0, status: 'ERROR' })
    }
  }

  printReport(results)
}

main()
