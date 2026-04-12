import Link from 'next/link'

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#2d3449]/60 backdrop-blur-xl rounded-t-[2rem] z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
      <Link href="/" className="flex flex-col items-center justify-center bg-gradient-to-br from-[#69ffe9] to-[#44e2cd] text-[#003731] rounded-full px-5 py-2 transition-transform duration-150 active:scale-90">
        <span className="material-symbols-outlined">dashboard</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.1em]">Overview</span>
      </Link>
      <Link href="/app" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-5 py-2 hover:text-[#44E2CD] transition-all active:scale-90">
        <span className="material-symbols-outlined">subscriptions</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.1em]">Subscriptions</span>
      </Link>
      <Link href="/#how-it-works" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-5 py-2 hover:text-[#44E2CD] transition-all active:scale-90">
        <span className="material-symbols-outlined">analytics</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.1em]">Insights</span>
      </Link>
      <Link href="/#pricing" className="flex flex-col items-center justify-center text-[#dbe2fd]/50 px-5 py-2 hover:text-[#44E2CD] transition-all active:scale-90">
        <span className="material-symbols-outlined">settings</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.1em]">Pricing</span>
      </Link>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-[#060d20] w-full py-12 px-8 border-t border-[#3c4a47]/15">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="text-[#69ffe9] font-black text-xl">SubSnap</div>
          <div className="text-[#dbe2fd]/60 text-[0.75rem] uppercase tracking-[0.1em] font-medium">© 2026 SubSnap. All rights reserved.</div>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link href="/privacy" className="text-[#dbe2fd]/60 hover:text-[#69ffe9] text-[0.75rem] uppercase tracking-[0.1em] font-medium transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-[#dbe2fd]/60 hover:text-[#69ffe9] text-[0.75rem] uppercase tracking-[0.1em] font-medium transition-colors">Terms of Service</Link>
          <Link href="/refund" className="text-[#dbe2fd]/60 hover:text-[#69ffe9] text-[0.75rem] uppercase tracking-[0.1em] font-medium transition-colors">Refund Policy</Link>
        </div>
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#131b2e] shadow-[0_24px_40px_rgba(219,226,253,0.06)]">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <h1 className="font-bold tracking-tighter text-2xl text-[#44E2CD]">SubSnap</h1>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-[#dbe2fd]/70 font-medium hover:text-white transition-colors text-sm" href="#how-it-works">How it Works</a>
            <a className="text-[#dbe2fd]/70 font-medium hover:text-white transition-colors text-sm" href="#pricing">Pricing</a>
            <Link href="/app" className="bg-gradient-to-br from-[#69ffe9] to-[#44e2cd] text-[#003731] px-6 py-2 rounded-full font-bold hover:scale-105 active:opacity-80 transition-all">
              Get Started
            </Link>
          </div>
          <Link href="/app" className="md:hidden bg-gradient-to-br from-[#69ffe9] to-[#44e2cd] text-[#003731] px-4 py-2 rounded-full font-bold text-sm active:opacity-80 transition-all">
            Get Started
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto mt-8 mb-16 text-center">
          <h2 className="text-[3.5rem] leading-none font-extrabold tracking-tight text-on-surface mb-6 -ml-1">
            Your Money, Reclaimed.
          </h2>
          <p className="text-on-surface-variant font-medium mb-10 max-w-xl mx-auto leading-relaxed">
            Upload your bank statement — we find every hidden subscription instantly.
          </p>

          {/* Upload Area */}
          <div className="relative group mt-12">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary to-primary-container rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <Link href="/app" className="relative block bg-surface-container-low rounded-[2rem] p-12 border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center min-h-[320px] cursor-pointer hover:border-primary/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Upload Bank Statement</h3>
              <p className="text-on-surface-variant mb-8 font-medium">Drag &amp; Drop or Browse</p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-full border border-outline-variant/10">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-on-surface-variant">ZERO BANK LOGIN</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-full border border-outline-variant/10">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>encrypted</span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-on-surface-variant">Processed in-browser</span>
                </div>
              </div>
            </Link>
          </div>
          <p className="text-sm text-on-surface-variant font-medium mt-6">
            First cancellation guide — free. No credit card needed to scan.
          </p>
        </section>

        {/* Insights Bento Grid */}
        <section id="pricing" className="max-w-4xl mx-auto mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* App Preview Card */}
            <div className="bg-surface-container-high rounded-[2rem] p-8 overflow-hidden relative min-h-[300px] md:row-span-2">
              <div className="relative z-10">
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary mb-4 block">Dashboard</span>
                <h3 className="text-2xl font-bold text-on-surface mb-4">Precision Analysis</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                  Get direct cancellation links for every subscription found.
                </p>
                <Link href="/app" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  Open Dashboard
                </Link>
              </div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Security Highlight */}
            <div className="bg-surface-container-low rounded-[2rem] p-8 flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-secondary text-3xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                <h3 className="text-xl font-bold text-on-surface mb-2">Privacy First</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Your PDF is processed entirely in your browser. We never see your raw bank data.
                </p>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-[#69ffe9] to-[#44e2cd] rounded-[2rem] p-8 flex flex-col justify-between text-[#003731]">
              <div>
                <h3 className="text-2xl font-black mb-1">Simple Pricing</h3>
                <p className="font-bold opacity-80">Full statement scan</p>
              </div>
              <div className="flex items-baseline gap-1 mt-8">
                <span className="text-4xl font-black">$5</span>
                <span className="font-bold">/one-time scan</span>
              </div>
            </div>
            <p className="text-center text-[11px] text-on-surface-variant/70 px-4 leading-tight -mt-2">
              Not happy? If nothing was found or a technical issue occurred, email{' '}
              <a className="underline" href="mailto:contact@subsnap.net">contact@subsnap.net</a>{' '}
              for a full refund.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-4xl mx-auto mb-20">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-secondary mb-2">The Process</span>
            <h2 className="text-3xl font-bold text-on-surface">Three Steps to Freedom</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-surface-container-lowest p-8 rounded-[2rem] flex items-center gap-6">
              <span className="text-4xl font-black text-outline-variant/30">01</span>
              <div>
                <h4 className="font-bold text-on-surface">Upload Statement</h4>
                <p className="text-on-surface-variant text-sm">Securely provide your PDF or CSV bank record.</p>
              </div>
            </div>
            <div className="bg-surface-container-low p-8 rounded-[2rem] flex items-center gap-6">
              <span className="text-4xl font-black text-outline-variant/30">02</span>
              <div>
                <h4 className="font-bold text-on-surface">AI Detection</h4>
                <p className="text-on-surface-variant text-sm">Our AI identifies all recurring charges in your statement.</p>
              </div>
            </div>
            <div className="bg-surface-container-high p-8 rounded-[2rem] flex items-center gap-6">
              <span className="text-4xl font-black text-outline-variant/30">03</span>
              <div>
                <h4 className="font-bold text-on-surface">Reclaim &amp; Cancel</h4>
                <p className="text-on-surface-variant text-sm">Get direct cancellation links for every subscription found.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="max-w-4xl mx-auto bg-surface-container-high rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-on-surface mb-2">Uncover Hidden Costs</h3>
            <p className="text-on-surface-variant text-sm max-w-md mx-auto">
              Beautiful insights that make managing finances feel like a concierge service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-highest/50 backdrop-blur-md rounded-[1.5rem] p-6 border border-outline-variant/20">
              <span className="material-symbols-outlined text-primary mb-3 block">search</span>
              <h4 className="font-bold text-on-surface mb-1">Smart Detection</h4>
              <p className="text-xs text-on-surface-variant">Identifies subscriptions even with obscure billing names.</p>
            </div>
            <div className="bg-surface-container-highest/50 backdrop-blur-md rounded-[1.5rem] p-6 border border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary mb-3 block">link</span>
              <h4 className="font-bold text-on-surface mb-1">Direct Cancel Links</h4>
              <p className="text-xs text-on-surface-variant">Jump straight to each service's cancellation page.</p>
            </div>
            <div className="bg-surface-container-highest/50 backdrop-blur-md rounded-[1.5rem] p-6 border border-outline-variant/20">
              <span className="material-symbols-outlined text-tertiary mb-3 block">shield</span>
              <h4 className="font-bold text-on-surface mb-1">Zero Data Storage</h4>
              <p className="text-xs text-on-surface-variant">Your statement never leaves your device.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}
