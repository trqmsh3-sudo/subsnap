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
          <Link href="/privacy" className="text-emerald-400 font-semibold">מדיניות פרטיות</Link>
          <Link href="/terms" className="hover:text-zinc-200 transition-colors">תנאי שימוש</Link>
          <Link href="/refund" className="hover:text-zinc-200 transition-colors">מדיניות שירות</Link>
        </div>
      </div>
      <div className="text-center text-[11px] text-zinc-500 mt-6 pt-6 border-t border-white/[0.03]">
        © 2026 SubSnap. 100% חינם. פרטיות מקומית Zero-Knowledge.
      </div>
    </footer>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Ambient background glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-emerald-500/[0.06] via-transparent to-transparent blur-[100px] pointer-events-none -z-10" />

      <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 max-w-3xl mx-auto w-full space-y-8">
        {/* Title */}
        <section className="space-y-3 text-right">
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-block">
            פרטיות ואבטחה
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            מדיניות פרטיות (Zero-Knowledge Privacy)
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            עודכן לאחרונה: אוגוסט 2026. ב-SubSnap הפרטיות הפיננסית שלך היא ערך עליון. המערכת נבנתה בארכיטקטורת אפס-ידע (Zero-Knowledge) שבה המידע לעולם אינו נשמר בשרתים שלנו.
          </p>
        </section>

        {/* Content Bento Grid */}
        <div className="space-y-6">
          {/* Card 1: Zero Knowledge */}
          <div className="studio-capsule p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-lg">shield_lock</span>
              </div>
              <h2 className="font-semibold text-lg text-white">1. עיבוד מקומי בדפדפן בלבד (Client-Side)</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              חיפושי הביטול והניתוח מתבצעים ישירות במכשיר שלך. אנחנו לא אוספים, לא מתעדים ולא שומרים את היסטוריית החיפושים שלך, את שמות המנויים שחיפשת או פרטים מזהים כלשהם.
            </p>
          </div>

          {/* Card 2: Passwords & Credentials */}
          <div className="studio-capsule p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <span className="material-symbols-outlined text-lg">key_off</span>
              </div>
              <h2 className="font-semibold text-lg text-white">2. אפס גישה לסיסמאות ופרטי כניסה</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              SubSnap לעולם לא תבקש ממך את שמות המשתמש, הסיסמאות או פרטי הגישה הבנקאיים שלך. כל תהליך ביטול מנוי מתבצע ישירות באתרים הרשמיים של החברות (כגון Netflix, X/Grok, Apple, Google, Adobe) תחת אבטחת הדפדפן האישי שלך.
            </p>
          </div>

          {/* Card 3: Third Party & Cookies */}
          <div className="studio-capsule p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <span className="material-symbols-outlined text-lg">link</span>
              </div>
              <h2 className="font-semibold text-lg text-white">3. קישורים ישירים ואתרים חיצוניים</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              השירות מספק קישורים ישירים (Deep Links) לעמודי הניהול והביטול הרשמיים של ספקי השירות. בעת מעבר לאתר חיצוני, חלה מדיניות הפרטיות ותנאי השימוש של אותו ספק בלבד.
            </p>
          </div>

          {/* Card 4: Contact */}
          <div className="studio-capsule p-6 sm:p-8 space-y-3">
            <h2 className="font-semibold text-base text-white">4. יצירת קשר ושאלות בנושאי פרטיות</h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              לכל שאלה, הבהרה או פנייה בנושא פרטיות ואבטחת מידע, ניתן לפנות אלינו ישירות לכתובת המייל:{' '}
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
