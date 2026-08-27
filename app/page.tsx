'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CANCELLATION_DB, CancellationEntry, findCancellationEntry } from '@/lib/cancellationDb'

const POPULAR_GLOBAL_SERVICES = [
  { name: 'Claude Pro / Max', q: 'Claude', tag: 'AI', desc: 'Anthropic AI subscription' },
  { name: 'Grok / X Premium', q: 'Grok', tag: 'X', desc: 'X Corp subscription' },
  { name: 'Netflix', q: 'Netflix', tag: 'Stream', desc: 'Streaming membership' },
  { name: 'Spotify Premium', q: 'Spotify', tag: 'Music', desc: 'Audio streaming' },
  { name: 'Adobe Creative Cloud', q: 'Adobe', tag: 'Design', desc: 'Adobe plan & apps' },
  { name: 'ChatGPT Plus', q: 'ChatGPT', tag: 'AI', desc: 'OpenAI subscription' },
  { name: 'Canva Pro', q: 'Canva', tag: 'Design', desc: 'Canva team/pro plan' },
  { name: 'Apple / iCloud+', q: 'Apple', tag: 'iOS', desc: 'Apple ID subscriptions' },
  { name: 'Amazon Prime', q: 'Amazon Prime', tag: 'Shopping', desc: 'Prime delivery & video' },
  { name: 'YouTube Premium', q: 'YouTube', tag: 'Video', desc: 'Ad-free & Music' },
  { name: 'Microsoft 365', q: 'Microsoft', tag: 'Office', desc: 'Word, Excel & OneDrive' },
  { name: 'Midjourney', q: 'Midjourney', tag: 'AI', desc: 'AI image subscription' },
]

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 py-3.5 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-base shadow-sm">
            ⚡
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 text-shadow-subtle">
            SubSnap
          </span>
          <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Chrome Extension
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#search" className="hover:text-slate-900 transition-colors">Supported Services</a>
          <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/trqmsh3-sudo/subsnap/raw/main/subsnap-extension.zip"
            download
            className="btn-chrome px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#4285F4"/>
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
            <span>Add to Chrome (Free)</span>
          </a>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-14 px-6 mt-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div className="space-y-1">
          <div className="text-slate-900 font-extrabold text-base flex items-center justify-center md:justify-start gap-1.5 text-shadow-subtle">
            <span className="text-emerald-600">⚡</span> SubSnap
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            The autonomous Chrome extension for 1-click subscription cancellations directly inside your browser.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-600 font-medium">
          <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
          <Link href="/refund" className="hover:text-slate-900 transition-colors">Service Policy</Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 mt-8 pt-6 border-t border-slate-100">
        © 2026 SubSnap. Official Chrome Extension. Zero-Knowledge Client-Side Privacy.
      </div>
    </footer>
  )
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<CancellationEntry[]>([])
  const [selectedService, setSelectedService] = useState<CancellationEntry | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    const q = query.toLowerCase().trim()
    const matches = CANCELLATION_DB.filter(item =>
      item.name.toLowerCase().includes(q) ||
      (item.nameHe && item.nameHe.toLowerCase().includes(q)) ||
      item.keywords.some(k => k.includes(q) || q.includes(k))
    ).slice(0, 5)

    setSuggestions(matches)
    setShowDropdown(matches.length > 0)
  }, [query])

  function handleCancelClick(item: CancellationEntry) {
    setSelectedService(item)
    setShowDropdown(false)
    if (item.cancelUrl) {
      window.open(item.cancelUrl, '_blank', 'noopener,noreferrer')
    }
  }

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setShowDropdown(false)
    const direct = findCancellationEntry(query)
    if (direct) {
      handleCancelClick(direct)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data.entry) {
        handleCancelClick(data.entry)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafc] text-slate-900">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        {/* ── HERO SECTION: SPLIT SCREEN WITH SEAMLESS GRADIENT MASK ────────── */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[580px] lg:min-h-[640px]">
            
            {/* Left Half: Shocked Statement Image with Gradient Mask into Studio White */}
            <div className="lg:col-span-6 relative w-full h-[360px] sm:h-[420px] lg:h-full overflow-hidden bg-slate-100">
              <Image
                src="/hero-statement.jpg"
                alt="Man shocked by recurring bank statement subscription charges"
                fill
                priority
                className="object-cover object-center lg:object-left"
              />
              {/* Desktop Gradient Mask: Fades out to Studio White seamlessly on the right */}
              <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-[#fafafc]" />
              {/* Mobile Gradient Mask: Fades out to Studio White at the bottom */}
              <div className="block lg:hidden absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fafafc]" />
            </div>

            {/* Right Half: Studio White Typography, Headline, CTA & Unboxed Explanations */}
            <div className="lg:col-span-6 flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-10 lg:py-16 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 self-start shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>SubSnap 1-Click Chrome Extension · 100% Free</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.15] text-shadow-title">
                Stop Paying for Subscriptions You Forgot.
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl text-shadow-subtle">
                The smart Chrome extension that navigates right into your authenticated accounts and cancels recurring charges in 3 seconds flat.
              </p>

              {/* Big Prominent CTA Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href="https://github.com/trqmsh3-sudo/subsnap/raw/main/subsnap-extension.zip"
                  download
                  className="btn-chrome px-8 py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-3 shadow-xl"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#4285F4"/>
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="white" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                  </svg>
                  <span>Add to Chrome for Free</span>
                  <span className="text-slate-400 font-normal">➔</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-0.5">
                <span className="font-semibold text-emerald-700">✓ 100% Free Forever</span>
                <span>·</span>
                <span>✓ Zero passwords stored</span>
                <span>·</span>
                <span>✓ Installs in 3 seconds</span>
              </div>

              {/* Unboxed Text Explanation (Clean on Studio White Background) */}
              <div className="pt-4 border-t border-slate-200/80 space-y-2.5 text-xs text-slate-600">
                <div className="font-bold text-slate-900 text-sm text-shadow-subtle">
                  How SubSnap works in 3 simple steps:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-emerald-600 font-black">1.</span> Direct Entry
                    </div>
                    <p className="text-slate-500 leading-snug">
                      Opens directly inside your active logged-in billing page.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-emerald-600 font-black">2.</span> Bypass Traps
                    </div>
                    <p className="text-slate-500 leading-snug">
                      Skips tricky retention surveys, discount popups & penalties.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-emerald-600 font-black">3.</span> 1-Click Done
                    </div>
                    <p className="text-slate-500 leading-snug">
                      Auto-Pilot confirms cancellation in 3 seconds.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── INTERACTIVE SEARCH & SUPPORTED SERVICES (STUDIO WHITE) ─────────── */}
        <section id="search" className="max-w-5xl mx-auto px-6 pt-16 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight text-shadow-title">
              Cancel Any Subscription Instantly
            </h2>
            <p className="text-sm text-slate-500 text-shadow-subtle">
              Type any app or service name to launch its direct cancellation pathway:
            </p>
          </div>

          {/* Search Box */}
          <div ref={searchRef} className="max-w-2xl mx-auto relative">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type any service (e.g. Claude, Netflix, Adobe, Spotify, Grok)..."
                  className="w-full command-input-light px-4 py-3.5 rounded-xl text-sm outline-none font-medium"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); setSuggestions([]); setShowDropdown(false); }}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="btn-emerald px-6 py-3.5 rounded-xl text-xs font-bold shrink-0 disabled:opacity-50"
              >
                {loading ? 'Locating...' : 'Cancel Now'}
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-2xl z-50 space-y-1 animate-fadeIn">
                {suggestions.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleCancelClick(item)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-emerald-50 flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                        {item.name}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-slate-500">{item.notes}</div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                      Cancel ➔
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Service Tags Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
            {POPULAR_GLOBAL_SERVICES.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => {
                  const matched = findCancellationEntry(s.q)
                  if (matched) handleCancelClick(matched)
                }}
                className="studio-white-card p-4 text-left flex items-center justify-between hover:border-emerald-300 transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    {s.name}
                  </div>
                  <div className="text-[10px] text-slate-400">{s.desc}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  Cancel ⚡
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── SIDE-BY-SIDE PRICING (STUDIO WHITE) ────────────────────────────── */}
        <section id="pricing" className="max-w-5xl mx-auto px-6 pt-20 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
              Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight text-shadow-title">
              Start Free. Upgrade for Autonomous AI.
            </h2>
            <p className="text-sm text-slate-500 text-shadow-subtle">
              Choose the right plan to take back control of your recurring expenses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            
            {/* Free Tier Card */}
            <div className="studio-white-card p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                  Basic Extension
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-950 text-shadow-subtle">$0</div>
                  <div className="text-xs text-slate-400">Free forever · No credit card required</div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 pt-2">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> Direct deep cancellation links
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> Chrome toolbar quick launcher
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> In-page cancel button highlighter
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> Unlimited manual cancellations
                  </li>
                </ul>
              </div>

              <a
                href="https://github.com/trqmsh3-sudo/subsnap/raw/main/subsnap-extension.zip"
                download
                className="w-full py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-900 font-bold text-xs text-center transition-colors block"
              >
                Add Free Extension
              </a>
            </div>

            {/* Pro Tier Card */}
            <div className="studio-white-card p-8 border-2 border-emerald-500 relative flex flex-col justify-between space-y-6 shadow-xl shadow-emerald-500/10">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-600 text-[10px] font-extrabold text-white uppercase tracking-wider">
                Most Popular
              </div>

              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-xs font-bold text-emerald-800">
                  SubSnap Pro
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-950 text-shadow-subtle">$7.99</span>
                    <span className="text-xs text-slate-500 font-semibold">/ year</span>
                  </div>
                  <div className="text-xs text-emerald-700 font-medium">Just $0.66/month (Billed annually)</div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 pt-2">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> <strong>Everything in Free</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> <strong>10 AI statement scans / mo</strong> (Gemini Flash)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> <strong>Autonomous 3-second Auto-Pilot</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> <strong>Dark-pattern retention bypass</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> Priority AI discovery for obscure SaaS
                  </li>
                </ul>
              </div>

              <Link
                href="/app"
                className="btn-emerald w-full py-3.5 rounded-xl font-bold text-xs text-center transition-all block shadow-lg shadow-emerald-600/25"
              >
                Upgrade to Pro ➔
              </Link>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
