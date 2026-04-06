import { NextRequest, NextResponse } from 'next/server'

const MOCK_SUBSCRIPTIONS = [
  { name: 'Netflix', amount: '₪59', frequency: 'monthly', category: 'streaming' },
  { name: 'Spotify', amount: '₪20', frequency: 'monthly', category: 'streaming' },
  { name: 'Adobe', amount: '₪180', frequency: 'monthly', category: 'software' },
  { name: 'iCloud', amount: '₪12', frequency: 'monthly', category: 'other' },
  { name: 'Test Service', amount: '₪29', frequency: 'monthly', category: 'other' },
  { name: 'YouTube Premium', amount: '₪22', frequency: 'monthly', category: 'streaming' },
  { name: 'Canva', amount: '$15.00', frequency: 'monthly', category: 'software' },
  { name: 'Amazon Prime', amount: '$14.99', frequency: 'monthly', category: 'other' },
  { name: 'Test Easy', amount: '$9.99', frequency: 'monthly', category: 'other' },
  { name: 'Test Hard', amount: '$29.99', frequency: 'monthly', category: 'other' },
]

export async function POST(req: NextRequest) {
  await new Promise((r) => setTimeout(r, 1500))
  return NextResponse.json({ subscriptions: MOCK_SUBSCRIPTIONS })
}
