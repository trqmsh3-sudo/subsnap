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
          <Link href="/privacy" className="text-sm tracking-wide uppercase font-semibold text-slate-500 hover:text-[#44E2CD] transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm tracking-wide uppercase font-semibold text-slate-500 hover:text-[#44E2CD] transition-colors duration-200">
            Terms of Service
          </Link>
          <Link href="/refund" className="text-white text-sm tracking-wide uppercase font-semibold hover:text-[#44E2CD] transition-colors duration-200">
            Refund Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default function RefundPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col selection:bg-secondary selection:text-on-secondary">
      <div className="fixed inset-0 noise-texture z-0 pointer-events-none" />
      <Nav />

      <main className="relative z-10 flex-grow max-w-3xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-12">
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-surface-container-high border border-outline-variant/15">
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-secondary">Policy</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface leading-none">
            Refund Policy
          </h1>
        </header>

        <div className="space-y-6">
          <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
            <p className="text-on-surface-variant text-lg leading-relaxed">
              If your scan completed successfully, all sales are final — you received the service
              you paid for.
            </p>
          </div>

          <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
            <p className="text-on-surface-variant text-lg leading-relaxed">
              If your scan failed due to a technical issue on our end, you are entitled to a full
              refund. Contact us at{' '}
              <a
                href="mailto:feedback@subsnap.net"
                className="text-secondary underline underline-offset-4 hover:text-secondary/80 transition-colors"
              >
                feedback@subsnap.net
              </a>{' '}
              with a description of the issue and we will process your refund promptly.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
