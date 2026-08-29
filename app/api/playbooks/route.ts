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

  if (host && redis) {
    try {
      const dynamicSelector = await redis.get<string>(`selector:${host}`)
      if (dynamicSelector) {
        return NextResponse.json({
          host,
          selectors: [dynamicSelector, ...(BASE_PLAYBOOKS[host] || [])],
          source: 'remote_redis'
        })
      }
    } catch {}
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
