import Link from 'next/link'
import { PLANS } from '@/lib/credits'

// ─── Icons (inline SVG, no extra deps) ───────────────────────────────────────

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function MousePointerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      <path d="M13 13l6 6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-bold text-gray-900 tracking-tight text-lg">SubSnap</span>
        <nav className="flex items-center gap-6">
          <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">How it works</a>
          <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">Pricing</a>
          <Link
            href="/app"
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try free →
          </Link>
        </nav>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="pt-20 pb-24 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-indigo-100">
          <ShieldIcon />
          <span>Your data never leaves your browser</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
          Snap your statement.<br />
          <span className="text-indigo-600">Slash your subs.</span>
        </h1>

        <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto">
          Upload your bank statement. We find your subscriptions.
          You cancel them in one click.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            Try it free →
          </Link>
          <p className="text-sm text-gray-400">
            No bank login.&nbsp; No data stored.&nbsp; Free first cancellation.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Upload your PDF',
      description: 'Drag in your bank or credit card statement. Processed entirely in your browser — nothing is uploaded yet.',
    },
    {
      number: '02',
      title: 'Redact personal info',
      description: 'Use our canvas overlay to black out account numbers, names, and any data you don\'t want to share. You control what gets sent.',
    },
    {
      number: '03',
      title: 'Cancel in one click',
      description: 'We identify every subscription. Click Cancel and our automation handles the dark patterns, retention flows, and confirm dialogs for you.',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
          <p className="text-gray-500 text-lg">Three steps. No account required.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="text-4xl font-black text-indigo-100 mb-4 leading-none">{step.number}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Why SubSnap ──────────────────────────────────────────────────────────────

function WhySubSnap() {
  const features = [
    {
      icon: <LockIcon />,
      title: 'No bank login required',
      description: 'We never connect to your bank. You just upload a PDF — the same statement you\'d hand an accountant.',
    },
    {
      icon: <EyeOffIcon />,
      title: 'Local redaction',
      description: 'Personal data is blacked out on your device before anything leaves your browser. We see only what you choose to share.',
    },
    {
      icon: <MousePointerIcon />,
      title: 'Real browser automation',
      description: 'We don\'t just give you a link. Our AI navigates the actual cancellation flow — including dark patterns and retention screens.',
    },
    {
      icon: <ShieldIcon />,
      title: 'Privacy-first by design',
      description: 'No accounts, no tracking, no storing of financial data. Built from the ground up around the principle that your data is yours.',
    },
  ]

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Built differently</h2>
          <p className="text-gray-500 text-lg">Most tools connect to your bank. We don't.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="flex gap-5 p-6 rounded-2xl border border-gray-100 bg-white hover:border-indigo-100 hover:bg-indigo-50/30 hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
              <div className="shrink-0 text-indigo-500 mt-0.5">{f.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  const freePlan = {
    name: 'Free',
    price: 0,
    credits: 1,
    popular: false,
    description: 'Try it out',
    features: ['1 cancellation included', 'Full automation', 'No account needed'],
  }

  const paidPlans = PLANS.map((p) => ({
    ...p,
    description: p.id === 'single' ? 'One-off' : p.id === 'starter' ? 'Most popular' : 'Power user',
    features: [
      `${p.credits} cancellation credit${p.credits > 1 ? 's' : ''}`,
      'Full automation',
      'Scout AI routing',
      p.credits >= 5 ? 'Priority processing' : null,
      p.credits >= 15 ? 'Dark-pattern specialist (Claude)' : null,
    ].filter(Boolean) as string[],
  }))

  const allPlans = [freePlan, ...paidPlans]

  return (
    <section id="pricing" className="py-24 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple pricing</h2>
          <p className="text-gray-500 text-lg">Pay per cancellation. No subscription irony.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {allPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                plan.popular
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white border-gray-100 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}

              <div className="mb-5">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${plan.popular ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {plan.description}
                </p>
                <p className={`text-3xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                </p>
              </div>

              <ul className="flex flex-col gap-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${plan.popular ? 'text-indigo-100' : 'text-gray-600'}`}>
                    <span className={plan.popular ? 'text-indigo-200' : 'text-indigo-500'}>
                      <CheckIcon />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/app"
                className={`text-center text-sm font-semibold py-2.5 rounded-lg transition-colors ${
                  plan.popular
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {plan.price === 0 ? 'Start free' : 'Get started'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Privacy block ────────────────────────────────────────────────────────────

function PrivacyBlock() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="border border-indigo-100 bg-indigo-50/50 rounded-2xl p-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl text-indigo-600 mb-6">
            <ShieldIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your bank data is redacted before it ever leaves your device.
          </h2>
          <p className="text-gray-500 leading-relaxed max-w-xl mx-auto">
            When you upload a statement, it never touches our servers raw. You use a canvas overlay
            to black out anything sensitive — account numbers, names, balances — and only the
            redacted image is sent for analysis. We see what you choose to share, nothing more.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-semibold text-gray-900">SubSnap</span>
        <p className="text-sm text-gray-400 text-center">
          Privacy-first subscription cancellation. No bank login. No data stored.
        </p>
        <Link href="/app" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
          Open the app →
        </Link>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Nav />
      <Hero />
      <HowItWorks />
      <WhySubSnap />
      <Pricing />
      <PrivacyBlock />
      <Footer />
    </div>
  )
}
