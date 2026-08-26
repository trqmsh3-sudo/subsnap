import Link from 'next/link'
import QuickCancelBar from '@/components/QuickCancelBar'
import StatementCapsule from '@/components/StatementCapsule'

function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#08090d]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#44e2cd] to-[#2dd4bf] flex items-center justify-center text-[#002b26] font-black shadow-[0_0_20px_rgba(68,226,205,0.4)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <span className="font-black text-2xl tracking-tighter text-white">SubSnap</span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/app"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <span>דשבורד סריקה</span>
          </Link>
          <Link
            href="/app"
            className="gemini-btn-primary px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5"
          >
            <span>סרוק תדפיס</span>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#050608] py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-right">
          <div className="text-white font-black text-xl flex items-center gap-2">
            <span className="text-[#44e2cd]">✦</span> SubSnap AI
          </div>
          <p className="text-xs text-slate-500">
            החזרת כספים חכמה — מערכת אוטונומית לאיתור וביטול מנויים.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400 font-medium">
          <Link href="/privacy" className="hover:text-[#44e2cd] transition-colors">מדיניות פרטיות</Link>
          <Link href="/terms" className="hover:text-[#44e2cd] transition-colors">תנאי שימוש</Link>
          <Link href="/refund" className="hover:text-[#44e2cd] transition-colors">מדיניות החזרים</Link>
          <Link href="/app" className="hover:text-[#44e2cd] transition-colors">סורק תדפיסים</Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-600 mt-8 pt-6 border-t border-white/[0.04]">
        © 2026 SubSnap. כל הזכויות שמורות. פרטיות מקומית 100% Zero-Knowledge.
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-[#44e2cd]/30 selection:text-[#44e2cd]">
      <Header />

      {/* Ambient background glow center */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#44e2cd]/10 via-[#38bdf8]/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-12">
        {/* Hero Header */}
        <section className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-bold text-slate-300 backdrop-blur-md shadow-2xs">
            <span className="text-[#44e2cd]">✦</span>
            <span>SubSnap AI · חינם לחלוטין · ללא צורך בסיסמאות</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.15]">
            מפסיקים לשלם על מנויים<br className="hidden sm:inline" /> ששכחתם מהם.
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            מערכת חכמה לאיתור וביטול מנויים וחיובים חוזרים בלחיצה אחת — בחינם ובפרטיות מלאה.
          </p>
        </section>

        {/* ── THE TWO GEMINI MASTER CAPSULES ─────────────────────────────────── */}
        <section className="space-y-6">
          {/* Capsule 1: Quick Search Prompt */}
          <QuickCancelBar />

          {/* Capsule 2: Statement Dropzone (Same size & luxury aesthetic) */}
          <StatementCapsule />
        </section>

        {/* ── BENTO TRUST & FEATURES GRID ───────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
          {/* Feature 1: Privacy */}
          <div className="gemini-capsule p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#44e2cd]/10 border border-[#44e2cd]/20 flex items-center justify-center text-[#44e2cd]">
              <span className="material-symbols-outlined text-xl">shield_lock</span>
            </div>
            <h3 className="font-bold text-base text-white">100% פרטיות מקומית</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              הקובץ מעובד ישירות במכשיר שלך. מספרי חשבון ושמות מושחרים מקומית לפני הניתוח, ושום מידע לא נשמר בשרת.
            </p>
          </div>

          {/* Feature 2: Extension */}
          <div className="gemini-capsule p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8]">
              <span className="material-symbols-outlined text-xl">extension</span>
            </div>
            <h3 className="font-bold text-base text-white">תוסף כרום אוטונומי</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              מבטל מנויים ישירות בזמן הגלישה בלחיצת כפתור אחת — התוסף מאתר את כפתור הביטול עבורך בעמוד.
            </p>
          </div>

          {/* Feature 3: Verified Savings */}
          <div className="gemini-capsule p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7]">
              <span className="material-symbols-outlined text-xl">savings</span>
            </div>
            <h3 className="font-bold text-base text-white">חיסכון מוכח ומיידי</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              המשתמש הממוצע חוסך מעל 1,840 ₪ בשנה על שירותים כפולים או מנויים שנשכחו.
            </p>
          </div>
        </section>

        {/* ── 3-STEP PROCESS SECTION ────────────────────────────────────────── */}
        <section className="gemini-capsule p-8 sm:p-10 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#44e2cd] bg-[#44e2cd]/10 border border-[#44e2cd]/20 px-3 py-1 rounded-full">
              פשטות קיצונית
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">איך זה עובד? ב-3 שלבים</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
              <div className="text-2xl font-black text-[#44e2cd]">01</div>
              <h4 className="font-bold text-sm text-white">מקלידים או מעלים תדפיס</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                רושמים את שם השירות בקפסולה העליונה, או מעלים תדפיס אשראי כדי לגלות את כל החיובים.
              </p>
            </div>

            <div className="space-y-2 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
              <div className="text-2xl font-black text-[#38bdf8]">02</div>
              <h4 className="font-bold text-sm text-white">מקבלים קישור ישיר</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                המערכת עוקפת את כל המלכודות ומביאה אותך ישירות למסך הביטול עם הנחיות פשוטות.
              </p>
            </div>

            <div className="space-y-2 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
              <div className="text-2xl font-black text-[#a855f7]">03</div>
              <h4 className="font-bold text-sm text-white">הכסף נשאר בכיס</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                מאשרים את הביטול — ומפסיקים לשלם מאות שקלים בחודש על שירותים לא נחוצים.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
