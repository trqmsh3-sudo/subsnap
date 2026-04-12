'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { addLocalCredits } from '@/lib/clientCredits'

interface Props {
  credits: number
  amountTotal: number  // in cents
}

export default function SuccessContent({ credits, amountTotal }: Props) {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    const newTotal = addLocalCredits(credits)
    setTotal(newTotal)
  }, [credits])

  const amountFormatted = (amountTotal / 100).toFixed(2)

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body selection:bg-primary selection:text-on-primary overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#131b2e] shadow-[0_24px_40px_rgba(219,226,253,0.06)] flex items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold tracking-tighter text-[#44E2CD]">SubSnap</div>
        <Link href="/" className="text-[#dbe2fd]/60 hover:text-[#dbe2fd] transition-colors">
          <span className="material-symbols-outlined">home</span>
        </Link>
      </header>

      <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center">
        {/* Verified Icon with Glow */}
        <div className="relative w-full max-w-sm mb-8 flex justify-center">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75" />
          <div className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-[0_0_40px_rgba(105,255,233,0.4)]">
            <span
              className="material-symbols-outlined text-on-primary text-5xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          </div>
        </div>

        {/* Hero Text */}
        <section className="text-center mb-10 w-full max-w-sm">
          <p className="uppercase tracking-[0.15em] text-secondary font-medium mb-3 text-sm">
            Mission Complete
          </p>
          <h1 className="font-bold text-4xl md:text-5xl tracking-tight text-on-surface mb-4">
            Savings Secured!
          </h1>
          <p className="text-on-surface-variant px-4">
            Your cancel guides are ready. Click each link to complete your cancellations.
          </p>
        </section>

        {/* Stats Grid */}
        <div className="w-full max-w-md space-y-4 mb-12">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-high rounded-xl p-5 border border-outline-variant/10">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 mb-1">Credits Added</p>
              <p className="text-2xl font-bold text-on-surface">+{credits}</p>
              <p className="text-[11px] text-on-surface-variant">Cancellation credits</p>
            </div>
            <div className="bg-surface-container-high rounded-xl p-5 border border-outline-variant/10">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 mb-1">Amount Paid</p>
              <p className="text-2xl font-bold text-primary">${amountFormatted}</p>
              <p className="text-[11px] text-on-surface-variant">One-time payment</p>
            </div>
          </div>

          {/* Total Balance Card */}
          {total !== null && (
            <div className="bg-surface-container-low rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <span className="material-symbols-outlined text-primary/20 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-secondary font-semibold mb-4">CREDIT BALANCE UPDATED</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">wallet</span>
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">Total Balance</p>
                    <p className="text-[11px] text-on-surface-variant">Ready to use</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary">{total}</p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="w-full max-w-sm space-y-4 px-2">
          <Link
            href="/app"
            className="w-full py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-full text-lg shadow-[0_12px_24px_rgba(68,226,205,0.2)] active:scale-95 transition-transform flex items-center justify-center"
          >
            Go to Dashboard
          </Link>
          <p className="text-center text-[11px] text-on-surface-variant px-4">
            Questions? Email{' '}
            <a href="mailto:contact@subsnap.net" className="text-primary hover:underline">
              contact@subsnap.net
            </a>
            {' '}— we&rsquo;ll refund you if anything went wrong.
          </p>
          <Link
            href="/"
            className="w-full py-4 border border-outline-variant/30 text-on-surface-variant font-medium rounded-full flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">home</span>
            Back to Home
          </Link>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-8 pt-3 bg-[#2d3449]/60 backdrop-blur-xl rounded-t-[2rem] z-50">
        <Link href="/" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-5 py-2 hover:text-[#44E2CD] transition-all active:scale-90 duration-150">
          <span className="material-symbols-outlined mb-1">dashboard</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.1em]">Overview</span>
        </Link>
        <Link href="/app" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-5 py-2 hover:text-[#44E2CD] transition-all active:scale-90 duration-150">
          <span className="material-symbols-outlined mb-1">subscriptions</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.1em]">Subscriptions</span>
        </Link>
        <Link href="/" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-5 py-2 hover:text-[#44E2CD] transition-all active:scale-90 duration-150">
          <span className="material-symbols-outlined mb-1">analytics</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.1em]">Insights</span>
        </Link>
        <Link href="/#pricing" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-5 py-2 hover:text-[#44E2CD] transition-all active:scale-90 duration-150">
          <span className="material-symbols-outlined mb-1">settings</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.1em]">Settings</span>
        </Link>
      </footer>
    </div>
  )
}
