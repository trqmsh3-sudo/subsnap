import Link from 'next/link'
import QuickCancelBar from '@/components/QuickCancelBar'

function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#090a0f]/80 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            <span className="material-symbols-outlined text-base">bolt</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">SubSnap</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="#how-it-works"
            className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            איך זה עובד?
          </a>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#06070a] py-10 px-6 mt-16">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-right">
          <div className="text-white font-bold text-base flex items-center gap-1.5">
            <span className="text-emerald-400">⚡</span> SubSnap
          </div>
          <p className="text-xs text-zinc-400">
            החזרת כספים חכמה — מנוע ביטול מנויים וחיובים חוזרים בחינם.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-5 text-xs text-zinc-400 font-medium">
          <Link href="/privacy" className="hover:text-zinc-200 transition-colors">מדיניות פרטיות</Link>
          <Link href="/terms" className="hover:text-zinc-200 transition-colors">תנאי שימוש</Link>
          <Link href="/refund" className="hover:text-zinc-200 transition-colors">מדיניות החזרים</Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-zinc-500 mt-6 pt-6 border-t border-white/[0.03]">
        © 2026 SubSnap. 100% חינם ללא עלות תפעולית. פרטיות מקומית Zero-Knowledge.
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Ambient background glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-emerald-500/[0.07] via-sky-500/[0.03] to-transparent blur-[100px] pointer-events-none -z-10" />

      <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 max-w-2xl mx-auto w-full space-y-8">
        {/* Hero Title */}
        <section className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs font-medium text-zinc-300">
            <span className="text-emerald-400">●</span>
            <span>100% חינם · ללא צורך בהרשמה · ללא סיסמאות</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.2]">
            מפסיקים לשלם על מנויים<br className="hidden sm:inline" /> ששכחתם מהם.
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            מקלידים שם שירות — ומקבלים קישור ישיר ומדויק לביטול המנוי תוך שניות, בלי להסתבך בתפריטים.
          </p>
        </section>

        {/* ── THE MASTER CANCEL CAPSULE ──────────────────────────────────────── */}
        <section>
          <QuickCancelBar />
        </section>

        {/* ── 3 CLEAN FEATURE CARDS ──────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="studio-capsule p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-base">verified</span>
            </div>
            <h3 className="font-semibold text-sm text-white">100% חינם לתמיד</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              מנוע הביטולים פתוח לחלוטין לשימוש חופשי ללא תשלום, ללא מנוי וללא עמלות.
            </p>
          </div>

          <div className="studio-capsule p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <span className="material-symbols-outlined text-base">key_off</span>
            </div>
            <h3 className="font-semibold text-sm text-white">אפס סיסמאות</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              אנחנו לעולם לא מבקשים סיסמאות. הכל מתבצע דרך החיבור הטבעי והמאובטח שלך.
            </p>
          </div>

          <div className="studio-capsule p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <span className="material-symbols-outlined text-base">savings</span>
            </div>
            <h3 className="font-semibold text-sm text-white">חיסכון מוכח</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              המשתמש הממוצע חוסך מעל 1,840 ₪ בשנה על שירותים שנשכחו או חיובי סרק.
            </p>
          </div>
        </section>

        {/* ── 3-STEP GUIDE ──────────────────────────────────────────────────── */}
        <section id="how-it-works" className="studio-capsule p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-white">איך זה עובד? ב-3 שלבים</h2>
            <p className="text-xs text-zinc-400">ביטול מיידי ללא צורך בהרשמה</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.04] space-y-1.5">
              <div className="text-xl font-bold text-emerald-400">01</div>
              <h4 className="font-semibold text-xs text-white">מקלידים את שם השירות</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                רושמים את שם המנוי בשורת החיפוש למעלה (נטפליקס, גרוק, אדובי וכו&apos;).
              </p>
            </div>

            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.04] space-y-1.5">
              <div className="text-xl font-bold text-sky-400">02</div>
              <h4 className="font-semibold text-xs text-white">מקבלים קישור ביטול ישיר</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                עוקפים את כל מסכי השימור ומגיעים ישר לעמוד הביטול הרשמי עם הנחיות פשוטות.
              </p>
            </div>

            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.04] space-y-1.5">
              <div className="text-xl font-bold text-purple-400">03</div>
              <h4 className="font-semibold text-xs text-white">הכסף נשאר בכיס</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                מאשרים את הביטול — ומפסיקים לשלם מאות שקלים בחודש על שירותים מיותרים.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
