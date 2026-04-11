import Link from 'next/link'

function Nav() {
  return (
    <header className="bg-[#0B1326] top-0 sticky z-50 shadow-[0_20px_40px_rgba(27,59,90,0.4)] antialiased tracking-tight">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">SubSnap</Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-slate-400 font-medium hover:text-white transition-colors" href="/#how-it-works">
            How it Works
          </Link>
          <Link className="text-slate-400 font-medium hover:text-white transition-colors" href="/#pricing">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-6">
          <Link
            href="/app"
            className="bg-secondary text-on-secondary px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:opacity-80"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-[#0B1326] py-12 mt-auto border-t border-white/5 text-sm tracking-wide uppercase font-semibold">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto">
        <Link href="/" className="text-lg font-bold text-slate-300 mb-6 md:mb-0">SubSnap</Link>
        <div className="flex flex-wrap justify-center gap-8 mb-6 md:mb-0">
          <Link href="/privacy" className="text-slate-500 hover:text-[#44E2CD] transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-white hover:text-[#44E2CD] transition-colors duration-200">
            Terms of Service
          </Link>
          <Link href="/refund" className="text-slate-500 hover:text-[#44E2CD] transition-colors duration-200">
            Refund Policy
          </Link>
        </div>
        <div className="text-slate-500">© 2026 SubSnap. 2026 Compliant.</div>
      </div>
    </footer>
  )
}

export default function TermsPage() {
  return (
    <div className="bg-surface text-on-surface selection:bg-secondary/30">
      <Nav />

      <main className="min-h-screen pt-12 pb-24 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-16 text-center md:text-left">
            <div className="inline-block px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/15 mb-4">
              <span className="text-secondary text-[10px] uppercase font-bold tracking-[0.2em]">Legal Document</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">Terms of Service</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-4 text-on-surface-variant">
              <p>Last Updated: October 24, 2026</p>
              <span className="hidden md:inline opacity-30">•</span>
              <p>Effective Date: January 01, 2026</p>
            </div>
          </div>

          {/* Agreement overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 shadow-lg flex flex-col justify-between md:col-span-3">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Agreement Overview</h3>
                <p className="text-on-surface-variant leading-relaxed mb-6">
                  By accessing or using SubSnap, you agree to be bound by these Terms of Service.
                  This agreement governs your use of our automated subscription management and
                  cancellation optimization tools.
                </p>
              </div>
              <div className="flex items-center gap-4 text-secondary">
                <span className="material-symbols-outlined">gavel</span>
                <span className="text-sm font-bold tracking-widest uppercase">Legally Binding Agreement</span>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-16">

            <section id="acceptance" className="group">
              <div className="flex items-start gap-6">
                <span className="text-secondary font-black text-2xl opacity-50 group-hover:opacity-100 transition-opacity">01.</span>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Acceptance of Terms</h2>
                  <div className="space-y-4 text-on-surface-variant leading-relaxed">
                    <p>
                      By creating a SubSnap account, you confirm that you are at least 18 years of
                      age and possess the legal authority to enter into this binding agreement. If you
                      are using SubSnap on behalf of an entity, you represent that you have the
                      authority to bind that entity to these terms.
                    </p>
                    <p>
                      We reserve the right to update these terms at any time. Significant changes will
                      be communicated via the email address associated with your account or through a
                      prominent notice within the application shell.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="cancellation" className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary/50 to-transparent rounded-full opacity-20" />
              <div className="flex items-start gap-6">
                <span className="text-secondary font-black text-2xl opacity-50">02.</span>
                <div className="w-full">
                  <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">
                    Cancellation Service (Best Effort &amp; Tiered Logic)
                  </h2>
                  <div className="bg-surface-container rounded-xl p-8 border border-outline-variant/10 mb-6">
                    <h4 className="text-secondary text-xs font-bold uppercase tracking-widest mb-4">
                      Service Optimization Logic
                    </h4>
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-sm">bolt</span>
                        </div>
                        <div>
                          <h5 className="text-white font-semibold mb-1">Tiered Execution</h5>
                          <p className="text-sm text-on-surface-variant">
                            SubSnap employs multi-tiered automation logic to execute cancellations.
                            We prioritize API-based direct integration, followed by automated form
                            submission, and manual &ldquo;Best Effort&rdquo; intervention for legacy providers.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
                        </div>
                        <div>
                          <h5 className="text-white font-semibold mb-1">Guarantee Limitation</h5>
                          <p className="text-sm text-on-surface-variant">
                            We strive for the highest success rate possible but cannot guarantee
                            cancellation on all platforms. Our service is provided on a &ldquo;Best Effort&rdquo; basis.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="payments" className="group">
              <div className="flex items-start gap-6">
                <span className="text-secondary font-black text-2xl opacity-50 group-hover:opacity-100 transition-opacity">03.</span>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Payments &amp; Billing</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <p className="text-on-surface-variant leading-relaxed">
                      Subscription fees are billed in advance on a monthly or annual basis and are
                      non-refundable except where required by law. By providing a payment method, you
                      authorize SubSnap to charge the applicable fees to that payment instrument.
                    </p>
                    <div className="bg-surface-container-high rounded-xl p-6 border border-secondary/10">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-secondary">info</span>
                        <span className="text-white font-bold">Refund Policy</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        Credits are non-refundable once used. Unused credits may be refunded within
                        7 days of purchase by contacting{' '}
                        <a href="mailto:support@subsnap.com" className="text-primary hover:underline">
                          support@subsnap.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="privacy" className="group">
              <div className="flex items-start gap-6">
                <span className="text-secondary font-black text-2xl opacity-50 group-hover:opacity-100 transition-opacity">04.</span>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Privacy &amp; Data Transmission</h2>
                  <p className="text-on-surface-variant leading-relaxed mb-6">
                    Your privacy is managed under our Privacy Policy. By using SubSnap, you acknowledge
                    that we process your uploaded bank statement locally in your browser to identify
                    recurring subscriptions. We never store your bank login credentials.
                  </p>
                  <Link
                    href="/privacy"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg border border-outline-variant/10 hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                      Read Full Privacy Policy
                    </span>
                    <span className="material-symbols-outlined text-primary text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </section>

            <section id="liability" className="group">
              <div className="flex items-start gap-6">
                <span className="text-secondary font-black text-2xl opacity-50 group-hover:opacity-100 transition-opacity">05.</span>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Limitation of Liability</h2>
                  <p className="text-on-surface-variant leading-relaxed italic border-l-2 border-outline-variant/20 pl-6">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, SUBSNAP SHALL NOT BE LIABLE FOR ANY
                    INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
                    PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA,
                    USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR ACCESS TO OR USE OF
                    THE SERVICE.
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* Contact callout */}
          <div className="mt-24 bg-gradient-to-br from-primary-container to-surface-container-high rounded-2xl p-12 text-center relative overflow-hidden">
            <h3 className="text-3xl font-black text-white mb-4">Questions about these terms?</h3>
            <p className="text-primary mb-8 max-w-xl mx-auto">
              Our legal and support teams (support@subsnap.com) are here to provide clarity on how
              we protect your financial interests.
            </p>
            <a
              href="mailto:legal@subsnap.com"
              className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform duration-300 inline-block"
            >
              Contact Legal
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
