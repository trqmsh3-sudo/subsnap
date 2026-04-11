'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import CreditBalance from '@/components/CreditBalance'
import Preview from '@/components/Preview'
import PricingCards from '@/components/PricingCards'

const FileUpload = dynamic(() => import('@/components/FileUpload'), { ssr: false })
const Redactor = dynamic(() => import('@/components/Redactor'), { ssr: false })

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="bg-[#0B1326] sticky top-0 z-50 shadow-[0_20px_40px_rgba(27,59,90,0.4)]">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto antialiased tracking-tight">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">SubSnap</Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link className="text-slate-400 font-medium hover:text-white transition-colors" href="/#how-it-works">
            How it Works
          </Link>
          <Link className="text-slate-400 font-medium hover:text-white transition-colors" href="/#pricing">
            Pricing
          </Link>
          <Link
            href="/app"
            className="bg-secondary text-on-secondary px-6 py-2 rounded-full font-bold hover:scale-105 active:opacity-80 transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#0B1326] mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 max-w-7xl mx-auto border-t border-white/5">
        <Link href="/" className="text-lg font-bold text-slate-300 mb-4 md:mb-0">SubSnap</Link>
        <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
          <Link href="/privacy" className="text-sm tracking-wide uppercase font-semibold text-slate-500 hover:text-[#44E2CD] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm tracking-wide uppercase font-semibold text-slate-500 hover:text-[#44E2CD] transition-colors">
            Terms of Service
          </Link>
          <Link href="/refund" className="text-sm tracking-wide uppercase font-semibold text-slate-500 hover:text-[#44E2CD] transition-colors">
            Refund Policy
          </Link>
        </div>
        <div className="text-sm tracking-wide uppercase font-semibold text-slate-500">© 2026 SubSnap</div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppPage() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [textItems, setTextItems] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)

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
        body: JSON.stringify({ imageBase64: base64 }),
      })
      const data = await res.json()
      setSubscriptions(data.subscriptions ?? [])
    } finally {
      setAnalyzing(false)
      setAnalyzed(true)
    }
  }, [])

  const scoutStatus = analyzing
    ? 'Scanning...'
    : analyzed && subscriptions.length > 0
    ? 'Complete'
    : analyzed
    ? 'None Found'
    : 'Waiting...'

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="fixed inset-0 noise-texture z-[-1] pointer-events-none" />
      <Nav />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-12 space-y-12">

        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">
            Financial Command
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Upload your bank statement and let our AI Scout dismantle unwanted recurring charges
            with surgical precision.
          </p>
          <div className="pt-1">
            <CreditBalance />
          </div>
        </header>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Upload (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container rounded-[1.5rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none select-none">
              <span className="material-symbols-outlined text-[120px]">cloud_upload</span>
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center space-x-3">
                <span
                  className="material-symbols-outlined text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  security
                </span>
                <span className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
                  Secure Upload Cluster
                </span>
              </div>
              <FileUpload onFileProcessed={handleFileProcessed} />
              {canvas && (
                <Redactor
                  sourceCanvas={canvas}
                  textItems={textItems}
                  onRedacted={handleRedacted}
                />
              )}
            </div>
          </div>

          {/* AI Scout (5 cols) */}
          <div className="lg:col-span-5 bg-surface-container rounded-[1.5rem] p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="ai-gradient absolute inset-0 opacity-5 pointer-events-none" />
            <div className="relative z-10 space-y-8 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-tertiary">query_stats</span>
                  <span className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
                    AI Scout Engine
                  </span>
                </div>
                <div
                  className={`px-3 py-1 rounded-full bg-surface-container-highest border border-outline-variant/20 text-[10px] font-black tracking-tighter uppercase ${
                    analyzing ? 'text-secondary' : 'text-on-surface-variant'
                  }`}
                >
                  {scoutStatus}
                </div>
              </div>
              <div
                className={`flex-grow flex flex-col items-center justify-center text-center space-y-4 transition-opacity ${
                  analyzing || analyzed ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <span className="material-symbols-outlined text-6xl text-tertiary">psychology</span>
                <p className="text-sm text-on-surface-variant">
                  {analyzing
                    ? 'Analyzing statement with AI…'
                    : subscriptions.length > 0
                    ? `Found ${subscriptions.length} subscription${subscriptions.length !== 1 ? 's' : ''}`
                    : analyzed
                    ? 'No subscriptions detected.'
                    : 'Awaiting statement analysis…'}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription intelligence (8 cols) */}
          <div className="lg:col-span-8 bg-surface-container rounded-[1.5rem] p-8 space-y-6">
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-secondary">list_alt</span>
              <span className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
                Subscription Intelligence
              </span>
            </div>

            {subscriptions.length === 0 ? (
              <div className="min-h-[300px] flex flex-col items-center justify-center text-center space-y-4 border border-outline-variant/10 rounded-xl bg-surface-container-low/30">
                <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-3xl">search_off</span>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-on-surface">No subscriptions detected yet</p>
                  <p className="text-sm text-on-surface-variant">Upload a statement to begin.</p>
                </div>
              </div>
            ) : (
              <Preview subscriptions={subscriptions} />
            )}
          </div>

          {/* Execution Phase (4 cols) */}
          <div className="lg:col-span-4 bg-surface-container rounded-[1.5rem] p-8 flex flex-col gap-6">
            <div className="flex items-center space-x-3">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
              <span className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
                Execution Phase
              </span>
            </div>

            <div className="relative w-full aspect-square flex items-center justify-center max-w-[200px] mx-auto">
              <div
                className={`absolute inset-0 border-[12px] rounded-full ${
                  subscriptions.length > 0 ? 'border-secondary/30' : 'border-surface-container-highest'
                }`}
              />
              <div className="text-center">
                <p
                  className={`text-5xl font-black ${
                    subscriptions.length > 0 ? 'text-secondary' : 'text-on-surface-variant opacity-20'
                  }`}
                >
                  {subscriptions.length > 0 ? subscriptions.length : '--'}
                </p>
                <p className="text-xs text-on-surface-variant opacity-40 mt-1">
                  {subscriptions.length > 0 ? 'Detected' : 'Idle'}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl">
              <PricingCards />
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
