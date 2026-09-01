import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

export interface PlaybookStep {
  stepNumber: number
  type: 'click' | 'open_dropdown' | 'fill_survey' | 'confirm'
  selector: string
  fallbackText?: string
  waitAfterMs?: number
}

export interface ServicePlaybook {
  host: string
  serviceName?: string
  cancelUrl?: string
  steps: PlaybookStep[]
  successIndicators?: string[]
  updatedAt?: number
  version?: string
}

const BASE_PLAYBOOKS: Record<string, string[]> = {
  'netflix.com': ['[data-uia="action-cancel-plan"]', '[data-uia="btn-cancel-membership"]'],
  'adobe.com': ['button[data-testid*="cancel-plan"]', 'button[data-testid*="end-service"]', 'a[href*="/cancel-plan"]'],
  'claude.ai': ['button[data-testid="cancel-subscription"]'],
  'spotify.com': ['button[data-testid="cancel-plan-button"]', 'a[data-testid="cancel-plan-link"]'],
  'chatgpt.com': ['button[data-testid="cancel-subscription-button"]'],
  'amazon.com': ['#cancel-membership-button', 'a[href*="cancelPrime"]'],
  'x.com': ['div[data-testid="cancelSubscription"]', 'button[data-testid="cancelPlan"]'],
  'canva.com': ['button[data-testid="cancel-subscription-button"]'],
  'reddit.com': ['button[data-testid="cancel-premium-btn"]'],
  'semrush.com': ['[class*="chevron"], [aria-expanded="false"], a[href*="billing"]', 'button[data-testid*="cancel"], button:has-text("Cancel")']
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const host = (searchParams.get('host') || '').toLowerCase().replace(/^www\./, '')

  if (!host) {
    return NextResponse.json({
      playbooks: BASE_PLAYBOOKS,
      version: '2.0.0',
      updatedAt: new Date().toISOString()
    })
  }

  let structuredPlaybook: ServicePlaybook | null = null
  let healedUrl: string | null = null
  let dynamicSelector: string | null = null

  if (redis) {
    try {
      const [pb, hUrl, dSel] = await Promise.all([
        redis.get<ServicePlaybook>(`playbook:${host}`),
        redis.get<string>(`healed_url:${host}`),
        redis.get<string>(`selector:${host}`)
      ])
      structuredPlaybook = pb
      healedUrl = hUrl
      dynamicSelector = dSel
    } catch {}
  }

  if (structuredPlaybook && Array.isArray(structuredPlaybook.steps) && structuredPlaybook.steps.length > 0) {
    return NextResponse.json({
      host,
      playbook: structuredPlaybook,
      source: 'redis_playbook'
    })
  }

  if (dynamicSelector || healedUrl) {
    return NextResponse.json({
      host,
      healedUrl,
      selectors: dynamicSelector ? [dynamicSelector, ...(BASE_PLAYBOOKS[host] || [])] : (BASE_PLAYBOOKS[host] || []),
      source: 'remote_redis'
    })
  }

  if (BASE_PLAYBOOKS[host]) {
    return NextResponse.json({
      host,
      selectors: BASE_PLAYBOOKS[host],
      source: 'base_playbook'
    })
  }

  return NextResponse.json({ host, selectors: [], playbook: null, source: 'none' })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { host, serviceName, cancelUrl, steps, selector, healedUrl } = body

    if (!host) {
      return NextResponse.json({ error: 'host is required' }, { status: 400 })
    }

    const cleanHost = host.toLowerCase().replace(/^www\./, '')

    // Anti-Poison Validation Gate: Reject any step that attempts to buy/upgrade or delete account
    const isPoisoned = (str: string) => {
      const s = (str || '').toLowerCase()
      return s.includes('buy') || s.includes('upgrade') || s.includes('purchase') ||
             s.includes('delete-account') || s.includes('close-account') ||
             s.includes('购买') || s.includes('升级')
    }

    if (selector && isPoisoned(selector)) {
      return NextResponse.json({ error: 'Poisoned selector rejected by safety gate' }, { status: 422 })
    }

    if (Array.isArray(steps)) {
      for (const step of steps) {
        if (isPoisoned(step.selector) || isPoisoned(step.fallbackText || '')) {
          return NextResponse.json({ error: 'Poisoned step rejected by safety gate' }, { status: 422 })
        }
      }
    }

    if (redis) {
      if (Array.isArray(steps) && steps.length > 0) {
        const playbookRecord: ServicePlaybook = {
          host: cleanHost,
          serviceName: serviceName || cleanHost,
          cancelUrl: cancelUrl || undefined,
          steps,
          updatedAt: Date.now(),
          version: '2.0.0'
        }
        await redis.set(`playbook:${cleanHost}`, playbookRecord, { ex: 60 * 60 * 24 * 30 })
      }

      if (healedUrl) {
        await redis.set(`healed_url:${cleanHost}`, healedUrl, { ex: 60 * 60 * 24 * 30 })
      }
      if (selector) {
        await redis.set(`selector:${cleanHost}`, selector, { ex: 60 * 60 * 24 * 30 })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully recorded verified playbook for ${cleanHost}`,
      healedUrl,
      selector,
      stepsCount: Array.isArray(steps) ? steps.length : 0
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to record playbook' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const host = (searchParams.get('host') || '').toLowerCase().replace(/^www\./, '')
    if (!host) {
      return NextResponse.json({ error: 'host is required' }, { status: 400 })
    }

    if (redis) {
      await Promise.all([
        redis.del(`playbook:${host}`),
        redis.del(`healed_url:${host}`),
        redis.del(`selector:${host}`)
      ])
    }

    return NextResponse.json({ success: true, message: `Evicted stale playbook for ${host}` })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to evict playbook' }, { status: 500 })
  }
}
