import Link from 'next/link'
import { PLANS } from '@/lib/credits'

// ─── Shared Nav ───────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="bg-[#0B1326] top-0 sticky z-50 shadow-[0_20px_40px_rgba(27,59,90,0.4)]">
      <div className="flex justify-between items-center px-4 md:px-8 py-4 max-w-7xl mx-auto antialiased tracking-tight">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white no-underline shrink-0">
          SubSnap
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a className="text-slate-400 font-medium hover:text-white transition-colors" href="#security">
            Security
          </a>
          <a className="text-slate-400 font-medium hover:text-white transition-colors" href="#how-it-works">
            How it Works
          </a>
          <a className="text-slate-400 font-medium hover:text-white transition-colors" href="#pricing">
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/app"
            className="bg-secondary text-on-secondary px-3 md:px-6 py-2.5 min-h-[44px] inline-flex items-center rounded-full font-bold hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:opacity-80 whitespace-nowrap"
          >
            <span className="hidden sm:inline">Scan My Statement — Free</span>
            <span className="sm:hidden">Scan Free</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Shared Footer ────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#0B1326] py-12 mt-auto border-t border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto text-sm tracking-wide uppercase font-semibold">
        <Link href="/" className="text-lg font-bold text-slate-300 mb-8 md:mb-0">SubSnap</Link>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex gap-8">
            <Link href="/privacy" className="text-slate-500 hover:text-[#44E2CD] transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-500 hover:text-[#44E2CD] transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
          <div className="text-slate-500 mt-4 md:mt-0 opacity-80">© 2026 SubSnap. 2026 Compliant.</div>
        </div>
      </div>
    </footer>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative pt-24 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-white/5">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-xs font-semibold tracking-widest uppercase text-secondary">
                Users saved an average of $420/year
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-tight">
              Your Money.<br />
              <span className="text-secondary">Reclaimed.</span>
            </h1>

            <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed">
              Stop the bleed. Our autonomous agents scan your statements and terminate ghost
              subscriptions with professional-grade precision.
            </p>

            {/* Upload CTA Box */}
            <div className="relative group p-1 rounded-xl bg-gradient-to-br from-secondary/20 to-tertiary/20">
              <Link
                href="/app"
                className="block bg-surface-container-low rounded-[1.25rem] border-2 border-dashed border-outline-variant p-12 text-center transition-all duration-300 hover:border-secondary group-hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-5xl text-secondary mb-4 block">
                  cloud_upload
                </span>
                <h3 className="text-xl font-bold text-white mb-2">Drop Bank Statement or PDF</h3>
                <p className="text-on-surface-variant text-sm">
                  Drag and drop your file here, or click to browse
                </p>
                <div className="mt-6 flex justify-center gap-4 items-center">
                  <span className="text-[10px] text-outline px-2 py-1 bg-surface rounded uppercase font-bold tracking-widest">
                    Encrypted
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Right column – phone mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-[9/19] max-w-[320px] mx-auto bg-surface-container-highest rounded-[3rem] border-[8px] border-surface-container overflow-hidden shadow-2xl">
              <div className="absolute inset-0 noise-texture" />
              <div className="p-6 space-y-6 pt-12">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant text-xs">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-1 bg-on-surface-variant rounded-full" />
                    <div className="w-1 h-1 bg-on-surface-variant rounded-full" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 opacity-40">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="h-3 w-20 bg-outline/20 rounded" />
                        <div className="h-2 w-12 bg-outline/10 rounded mt-2" />
                      </div>
                      <div className="h-3 w-8 bg-outline/20 rounded" />
                    </div>
                  </div>
                  <div className="p-4 bg-surface-container rounded-xl border border-secondary/30 relative overflow-hidden">
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <div className="text-xs font-bold text-white">Streaming Pro</div>
                        <div className="text-[10px] text-on-surface-variant">Active for 14 months</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-secondary">Canceled!</span>
                        <span
                          className="material-symbols-outlined text-secondary text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-secondary/5" />
                  </div>
                  <div className="p-4 bg-surface-container rounded-xl border border-secondary/30 relative overflow-hidden">
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <div className="text-xs font-bold text-white">Cloud Storage</div>
                        <div className="text-[10px] text-on-surface-variant">Duplicate plan found</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-secondary">Canceled!</span>
                        <span
                          className="material-symbols-outlined text-secondary text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-secondary/5" />
                  </div>
                </div>
                <div className="ai-gradient p-4 rounded-xl text-center">
                  <div className="text-xs font-black text-on-tertiary mb-1">Total Savings Identified</div>
                  <div className="text-2xl font-black text-on-tertiary tracking-tighter">$84.99/mo</div>
                </div>
              </div>
            </div>

            {/* Floating glass card */}
            <div className="absolute -bottom-10 -left-10 glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary">verified_user</span>
                </div>
                <div>
                  <div className="text-white font-bold">Bank-Grade Security</div>
                  <div className="text-on-surface-variant text-sm">
                    Processed in your browser. Nothing leaves your device.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Bento Advantages ─────────────────────────────────────────────────────────

function BentoAdvantages() {
  return (
    <section className="py-24 bg-surface-container-low" id="security">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <label className="text-sm tracking-[0.15em] uppercase font-bold text-secondary">
            The SubSnap Edge
          </label>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-4 tracking-tight">
            Institutional logic for<br />your personal ledger.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
          {/* Large card */}
          <div className="md:col-span-2 md:row-span-2 bg-surface-container rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-4xl text-secondary mb-6 block">lock</span>
              <h3 className="text-3xl font-black text-white mb-4">Zero-Knowledge</h3>
              <p className="text-on-surface-variant leading-relaxed">
                We never see your raw data. Our AI runs entirely in your browser session, encrypting
                transactions before they ever touch a database. Your privacy isn't just a policy—it's
                the architecture.
              </p>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all duration-700" />
          </div>

          {/* No-bank card */}
          <div className="md:col-span-2 bg-surface-container rounded-xl p-8 relative overflow-hidden group">
            <div className="flex gap-6 items-start">
              <span className="material-symbols-outlined text-4xl text-secondary">account_balance_wallet</span>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">The No-Bank Advantage</h3>
                <p className="text-on-surface-variant text-sm">
                  Unlike competitors, we don't need your bank login. Just a simple export. No permanent
                  connections, no security backdoors.
                </p>
              </div>
            </div>
          </div>

          {/* Autonomous agents card */}
          <div className="md:col-span-1 bg-surface-container rounded-xl p-8 flex flex-col justify-center text-center group border-b-4 border-tertiary">
            <span
              className="material-symbols-outlined text-4xl text-tertiary mb-4 block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              smart_toy
            </span>
            <h3 className="text-lg font-bold text-white mb-2">Autonomous Agents</h3>
            <p className="text-on-surface-variant text-xs">
              AI that identifies dark patterns and hidden trial extensions.
            </p>
          </div>

          {/* Transparency card */}
          <div className="md:col-span-1 bg-surface-container rounded-xl p-8 flex flex-col justify-center text-center group">
            <span className="material-symbols-outlined text-4xl text-secondary mb-4 block">visibility</span>
            <h3 className="text-lg font-bold text-white mb-2">Transparency First</h3>
            <p className="text-on-surface-variant text-xs">
              Full logs for every action. You're always in control of the 'cancel' button.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── 3-Step Process ───────────────────────────────────────────────────────────

function ThreeSteps() {
  return (
    <section className="py-24" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-black text-white mb-16 tracking-tight">
          Financial recovery in 3 clicks.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              n: 1,
              title: 'Snap',
              body: "Upload any digital statement. Our AI instantly maps the recurring merchant signatures.",
            },
            {
              n: 2,
              title: 'Review',
              body: "Audit the findings. Our system highlights duplicates, price hikes, and forgotten trials.",
            },
            {
              n: 3,
              title: 'Done',
              body: "Deploy the agents. We handle the cancellation bureaucracy while you keep the cash.",
            },
          ].map(({ n, title, body }) => (
            <div key={n} className="space-y-6">
              <div className="w-20 h-20 bg-surface-container-high rounded-3xl mx-auto flex items-center justify-center text-4xl font-black text-secondary">
                {n}
              </div>
              <h3 className="text-2xl font-bold text-white">{title}</h3>
              <p className="text-on-surface-variant">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Tiered Execution ─────────────────────────────────────────────────────────

function TieredExecution() {
  const tiers = [
    {
      icon: 'bolt',
      color: 'text-secondary',
      name: 'Full Auto',
      desc: 'Set saving rules and let SubSnap handle everything in the background.',
      accent: false,
    },
    {
      icon: 'support_agent',
      color: 'text-tertiary',
      name: 'Session-Guided',
      desc: "Our AI leads you through each cancellation for extra oversight.",
      accent: true,
    },
    {
      icon: 'settings',
      color: 'text-on-surface-variant',
      name: 'Manual Assist',
      desc: 'Get the data and cancellation templates, you take the final action.',
      accent: false,
    },
  ]

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <label className="text-sm tracking-[0.15em] uppercase font-bold text-secondary">
              Control Modes
            </label>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-4 mb-8">
              Execute your way.
            </h2>
            <div className="space-y-6">
              {tiers.map((t) => (
                <div
                  key={t.name}
                  className={`p-6 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer group ${t.accent ? 'border-l-4 border-tertiary' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`material-symbols-outlined ${t.color} text-3xl`}>{t.icon}</span>
                    <div>
                      <h4 className="text-white font-bold">{t.name}</h4>
                      <p className="text-on-surface-variant text-sm">{t.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative grid grid-cols-1 gap-4">
            {[
              { label: 'Tier 1', name: 'Full Auto', color: 'text-secondary', accent: false },
              { label: 'Tier 2', name: 'Session-Guided', color: 'text-tertiary', accent: true },
              { label: 'Tier 3', name: 'Manual Assist', color: 'text-on-surface-variant', accent: false },
            ].map((t) => (
              <div
                key={t.label}
                className={`bg-surface-container-high p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center shadow-xl ${t.accent ? 'border-l-4 border-tertiary' : ''}`}
              >
                <span className={`${t.color} text-lg font-black mb-1`}>{t.label}</span>
                <h3 className="text-2xl font-black text-white italic tracking-tighter">{t.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  const freePlan = {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 1,
    popular: false,
    description: 'Try it out',
    features: ['1 cancellation included', 'Full browser automation', 'No account needed'],
  }

  const paidPlans = PLANS.map((p) => ({
    ...p,
    description: p.id === 'single' ? 'One-time' : p.id === 'starter' ? 'Best value' : 'Power user',
    features: [
      `${p.credits} cancellation credit${p.credits > 1 ? 's' : ''}`,
      `$${(p.price / p.credits).toFixed(2)} per cancel`,
      'Full browser automation',
      'AI routing for fastest path',
      p.credits >= 5 ? 'Priority processing' : null,
      p.credits >= 15 ? 'Dark-pattern specialist (Claude)' : null,
    ].filter(Boolean) as string[],
  }))

  const allPlans = [freePlan, ...paidPlans]

  return (
    <section className="py-24 px-6" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <label className="text-sm tracking-[0.15em] uppercase font-bold text-secondary">
            Pricing
          </label>
          <h2 className="text-4xl font-black text-white mt-4 tracking-tight">Simple pricing.</h2>
          <p className="text-on-surface-variant mt-2 text-lg">
            Pay per cancellation. No subscription irony.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl p-7 border transition-all duration-200 hover:-translate-y-1 ${
                plan.popular
                  ? 'border-secondary/50 bg-surface-container-high shadow-[0_0_40px_rgba(68,226,205,0.12)]'
                  : 'border-white/5 bg-surface-container'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-outline mb-1.5">
                  {plan.description}
                </p>
                <p className="text-3xl font-black text-white">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                </p>
              </div>
              <ul className="flex flex-col gap-3 mb-7 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/app"
                className={`text-center text-sm font-bold py-3 rounded-xl transition-all hover:scale-[1.02] block ${
                  plan.popular
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {plan.price === 0 ? 'Start free' : 'Buy now'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 noise-texture" />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter italic">
          Ready to stop the bleed?
        </h2>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Link
            href="/app"
            className="w-full md:w-auto bg-secondary text-on-secondary px-10 py-5 rounded-full text-xl font-black hover:scale-105 transition-all duration-300 shadow-[0_20px_40px_rgba(68,226,205,0.3)] block text-center"
          >
            Scan My Statement — Free
          </Link>
        </div>
        <p className="mt-8 text-on-surface-variant font-medium">
          Be among the first to reclaim your money. No credit card required.
        </p>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main className="relative overflow-hidden">
        <Hero />
        <BentoAdvantages />
        <ThreeSteps />
        <TieredExecution />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
