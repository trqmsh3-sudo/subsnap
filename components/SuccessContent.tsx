'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { addLocalCredits } from '@/lib/clientCredits'

interface Props {
  credits: number
  amountTotal: number  // in cents from Stripe
}

export default function SuccessContent({ credits, amountTotal }: Props) {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    const newTotal = addLocalCredits(credits)
    setTotal(newTotal)
  }, [credits])

  const amountFormatted = (amountTotal / 100).toFixed(2)

  return (
    <div className="min-h-screen bg-surface flex flex-col noise-overlay">
      {/* Ambient glows */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed top-1/3 left-1/3 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Simplified header */}
      <header className="w-full py-8 flex justify-center sticky top-0 z-50 backdrop-blur-md">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">SubSnap</Link>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="max-w-xl w-full">
          <div className="glass-card rounded-[2.5rem] p-10 md:p-16 text-center shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative overflow-hidden">

            {/* Confetti SVG elements */}
            <svg className="absolute top-[-20px] left-[-20px] w-24 h-24 pointer-events-none" viewBox="0 0 100 100">
              <circle cx="10" cy="10" fill="#44E2CD" opacity="0.6" r="2" />
              <rect fill="#d0bcff" height="4" opacity="0.4" transform="rotate(45 80 20)" width="4" x="80" y="20" />
              <circle cx="50" cy="5" fill="#44E2CD" opacity="0.8" r="1.5" />
            </svg>
            <svg className="absolute bottom-[-10px] right-[-30px] w-24 h-24 pointer-events-none" viewBox="0 0 100 100">
              <circle cx="90" cy="80" fill="#44E2CD" opacity="0.5" r="2.5" />
              <rect fill="#44E2CD" height="3" opacity="0.7" transform="rotate(15 10 70)" width="3" x="10" y="70" />
            </svg>

            {/* Check icon */}
            <div className="relative inline-block mb-8">
              <div className="w-28 h-28 bg-secondary-container/20 rounded-full flex items-center justify-center mx-auto relative">
                <span
                  className="material-symbols-outlined text-secondary text-7xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div className="absolute inset-0 rounded-full border-2 border-secondary/20 scale-125" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4">
              Payment Successful!
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-10 max-w-sm mx-auto">
              You now have{' '}
              <span className="text-secondary font-bold">{credits}</span>{' '}
              cancellation credit{credits !== 1 ? 's' : ''} ready to use.
            </p>

            {total !== null && (
              <p className="text-sm text-on-surface-variant mb-4">
                Total balance:{' '}
                <span className="font-bold text-on-surface">{total} credit{total !== 1 ? 's' : ''}</span>
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <Link
                href="/app"
                className="bg-secondary text-on-secondary py-4 px-8 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_10px_20px_rgba(68,226,205,0.2)] active:opacity-80 inline-block"
              >
                Start Canceling
              </Link>
              <Link
                href="/"
                className="text-on-surface-variant hover:text-white transition-colors duration-200 font-semibold tracking-wide uppercase text-xs mt-2"
              >
                Back to Home
              </Link>
            </div>

            {/* Transaction details */}
            <div className="mt-12 pt-8 border-t border-outline-variant/10 grid grid-cols-2 gap-4 text-left">
              <div className="bg-surface-container-low p-4 rounded-xl">
                <p className="text-[10px] uppercase tracking-widest text-outline mb-1 font-bold">
                  Amount Paid
                </p>
                <p className="text-xl font-bold text-on-surface">${amountFormatted}</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl">
                <p className="text-[10px] uppercase tracking-widest text-outline mb-1 font-bold">
                  Credits Added
                </p>
                <p className="text-xl font-bold text-on-surface">+{credits}</p>
              </div>
            </div>
          </div>

          {/* Decorative dots */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="h-1 w-12 rounded-full bg-secondary" />
            <div className="h-1 w-2 rounded-full bg-surface-container-highest" />
            <div className="h-1 w-2 rounded-full bg-surface-container-highest" />
          </div>
        </div>
      </main>

      <footer className="bg-[#0B1326] py-12 mt-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto">
          <span className="text-lg font-bold text-slate-300 mb-4 md:mb-0">SubSnap</span>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-sm tracking-wide uppercase font-semibold text-slate-500 hover:text-[#44E2CD] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm tracking-wide uppercase font-semibold text-slate-500 hover:text-[#44E2CD] transition-colors">
              Terms of Service
            </Link>
          </div>
          <p className="text-sm tracking-wide uppercase font-semibold text-slate-500 mt-4 md:mt-0">
            © 2026 SubSnap. 2026 Compliant.
          </p>
        </div>
      </footer>
    </div>
  )
}
