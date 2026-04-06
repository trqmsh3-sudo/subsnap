import Stripe from 'stripe'
import Link from 'next/link'
import SuccessContent from '@/components/SuccessContent'

const PLAN_LABELS: Record<string, string> = {
  single: 'Single Snap',
  starter: 'Starter Pack',
  pro: 'Pro Pack',
}

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

    const planId = session.metadata?.planId ?? ''
    const credits = parseInt(session.metadata?.credits ?? '0', 10)
    const planName = PLAN_LABELS[planId] ?? planId

    return <SuccessContent planName={planName} credits={credits} />
  } catch {
    return <ErrorCard message="Could not verify payment session." />
  }
}

function ErrorCard({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 mb-6">{message}</p>
        <Link href="/" className="text-indigo-500 hover:underline text-sm">
          Back to home
        </Link>
      </div>
    </main>
  )
}
