import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

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

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafc] text-slate-900">
      <Header />

      <main className="flex-1 pt-14 pb-12">
        {/* ── HERO SECTION: SPLIT SCREEN WITH SEAMLESS GRADIENT MASK ────────── */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[480px] lg:min-h-[540px]">
            
            {/* Left Half: Shocked Statement Image with Gradient Mask into Studio White */}
            <div className="lg:col-span-6 relative w-full h-[280px] sm:h-[340px] lg:h-full overflow-hidden bg-slate-100">
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

            {/* Right Half: Studio White Typography, Headline, CTA & Above-the-Fold 3 Steps */}
            <div className="lg:col-span-6 flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-6 lg:py-8 space-y-4">
              
              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-slate-950 leading-[1.1] text-shadow-title">
                Stop Paying for Subscriptions You Forgot.
              </h1>

              {/* Sub-headline */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl text-shadow-subtle">
                The smart Chrome extension that navigates right into your authenticated accounts and cancels recurring charges in 3 seconds flat.
              </p>

              {/* Big Prominent CTA Button */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href="https://github.com/trqmsh3-sudo/subsnap/raw/main/subsnap-extension.zip"
                  download
                  className="btn-chrome px-7 py-3.5 rounded-2xl text-sm sm:text-base font-extrabold flex items-center justify-center gap-2.5 shadow-xl"
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
              <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2.5">
                <span className="font-semibold text-emerald-700">✓ 100% Free Forever</span>
                <span>·</span>
                <span>✓ Zero passwords stored</span>
                <span>·</span>
                <span>✓ Installs in 3 seconds</span>
              </div>

              {/* Unboxed 3-Step Guide (Now Fits Above the Fold Immediately) */}
              <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs text-slate-600">
                <div className="font-extrabold text-slate-900 text-xs tracking-wide uppercase text-shadow-subtle">
                  How it works in 3 simple steps:
                </div>
                <div className="grid grid-cols-3 gap-3 pt-0.5">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                      <span className="text-emerald-600 font-black">1.</span> Direct Entry
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Opens inside your active billing page.
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                      <span className="text-emerald-600 font-black">2.</span> Bypass Traps
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Skips surveys, popups & penalties.
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                      <span className="text-emerald-600 font-black">3.</span> 1-Click Done
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Auto-Pilot cancels in 3 seconds.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── WHY BROWSER EXTENSION (10X BETTER THAN A WEBSITE) ────────────── */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-6 pt-16 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
              The Extension Superpower
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight text-shadow-title">
              Why SubSnap Lives Inside Your Browser
            </h2>
            <p className="text-sm text-slate-500 text-shadow-subtle">
              Websites require passwords and manual searching. The SubSnap extension takes action directly where you are already logged in.
            </p>
          </div>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="studio-white-card p-7 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-black text-lg shadow-sm">
                🔒
              </div>
              <h3 className="font-extrabold text-base text-slate-900 text-shadow-subtle">
                Zero Password Friction
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Because SubSnap runs directly in your Chrome browser, it utilizes your existing active logins. You never have to re-enter passwords, credit cards, or 2FA SMS codes.
              </p>
            </div>

            <div className="studio-white-card p-7 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center font-black text-lg shadow-sm">
                ⚡
              </div>
              <h3 className="font-extrabold text-base text-slate-900 text-shadow-subtle">
                In-Page Auto-Pilot HUD
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                When you open a subscription page, a floating assistant automatically scrolls to the hidden cancel button, highlights it, and counts down 3 seconds to cancel.
              </p>
            </div>

            <div className="studio-white-card p-7 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-black text-lg shadow-sm">
                🛡️
              </div>
              <h3 className="font-extrabold text-base text-slate-900 text-shadow-subtle">
                Retention Trap Bypass
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Services like Adobe and Amazon deliberately hide cancellation behind surveys and fake discount popups. SubSnap navigates straight to the clean exit.
              </p>
            </div>

          </div>

          {/* Value Banner CTA */}
          <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-0.5">
              <div className="font-extrabold text-sm text-slate-900">
                Ready to stop wasted monthly charges?
              </div>
              <div className="text-xs text-slate-600">
                Average user saves over <strong>$490 every year</strong> with SubSnap.
              </div>
            </div>
            <a
              href="https://github.com/trqmsh3-sudo/subsnap/raw/main/subsnap-extension.zip"
              download
              className="btn-chrome px-6 py-3 rounded-xl text-xs font-extrabold shrink-0 flex items-center gap-2"
            >
              <span>Add to Chrome (Free)</span>
              <span>➔</span>
            </a>
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
                  Free Extension
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-950 text-shadow-subtle">$0</div>
                  <div className="text-xs text-slate-400">Free forever · No credit card required</div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 pt-2">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> <strong>Autonomous Auto-Pilot cancellation included</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> Direct deep cancellation pathways
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> In-page cancel button highlighter
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> Chrome toolbar quick launcher
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> 100% Client-Side Privacy (Zero Passwords)
                  </li>
                </ul>
              </div>

              <a
                href="https://github.com/trqmsh3-sudo/subsnap/raw/main/subsnap-extension.zip"
                download
                className="w-full py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-900 font-bold text-xs text-center transition-colors block"
              >
                Add to Chrome for Free
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
                    <span className="text-emerald-600 font-bold">✓</span> <strong className="text-emerald-700">UNLIMITED Autonomous Auto-Pilot cancellations</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> <strong>10 AI bank statement scans / mo</strong> (Gemini Flash)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span> <strong>Dark-pattern retention bypass</strong> (Adobe, Amazon)
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
