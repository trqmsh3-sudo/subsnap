import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

const BASE_PLAYBOOKS: Record<string, string[]> = {
  'netflix.com': ['[data-uia="action-cancel-plan"]', '[data-uia="btn-cancel-membership"]'],
  'adobe.com': ['button[data-testid*="cancel-plan"]', 'button[data-testid*="end-service"]', 'a[href*="/cancel-plan"]'],
  'claude.ai': ['button[data-testid="cancel-subscription"]'],
  'spotify.com': ['button[data-testid="cancel-plan-button"]', 'a[data-testid="cancel-plan-link"]'],
  'chatgpt.com': ['button[data-testid="cancel-subscription-button"]'],
  'amazon.com': ['#cancel-membership-button', 'a[href*="cancelPrime"]'],
  'x.com': ['div[data-testid="cancelSubscription"]', 'button[data-testid="cancelPlan"]'],
  'canva.com': ['button[data-testid="cancel-subscription-button"]'],
  'reddit.com': ['button[data-testid="cancel-premium-btn"]']
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const host = (searchParams.get('host') || '').toLowerCase().replace(/^www\./, '')

  let healedUrl: string | null = null
  let dynamicSelector: string | null = null

  if (host && redis) {
    try {
      [healedUrl, dynamicSelector] = await Promise.all([
        redis.get<string>(`healed_url:${host}`),
        redis.get<string>(`selector:${host}`)
      ])
    } catch {}
  }

  if (dynamicSelector || healedUrl) {
    return NextResponse.json({
      host,
      healedUrl,
      selectors: dynamicSelector ? [dynamicSelector, ...(BASE_PLAYBOOKS[host] || [])] : (BASE_PLAYBOOKS[host] || []),
      source: 'remote_redis'
    })
  }

  if (host && BASE_PLAYBOOKS[host]) {
    return NextResponse.json({
      host,
      selectors: BASE_PLAYBOOKS[host],
      source: 'base_playbook'
    })
  }

  return NextResponse.json({
    playbooks: BASE_PLAYBOOKS,
    version: '1.0.0',
    updatedAt: new Date().toISOString()
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { host, healedUrl, selector } = body

    if (!host) {
      return NextResponse.json({ error: 'host is required' }, { status: 400 })
    }

    const cleanHost = host.toLowerCase().replace(/^www\./, '')

    if (redis) {
      if (healedUrl) {
        await redis.set(`healed_url:${cleanHost}`, healedUrl, { ex: 60 * 60 * 24 * 30 })
      }
      if (selector) {
        await redis.set(`selector:${cleanHost}`, selector, { ex: 60 * 60 * 24 * 30 })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully self-healed playbook for ${cleanHost}`,
      healedUrl,
      selector
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to record healed playbook' }, { status: 500 })
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
        redis.del(`healed_url:${host}`),
        redis.del(`selector:${host}`)
      ])
    }

    return NextResponse.json({ success: true, message: `Evicted stale playbook for ${host}` })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to evict playbook' }, { status: 500 })
  }
}
