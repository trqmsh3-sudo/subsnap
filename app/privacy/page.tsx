import Link from 'next/link'

function Nav() {
  return (
    <nav className="bg-[#0B1326] top-0 sticky z-50 shadow-[0_20px_40px_rgba(27,59,90,0.4)]">
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
            className="bg-secondary text-on-secondary px-6 py-2 rounded-xl font-bold hover:scale-105 active:opacity-80 transition-all duration-300"
          >
            Get Started
          </Link>
        </div>
        <div className="md:hidden">
          <span className="material-symbols-outlined text-white">menu</span>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-[#0B1326] py-12 mt-auto border-t border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto">
        <div className="mb-8 md:mb-0">
          <div className="text-lg font-bold text-slate-300">SubSnap</div>
          <div className="text-sm tracking-wide uppercase font-semibold text-slate-500 mt-2">
            © 2026 SubSnap. 2026 Compliant.
          </div>
        </div>
        <div className="flex gap-8">
          <Link href="/privacy" className="text-white text-sm tracking-wide uppercase font-semibold hover:text-[#44E2CD] transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm tracking-wide uppercase font-semibold text-slate-500 hover:text-[#44E2CD] transition-colors duration-200">
            Terms of Service
          </Link>
          <Link href="/refund" className="text-sm tracking-wide uppercase font-semibold text-slate-500 hover:text-[#44E2CD] transition-colors duration-200">
            Refund Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default function PrivacyPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col selection:bg-secondary selection:text-on-secondary">
      <div className="fixed inset-0 noise-texture z-0 pointer-events-none" />
      <Nav />

      <main className="relative z-10 flex-grow max-w-5xl mx-auto px-6 py-16 md:py-24">

        {/* Header */}
        <header className="mb-20">
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-surface-container-high border border-outline-variant/15">
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-secondary">
              Policy Revision 2026.01
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-6 leading-none">
            Privacy as an <span className="text-secondary">Architecture.</span>
          </h1>
          <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl leading-relaxed font-medium">
            At SubSnap, your financial data is treated as a high-fidelity instrument. We don&apos;t
            just &ldquo;protect&rdquo; your data; we architected our platform so we can never see it.
          </p>
        </header>

        {/* Zero-knowledge highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="col-span-1 md:col-span-3 bg-primary-container p-8 md:p-12 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <span className="material-symbols-outlined text-[120px]">verified_user</span>
            </div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-4">In-Browser Analysis</h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
                Your bank statement is processed in your browser session. We extract only subscription
                names and amounts — no account numbers, no personal details. SubSnap employees cannot,
                under any circumstances, access your raw financial data.
              </p>
              <div className="flex items-center gap-4 text-secondary">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock
                </span>
                <span className="font-bold tracking-wider text-xs uppercase">
                  Local Processing: Your data is processed locally in your browser and never stored on our servers.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Policy content grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Sidebar navigation */}
          <aside className="hidden md:block md:col-span-3 space-y-4 sticky top-32 h-fit">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-outline mb-6">Contents</div>
            <nav className="flex flex-col gap-3">
              <a href="#data-collection" className="text-sm font-semibold text-secondary flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-secondary" />
                Data Collection
              </a>
              <a href="#redaction" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                Local Redaction
              </a>
              <a href="#ai-models" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                AI Processing
              </a>
              <a href="#rights" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                Your Rights
              </a>
            </nav>
          </aside>

          {/* Legal sections */}
          <div className="md:col-span-9 space-y-24">

            <section id="data-collection" className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-12 bg-secondary/30" />
                <h3 className="text-sm font-bold tracking-widest text-white uppercase">01. Data Collection</h3>
              </div>
              <div className="bg-surface-container-low p-8 md:p-12 rounded-xl">
                <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
                  We prioritize the &ldquo;Principle of Least Privilege.&rdquo; We only collect metadata necessary
                  to maintain your account stability and subscription status.
                </p>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <span className="text-secondary font-bold shrink-0">Account Metadata:</span>
                    <span className="text-on-surface-variant">
                      Email addresses and authentication tokens are stored using irreversible bcrypt hashing.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-secondary font-bold shrink-0">No Bank Connection:</span>
                    <span className="text-on-surface-variant">
                      We never connect to your bank. You upload a PDF or screenshot — that&apos;s it.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            <section id="redaction" className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-12 bg-secondary/30" />
                <h3 className="text-sm font-bold tracking-widest text-white uppercase">02. Local Redaction Policy</h3>
              </div>
              <div className="bg-surface-container-low p-8 md:p-12 rounded-xl border-l-4 border-secondary">
                <h4 className="text-white font-bold text-xl mb-4">Edge-First Processing</h4>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                  Our proprietary &ldquo;Redact-on-Edge&rdquo; technology scrubs PII (Personally Identifiable
                  Information) directly on your device. Any transaction strings sent to our AI engines
                  are stripped of names, locations, and specific account numbers before transmission.
                </p>
              </div>
            </section>

            <section id="ai-models" className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-12 bg-secondary/30" />
                <h3 className="text-sm font-bold tracking-widest text-white uppercase">03. Third-Party AI Models</h3>
              </div>
              <div className="bg-surface-container p-8 md:p-12 rounded-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-[200px]">neurology</span>
                </div>
                <div className="relative z-10">
                  <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
                    To provide financial insights, we utilize state-of-the-art LLMs. Our agreement
                    with these providers (including Claude (Anthropic) and Gemini (Google)) explicitly
                    prohibits the use of your data for model training.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-surface-container-high p-4 rounded-lg flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary">check_circle</span>
                      <span className="text-sm font-bold text-white">No Training Use</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="rights" className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-12 bg-secondary/30" />
                <h3 className="text-sm font-bold tracking-widest text-white uppercase">04. Your Rights</h3>
              </div>
              <div className="bg-surface-container-low p-8 md:p-12 rounded-xl">
                <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
                  You maintain total ownership of your digital footprint. At any time, you can invoke
                  the following via your Dashboard:
                </p>
                <div className="space-y-2">
                  <div className="text-white font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-sm">delete</span>
                    Data Deletion
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    Contact us at{' '}
                    <a
                      href="mailto:privacy@subsnap.com"
                      className="text-secondary underline underline-offset-4"
                    >
                      privacy@subsnap.com
                    </a>{' '}
                    to request data deletion.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Trust seal CTA */}
        <div className="mt-32 p-12 rounded-2xl bg-gradient-to-br from-primary-container to-surface-container-high text-center border border-outline-variant/10">
          <h2 className="text-3xl font-bold text-white mb-4">Questions about your data?</h2>
          <p className="text-on-surface-variant mb-8 max-w-lg mx-auto">
            Our security team is ready to provide technical deep-dives into our encryption standards.
          </p>
          <a
            href="mailto:privacy@subsnap.com"
            className="inline-flex items-center gap-3 bg-secondary text-on-secondary px-8 py-3 rounded-xl font-bold hover:scale-105 active:opacity-90 transition-all"
          >
            Contact Privacy Team
            <span className="material-symbols-outlined text-sm">mail</span>
          </a>
        </div>

      </main>
      <Footer />
    </div>
  )
}
