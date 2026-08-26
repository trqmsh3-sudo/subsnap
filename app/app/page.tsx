'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import CreditBalance from '@/components/CreditBalance'
import Preview from '@/components/Preview'
import PricingCards from '@/components/PricingCards'
import QuickCancelBar from '@/components/QuickCancelBar'

const FileUpload = dynamic(() => import('@/components/FileUpload'), { ssr: false })
const Redactor = dynamic(() => import('@/components/Redactor'), { ssr: false })

function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-6 pt-3 bg-[#2d3449]/60 backdrop-blur-xl rounded-t-[2rem] z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
      <Link href="/" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-3 py-2 hover:text-[#44E2CD] transition-all active:scale-90 duration-150">
        <span className="material-symbols-outlined text-[22px]">home</span>
        <span className="text-[9px] font-medium uppercase tracking-normal mt-0.5">Home</span>
      </Link>
      <Link href="/app" className="flex flex-col items-center justify-center bg-gradient-to-br from-[#69ffe9] to-[#44e2cd] text-[#003731] rounded-full px-4 py-2 active:scale-90 transition-transform duration-150">
        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
        <span className="text-[9px] font-medium uppercase tracking-normal mt-0.5">Dashboard</span>
      </Link>
      <Link href="/privacy" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-3 py-2 hover:text-[#44E2CD] transition-all active:scale-90 duration-150">
        <span className="material-symbols-outlined text-[22px]">shield</span>
        <span className="text-[9px] font-medium uppercase tracking-normal mt-0.5">Privacy</span>
      </Link>
      <Link href="/#pricing" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-3 py-2 hover:text-[#44E2CD] transition-all active:scale-90 duration-150">
        <span className="material-symbols-outlined text-[22px]">payments</span>
        <span className="text-[9px] font-medium uppercase tracking-normal mt-0.5">Pricing</span>
      </Link>
    </nav>
  )
}

export default function AppPage() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [textItems, setTextItems] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [userId, setUserId] = useState<string>('anonymous')

  useEffect(() => {
    import('@/lib/userId').then(({ getUserId }) => setUserId(getUserId()))
  }, [])

  function handleFileProcessed(c: HTMLCanvasElement, items: any[]) {
    setCanvas(c)
    setTextItems(items)
    setSubscriptions([])
    setAnalyzed(false)
  }

  const handleRedacted = useCallback(async (base64: string) => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, userId }),
      })
      if (res.status === 402) {
        setSubscriptions([])
        setAnalyzed(true)
        alert('You\'ve used your free scan. Purchase a credit to scan again.')
        return
      }
      const data = await res.json()
      setSubscriptions(data.subscriptions ?? [])
    } finally {
      setAnalyzing(false)
      setAnalyzed(true)
    }
  }, [userId])

  const totalMonthly = subscriptions.reduce((sum, s) => sum + (s.monthly ?? s.amount ?? 0), 0)

  return (
    <div className="bg-background text-on-background min-h-screen pb-32 selection:bg-primary selection:text-on-primary">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#131b2e] shadow-[0_24px_40px_rgba(219,226,253,0.06)] flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <Link href="/" className="text-[#44E2CD] active:scale-95 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="tracking-tighter text-2xl font-bold text-[#44E2CD]">SubSnap</h1>
        <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
        </div>
      </header>

      <main className="pt-20 pb-32 px-4 sm:px-6 max-w-2xl mx-auto space-y-5 sm:space-y-8">

        {/* Hero Section: Total Savings */}
        <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 bg-gradient-to-br from-[#69ffe9] to-[#44e2cd] text-[#003731]">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-1 sm:mb-2">
              {analyzed ? 'Total Savings Identified' : 'Statement Scanner'}
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter -ml-1 mb-4 sm:mb-6">
              {analyzed && totalMonthly > 0
                ? `$${totalMonthly.toFixed(2)}`
                : analyzed
                ? '$0.00'
                : 'Ready.'}
            </h2>
            <div className="flex items-center gap-2 bg-[#003731]/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="text-xs font-bold tracking-tight">
                {analyzing
                  ? 'Scanning your statement…'
                  : analyzed
                  ? `${subscriptions.length} subscription${subscriptions.length !== 1 ? 's' : ''} found`
                  : 'Upload a statement to begin'}
              </span>
            </div>
          </div>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#003731]/5 rounded-full blur-2xl" />
        </section>

        {/* Credit Balance */}
        <div className="bg-surface-container-low rounded-[2rem] p-4 sm:p-6">
          <CreditBalance />
        </div>

        {/* Instant Search Bar */}
        <QuickCancelBar />

        {/* Upload Section */}
        <section className="bg-surface-container-low rounded-[2rem] p-5 sm:p-8 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
            <span className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase">Upload Statement</span>
          </div>
          <FileUpload onFileProcessed={handleFileProcessed} />
          {canvas && (
            <Redactor
              sourceCanvas={canvas}
              textItems={textItems}
              onRedacted={handleRedacted}
            />
          )}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest rounded-full border border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-on-surface-variant">Zero Bank Login</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest rounded-full border border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>encrypted</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-on-surface-variant">Processed in-browser</span>
            </div>
          </div>
        </section>

        {/* Subscription Results */}
        {analyzed && (
          <section className="space-y-6">
            <div className="flex items-end justify-between px-2">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Identified Subscriptions</h3>
                <p className="text-xs text-on-surface-variant tracking-wide">
                  Found {subscriptions.length} recurring charge{subscriptions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {subscriptions.length === 0 ? (
              <div className="bg-surface-container-low p-8 rounded-[2rem] flex flex-col items-center text-center gap-4">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">search_off</span>
                <p className="font-bold text-on-surface">No subscriptions detected</p>
                <p className="text-sm text-on-surface-variant">Try uploading a different statement.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Preview subscriptions={subscriptions} />
              </div>
            )}
          </section>
        )}

        {/* Insights Summary (when subscriptions found) */}
        {subscriptions.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-6 rounded-[2rem] flex flex-col justify-between aspect-square">
              <span className="material-symbols-outlined text-secondary">payments</span>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Monthly Spend</p>
                <p className="text-2xl font-bold tracking-tight">${totalMonthly.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-surface-container-highest/40 backdrop-blur-sm p-6 rounded-[2rem] flex flex-col justify-between aspect-square">
              <span className="material-symbols-outlined text-primary">query_stats</span>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Subscriptions</p>
                <p className="text-2xl font-bold tracking-tight">{subscriptions.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing */}
        <section className="bg-surface-container-low rounded-[2rem] p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <span className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase">Get Cancel Credits</span>
          </div>
          <PricingCards userId={userId} />
        </section>

        <div className="pb-8 flex flex-col items-center">
          <div className="w-12 h-1 bg-surface-container-highest rounded-full" />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
