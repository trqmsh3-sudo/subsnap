import Link from 'next/link'

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
        <Link
          href="/"
          className="text-xs font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
          <span>חזרה לדף הבית</span>
        </Link>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#06070a] py-10 px-6 mt-20">
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
          <Link href="/terms" className="text-emerald-400 font-semibold">תנאי שימוש</Link>
          <Link href="/refund" className="hover:text-zinc-200 transition-colors">מדיניות שירות</Link>
        </div>
      </div>
      <div className="text-center text-[11px] text-zinc-500 mt-6 pt-6 border-t border-white/[0.03]">
        © 2026 SubSnap. 100% חינם. פרטיות מקומית Zero-Knowledge.
      </div>
    </footer>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Ambient background glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-sky-500/[0.06] via-transparent to-transparent blur-[100px] pointer-events-none -z-10" />

      <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 max-w-3xl mx-auto w-full space-y-8">
        {/* Title */}
        <section className="space-y-3 text-right">
          <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full inline-block">
            תנאים משפטיים
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            תנאי שימוש (Terms of Service)
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            עודכן לאחרונה: אוגוסט 2026. השימוש באתר SubSnap ובשירותיו כפוף לתנאים המפורטים להלן.
          </p>
        </section>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="studio-capsule p-6 sm:p-8 space-y-4">
            <h2 className="font-semibold text-lg text-white">1. מהות השירות</h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              אתר SubSnap מספק שירות הדרכה, ניווט ואינדקס של קישורי ביטול ישירים למנויים ושירותים דיגיטליים שונים. השירות נועד לסייע לצרכנים לחסוך זמן ולאתר את עמודי הביטול הרשמיים של ספקי השירות.
            </p>
          </div>

          {/* Section 2 */}
          <div className="studio-capsule p-6 sm:p-8 space-y-4">
            <h2 className="font-semibold text-lg text-white">2. שירות חינמי ואחריות המשתמש</h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              השירות ניתן בחינם כמות שהוא (&quot;AS-IS&quot;). SubSnap אינה צד להתקשרות החוזית שבין המשתמש לבין ספק השירות (כגון נטפליקס, אדובי, אפל, גוגל וכו&apos;), והאחריות על ביצוע הביטול הסופי, אישורו ובדיקת מועדי החיוב חלה במלואה על המשתמש.
            </p>
          </div>

          {/* Section 3 */}
          <div className="studio-capsule p-6 sm:p-8 space-y-4">
            <h2 className="font-semibold text-lg text-white">3. קניין רוחני</h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              כל שמות המותגים, הלוגואים והסימנים המסחריים המוזכרים באתר שייכים לבעליהם החוקיים בלבד ומשמשים באתר לצורכי זיהוי והפניה עניינית בלבד (Nominate Fair Use).
            </p>
          </div>

          {/* Section 4 */}
          <div className="studio-capsule p-6 sm:p-8 space-y-4">
            <h2 className="font-semibold text-lg text-white">4. יצירת קשר ופניות</h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              לכל שאלה, עדכון קישור שבור או משוב, ניתן לפנות אלינו בדוא&quot;ל:{' '}
              <a href="mailto:contact@subsnap.net" className="text-emerald-400 hover:underline font-mono">
                contact@subsnap.net
              </a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
