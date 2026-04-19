import Link from 'next/link'

function Footer() {
  return (
    <footer className="bg-[#060d20] w-full py-12 px-8 border-t border-[#3c4a47]/15">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="text-[#69ffe9] font-black text-xl">SubSnap</div>
          <div className="text-[#dbe2fd]/60 text-[0.75rem] uppercase tracking-[0.1em] font-medium">© 2026 SubSnap. All rights reserved.</div>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link href="/privacy" className="text-[#69ffe9] text-[0.75rem] uppercase tracking-[0.1em] font-medium transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-[#dbe2fd]/60 hover:text-[#69ffe9] text-[0.75rem] uppercase tracking-[0.1em] font-medium transition-colors">Terms of Service</Link>
          <Link href="/refund" className="text-[#dbe2fd]/60 hover:text-[#69ffe9] text-[0.75rem] uppercase tracking-[0.1em] font-medium transition-colors">Refund Policy</Link>
        </div>
      </div>
    </footer>
  )
}

export default function PrivacyPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen selection:bg-primary/30">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#0b1326]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="md:hidden text-[#44E2CD] active:scale-95 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <Link href="/" className="text-[#69ffe9] font-black text-xl">SubSnap</Link>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[#dbe2fd]/70 font-medium hover:text-white transition-colors text-sm">Home</Link>
          <Link href="/app" className="text-[#dbe2fd]/70 font-medium hover:text-white transition-colors text-sm">Dashboard</Link>
          <Link href="/#pricing" className="text-[#dbe2fd]/70 font-medium hover:text-white transition-colors text-sm">Pricing</Link>
        </nav>
      </header>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="mb-24 flex flex-col md:flex-row gap-12 items-end">
          <div className="flex-1">
            <label className="text-[0.75rem] uppercase tracking-[0.1em] font-bold text-primary mb-4 block">Legal Center</label>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
              Privacy <br /><span className="text-primary">Matters.</span>
            </h2>
            <p className="text-on-surface-variant text-lg max-w-xl">
              At SubSnap, we believe your financial data belongs to you. Our Privacy Policy is designed
              to be as transparent as our dashboard.
            </p>
          </div>
          <div className="hidden md:flex w-32 h-32 rounded-full border border-outline-variant/15 items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          </div>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Information We Collect */}
          <div className="md:col-span-8 bg-surface-container-low rounded-[2rem] p-8 md:p-12 border border-outline-variant/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">data_object</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Information We Collect</h3>
            </div>
            <div className="space-y-6 text-on-surface-variant leading-relaxed">
              <p>
                We only collect the minimum amount of data necessary to provide you with an accurate
                overview of your monthly commitments. This includes:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <li className="bg-surface-container-high p-4 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>
                  <span>Transaction descriptions identifying subscription keywords.</span>
                </li>
                <li className="bg-surface-container-high p-4 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-sm mt-1">check_circle</span>
                  <span>Amount and frequency of recurring payments.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Zero Bank Login Accent Card */}
          <div className="md:col-span-4 bg-primary-container/10 rounded-[2rem] p-8 border border-primary/20 flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-primary text-4xl mb-6 block" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              <h3 className="text-2xl font-bold tracking-tight text-primary mb-4 leading-tight">
                Zero Bank Login Architecture
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                You upload a PDF directly. We never connect to your bank or store your financial data.
              </p>
            </div>
            <div className="mt-8 relative z-10">
              <div className="text-[0.65rem] uppercase tracking-widest font-black text-primary opacity-50 mb-2">Security Status</div>
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Active Protection
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          </div>

          {/* How We Use Data */}
          <div className="md:col-span-6 bg-surface-container-low rounded-[2rem] p-8 md:p-12 border border-outline-variant/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">query_stats</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">How We Use Your Data</h3>
            </div>
            <p className="text-on-surface-variant leading-relaxed mb-6">
              Our algorithms analyze your transaction history with a single goal: identifying
              subscriptions you might have forgotten or want to manage.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="text-secondary font-black text-xl">01</div>
                <p className="text-sm text-on-surface-variant">Categorizing spending into Subscription, Fixed Cost, or Variable.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="text-secondary font-black text-xl">02</div>
                <p className="text-sm text-on-surface-variant">Calculating your monthly and yearly subscription &ldquo;burn rate&rdquo;.</p>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="md:col-span-6 bg-surface-container-low rounded-[2rem] p-8 md:p-12 border border-outline-variant/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-tertiary-container/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary">gavel</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Your Rights</h3>
            </div>
            <p className="text-on-surface-variant leading-relaxed mb-8">
              You are the curator of your information. We provide the tools for you to exercise full
              control over your digital footprint on SubSnap.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: 'delete_forever', label: 'Right to Erase' },
                { icon: 'file_download', label: 'Right to Port' },
                { icon: 'edit_note', label: 'Right to Rectify' },
                { icon: 'visibility', label: 'Right to Access' },
              ].map(({ icon, label }) => (
                <div key={label} className="p-4 rounded-2xl bg-surface-container-highest border border-outline-variant/10 hover:border-primary/30 transition-colors">
                  <span className="material-symbols-outlined text-primary mb-2 block">{icon}</span>
                  <h4 className="font-bold text-sm">{label}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Ethical Commitment */}
          <div className="md:col-span-12 bg-[#060d20] rounded-[2.5rem] p-12 mt-12 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center md:text-left">
              <h3 className="text-3xl font-black mb-4">The Ethical Commitment.</h3>
              <p className="text-on-surface-variant">
                We will never sell your personal data to third parties. Our business model is based
                on premium features, not on the monetization of your private financial life.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/app"
                className="bg-primary hover:bg-primary-container text-on-primary font-black py-4 px-10 rounded-full transition-all active:scale-95 shadow-lg shadow-primary/10 inline-block"
              >
                Start Scanning
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
