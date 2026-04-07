import Stripe from 'stripe'
import Link from 'next/link'
import SuccessContent from '@/components/SuccessContent'

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  if (!session_id) {
    return <ErrorCard message="No session ID found." />
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status !== 'paid') {
      return <ErrorCard message="Payment not completed." />
    }

    const credits = parseInt(session.metadata?.credits ?? '0', 10)
    const amountTotal = session.amount_total ?? 0

    return <SuccessContent credits={credits} amountTotal={amountTotal} />
  } catch {
    return <ErrorCard message="Could not verify payment session." />
  }
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="w-full py-8 flex justify-center sticky top-0 z-50 backdrop-blur-md">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">SubSnap</Link>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
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
