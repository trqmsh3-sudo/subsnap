import Link from 'next/link'

function Footer() {
  return (
    <footer className="bg-[#060d20] w-full py-12 px-8 border-t border-[#3c4a47]/15">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
        <div>
          <span className="text-[#69ffe9] font-black text-xl tracking-tighter">SubSnap</span>
          <p className="text-[#dbe2fd]/60 text-[0.75rem] mt-2">© 2026 SubSnap. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link href="/privacy" className="text-[0.75rem] uppercase tracking-[0.1em] font-medium text-[#dbe2fd]/60 hover:text-[#69ffe9] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-[0.75rem] uppercase tracking-[0.1em] font-medium text-[#dbe2fd]/60 hover:text-[#69ffe9] transition-colors">Terms of Service</Link>
          <Link href="/refund" className="text-[0.75rem] uppercase tracking-[0.1em] font-medium text-[#69ffe9]">Refund Policy</Link>
        </div>
      </div>
    </footer>
  )
}

export default function RefundPage() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#0b1326]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-[#69ffe9] font-black text-xl">SubSnap</Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[#dbe2fd]/70 font-medium hover:text-white transition-colors text-sm">Home</Link>
          <Link href="/app" className="text-[#dbe2fd]/70 font-medium hover:text-white transition-colors text-sm">Dashboard</Link>
          <Link href="/#pricing" className="text-[#dbe2fd]/70 font-medium hover:text-white transition-colors text-sm">Pricing</Link>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto min-h-screen">
        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20 items-start overflow-hidden">
          <div className="md:col-span-8">
            <label className="text-[0.75rem] uppercase tracking-[0.1em] font-semibold text-secondary mb-4 block">
              Satisfaction Guaranteed
            </label>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              Short, clear, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                and fair.
              </span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
              At SubSnap, we believe managing your subscriptions should be stress-free. Our refund
              policy reflects our commitment to providing a high-end, honest service.
            </p>
          </div>
          <div className="md:col-span-4 flex justify-end">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-[0_0_40px_rgba(105,255,233,0.2)]">
              <span
                className="material-symbols-outlined text-on-primary text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
            </div>
          </div>
        </div>

        {/* Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Major Statement Card */}
          <div className="md:col-span-2 glass-card p-10 rounded-xl flex flex-col justify-between min-h-[320px]">
            <div>
              <h2 className="text-2xl font-bold mb-6">Our 100% Money-Back Guarantee</h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
                We stand by the accuracy of our detection engine. If SubSnap doesn&rsquo;t deliver the
                insights you were promised, we don&rsquo;t deserve your money.
              </p>
              <div className="flex items-center gap-3 text-primary font-medium">
                <span className="material-symbols-outlined">check_circle</span>
                <span>Zero questions asked for technical failures</span>
              </div>
            </div>
            <div className="mt-8">
              <a
                href="mailto:contact@subsnap.net"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold transition-transform active:scale-95 shadow-lg"
              >
                Request a Refund
              </a>
            </div>
          </div>

          {/* Not Happy Card */}
          <div className="bg-surface-container-high p-8 rounded-xl flex flex-col">
            <span className="material-symbols-outlined text-secondary text-3xl mb-4">search_off</span>
            <h3 className="text-xl font-bold mb-4">Not happy?</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              If nothing was found or a technical issue occurred, simply email{' '}
              <a href="mailto:contact@subsnap.net" className="text-primary">contact@subsnap.net</a>{' '}
              for a full refund. We process most requests within 24 hours.
            </p>
          </div>

          {/* Visual Break */}
          <div className="md:col-span-3 h-48 rounded-xl overflow-hidden relative bg-surface-container-high">
            <div className="absolute inset-0 bg-gradient-to-r from-[#060d20] via-surface-container to-transparent flex items-center px-12">
              <p className="text-2xl font-light italic text-on-surface">
                &ldquo;Simplicity in policy, excellence in service.&rdquo;
              </p>
            </div>
          </div>

          {/* Eligibility */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10">
            <h4 className="text-[0.7rem] uppercase tracking-widest font-bold text-on-surface-variant mb-6">Eligibility</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm">
                <span className="text-primary">•</span>
                <span>Technical detection errors</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-primary">•</span>
                <span>Incorrect account scanning</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-primary">•</span>
                <span>Duplicate charges</span>
              </li>
            </ul>
          </div>

          {/* The Process */}
          <div className="bg-surface-container-low p-8 rounded-xl md:col-span-2">
            <h4 className="text-[0.7rem] uppercase tracking-widest font-bold text-on-surface-variant mb-6">The Process</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-black text-outline-variant/30">01</span>
                <p className="text-sm font-semibold">Email Us</p>
                <p className="text-xs text-on-surface-variant">Send your receipt to contact@subsnap.net</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-black text-outline-variant/30">02</span>
                <p className="text-sm font-semibold">Review</p>
                <p className="text-xs text-on-surface-variant">We review your request within 24h</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-black text-outline-variant/30">03</span>
                <p className="text-sm font-semibold">Refund</p>
                <p className="text-xs text-on-surface-variant">Funds return to your bank in 3–5 business days</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
