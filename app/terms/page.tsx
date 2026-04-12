import Link from 'next/link'

function Footer() {
  return (
    <footer className="bg-[#060d20] w-full py-12 px-8 border-t border-[#3c4a47]/15">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <span className="text-[#69ffe9] font-black text-xl">SubSnap</span>
          <span className="text-[#dbe2fd]/60 text-[0.75rem] uppercase tracking-[0.1em] font-medium">© 2026 SubSnap. All rights reserved.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link href="/privacy" className="text-[#dbe2fd]/60 hover:text-[#69ffe9] text-[0.75rem] uppercase tracking-[0.1em] font-medium transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-[#69ffe9] text-[0.75rem] uppercase tracking-[0.1em] font-medium">Terms of Service</Link>
          <Link href="/refund" className="text-[#dbe2fd]/60 hover:text-[#69ffe9] text-[0.75rem] uppercase tracking-[0.1em] font-medium transition-colors">Refund Policy</Link>
        </div>
      </div>
    </footer>
  )
}

export default function TermsPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen selection:bg-primary selection:text-on-primary">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#131b2e] shadow-[0_24px_40px_rgba(219,226,253,0.06)]">
        <div className="flex items-center justify-between px-6 h-16 w-full">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[#69ffe9] active:scale-95 duration-200 transition-transform">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <span className="text-xl font-bold tracking-tight text-[#69ffe9]">SubSnap</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#how-it-works" className="text-[#dbe2fd] opacity-70 hover:opacity-100 transition-opacity text-sm font-medium">Features</Link>
            <Link href="/terms" className="text-[#69ffe9] font-semibold text-sm">Legal</Link>
          </div>
          <Link href="/" className="text-[#69ffe9] active:scale-95 duration-200 transition-transform md:hidden">
            <span className="material-symbols-outlined">menu</span>
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
        {/* Editorial Header */}
        <div className="mb-20">
          <span className="text-[0.75rem] uppercase tracking-[0.1em] font-medium text-secondary mb-4 block">Legal Framework</span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface leading-none mb-6">
            Terms of Service
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
            Last updated: April 2026. These terms govern your use of SubSnap&rsquo;s subscription
            intelligence platform. By accessing our services, you agree to these conditions.
          </p>
        </div>

        {/* Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Acceptance of Terms */}
          <section className="md:col-span-12 bg-surface-container-high rounded-xl p-8 md:p-12 border border-outline-variant/15">
            <div className="flex items-start gap-6">
              <div className="bg-primary/10 p-4 rounded-full shrink-0">
                <span className="material-symbols-outlined text-primary text-3xl">gavel</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-on-surface mb-4 tracking-tight">1. Acceptance of Terms</h2>
                <div className="space-y-4 text-on-surface-variant leading-relaxed">
                  <p>
                    By accessing or using the SubSnap website and application, you acknowledge that you have read,
                    understood, and agree to be bound by these Terms of Service. If you do not agree to these terms,
                    you must immediately cease all use of our platform.
                  </p>
                  <p>
                    We reserve the right to modify these terms at any time. Your continued use of the service
                    following any changes constitutes your acceptance of the new terms.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Description of Service */}
          <section className="md:col-span-7 bg-surface-container-low rounded-xl p-8 border border-outline-variant/15">
            <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">analytics</span>
              2. Description of Service
            </h2>
            <div className="space-y-4 text-on-surface-variant text-sm leading-relaxed">
              <p>
                SubSnap provides a high-fidelity &ldquo;One-time bank statement scan&rdquo; utility. Our technology
                processes your uploaded financial PDF documents to identify recurring subscription patterns
                and provides editorial-grade spending insights.
              </p>
              <p className="bg-surface-container-lowest p-4 rounded-xl italic">
                &ldquo;The service is strictly a retrospective analysis tool. We do not maintain live bank
                connections or process active financial transactions.&rdquo;
              </p>
            </div>
          </section>

          {/* User Obligations */}
          <section className="md:col-span-5 bg-surface-container-high rounded-xl p-8 border border-outline-variant/15">
            <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">person_check</span>
              3. User Obligations
            </h2>
            <ul className="space-y-4 text-on-surface-variant text-sm">
              {[
                'You must provide accurate, current, and complete information during the upload process.',
                'You are solely responsible for maintaining the confidentiality of your personal data.',
                'You must only upload bank statements for which you have legal ownership or explicit authorization.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="md:col-span-12 bg-surface-variant/60 backdrop-blur-xl rounded-xl p-8 md:p-12 border border-outline-variant/15 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-primary mb-6 tracking-tight">4. Limitation of Liability</h2>
              <div className="grid md:grid-cols-2 gap-8 text-on-surface-variant text-sm leading-relaxed">
                <p>
                  To the maximum extent permitted by law, SubSnap shall not be liable for any indirect,
                  incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
                  whether incurred directly or indirectly, or any loss of data, use, goodwill, or other
                  intangible losses.
                </p>
                <p>
                  Our analysis is based on automated scanning technology. While we strive for 100% accuracy,
                  we do not warrant that the results of our scan will be error-free. Financial decisions based
                  on SubSnap data are made at the user&rsquo;s own risk.
                </p>
              </div>
            </div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          </section>

          {/* Termination */}
          <section className="md:col-span-12 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/15">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="max-w-xl">
                <h2 className="text-xl font-bold text-on-surface mb-2">5. Termination</h2>
                <p className="text-on-surface-variant text-sm">
                  We may terminate or suspend your access to the service immediately, without prior notice
                  or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
              </div>
              <div className="bg-error/10 border border-error/20 p-4 rounded-xl shrink-0">
                <span className="text-error font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined">block</span>
                  Account Revocation Policy
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Trust Anchor */}
        <div className="mt-20 p-12 bg-surface-container-high rounded-[3rem] flex flex-col items-center text-center">
          <h3 className="text-2xl font-bold text-on-surface mb-4">Questions about these terms?</h3>
          <p className="text-on-surface-variant mb-8">
            Email <a href="mailto:contact@subsnap.net" className="text-primary hover:underline">contact@subsnap.net</a>
          </p>
          <a
            href="mailto:contact@subsnap.net"
            className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-4 px-10 rounded-full active:scale-95 transition-all shadow-[0_0_20px_rgba(105,255,233,0.2)] inline-block"
          >
            Contact Legal Support
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}
