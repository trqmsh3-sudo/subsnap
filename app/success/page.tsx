import Link from 'next/link'
import SuccessContent from '@/components/SuccessContent'
import { CREDITS_BY_VARIANT } from '@/lib/plans'

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
    <div className="min-h-screen bg-surface text-on-surface flex flex-col selection:bg-primary selection:text-on-primary">
      <header className="fixed top-0 w-full z-50 bg-[#131b2e] shadow-[0_24px_40px_rgba(219,226,253,0.06)] flex items-center justify-center px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-[#44E2CD]">SubSnap</Link>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-24 relative z-10">
        <div className="bg-surface-container-low rounded-[2rem] p-10 md:p-16 text-center max-w-md w-full border border-outline-variant/10">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-error text-5xl">error</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-4">
            Something went wrong
          </h1>
          <p className="text-on-surface-variant mb-4">{message}</p>
          <p className="text-on-surface-variant/60 text-sm mb-8">
            To see your order confirmation, complete a purchase from the dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="inline-block bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-full font-bold active:scale-95 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
