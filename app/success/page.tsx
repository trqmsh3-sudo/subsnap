import Link from 'next/link'
import SuccessContent from '@/components/SuccessContent'
import { CREDITS_BY_VARIANT } from '@/lib/credits'

interface Props {
  searchParams: Promise<{ order_id?: string }>
}

export default async function SuccessPage({ searchParams }: Props) {
  const { order_id } = await searchParams

  if (!order_id) {
    return <ErrorCard message="No order ID found." />
  }

  try {
    const res = await fetch(`https://api.lemonsqueezy.com/v1/orders/${order_id}`, {
      headers: {
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
        Accept: 'application/vnd.api+json',
      },
      cache: 'no-store',
    })

    const data = await res.json()
    const order = data?.data?.attributes

    if (!order || order.status !== 'paid') {
      return <ErrorCard message="Payment not completed." />
    }

    const variantId = String(order.first_order_item?.variant_id ?? '')
    const credits = CREDITS_BY_VARIANT[variantId] ?? 0
    const amountTotal = order.total ?? 0

    return <SuccessContent credits={credits} amountTotal={amountTotal} />
  } catch {
    return <ErrorCard message="Could not verify order." />
  }
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col noise-overlay">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <header className="w-full py-8 flex justify-center sticky top-0 z-50 backdrop-blur-md">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">SubSnap</Link>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <div className="glass-card rounded-[2.5rem] p-10 md:p-16 text-center max-w-md w-full shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
          <div className="w-20 h-20 bg-error-container/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-error text-5xl">error</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-4">
            Something went wrong
          </h1>
          <p className="text-on-surface-variant mb-8">{message}</p>
          <Link
            href="/"
            className="inline-block bg-secondary text-on-secondary px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
