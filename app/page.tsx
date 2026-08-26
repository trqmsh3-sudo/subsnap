import Link from 'next/link'
import QuickCancelBar from '@/components/QuickCancelBar'

function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-xl">bolt</span>
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900">SubSnap</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <a href="#how-it-works" className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            איך זה עובד?
          </a>
          <a href="#security" className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            פרטיות ואבטחה
          </a>
          <Link
            href="/app"
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>סורק תדפיסים</span>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="text-white font-black text-xl flex items-center gap-1.5">
            <span className="text-emerald-400">⚡</span> SubSnap
          </div>
          <p className="text-xs text-slate-400">
            הכסף שלך חוזר אליך — מערכת חכמה לביטול מנויים וחיובים חוזרים.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-xs font-medium">
          <Link href="/privacy" className="hover:text-white transition-colors">מדיניות פרטיות</Link>
          <Link href="/terms" className="hover:text-white transition-colors">תנאי שימוש</Link>
          <Link href="/refund" className="hover:text-white transition-colors">מדיניות החזרים</Link>
          <Link href="/app" className="hover:text-white transition-colors">סורק תדפיסים</Link>
        </div>
      </div>
      <div className="text-center text-[11px] text-slate-400 mt-8 pt-8 border-t border-slate-800">
        © 2026 SubSnap. כל הזכויות שמורות. נבנה למען חיסכון צרכני חכם ופרטיות מלאה.
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen">
      <Header />

      <main className="pt-28 pb-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-2 shadow-2xs">
            <span className="text-emerald-600">✨</span>
            <span>חינם לחלוטין · ללא צורך בסיסמאות · 100% פרטיות</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
            מפסיקים לשלם על מנויים<br className="hidden sm:inline" /> ששכחתם מהם.
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            מקלידים שם שירות לביטול מהיר — או מעלים פירוט אשראי כדי לגלות את כל החיובים החבויים בלחיצה אחת.
          </p>

          {/* Average Savings Callout */}
          <div className="inline-block bg-white border border-slate-200 px-5 py-2 rounded-2xl shadow-xs text-xs sm:text-sm font-semibold text-slate-700">
            💰 המשתמש הממוצע חוסך <span className="text-emerald-600 font-extrabold">1,840 ₪ בשנה</span> על מנויים לא פעילים
          </div>
        </section>

        {/* Feature 1: Instant Quick Cancel Bar */}
        <section>
          <QuickCancelBar />
        </section>

        {/* Feature 2: Bank Statement Scanner Card */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 border border-emerald-200/60 rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-right">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
                גילוי מנויים מלא
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                רוצה לדעת על מה עוד אתה משלם?
              </h2>
              <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                העלה צילום מסך או קובץ PDF של פירוט האשראי. ה-AI יזהה עבורך את כל החיובים החוזרים (נטפליקס, חדרי כושר, ענן, אפליקציות) תוך 3 שניות.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 flex items-center gap-1">
                  🔒 פרטים רגישים מושחרים מקומית
                </span>
                <span className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 flex items-center gap-1">
                  ⚡ סריקה חינמית
                </span>
              </div>
            </div>
            <Link
              href="/app"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 active:scale-98"
            >
              <span>פתח את סורק התדפיסים</span>
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </Link>
          </div>
        </section>

        {/* Security & Trust Bento Grid */}
        <section id="security" className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">למה אלפי משתמשים בוחרים ב-SubSnap?</h3>
            <p className="text-sm text-slate-600">פרטיות וביטחון מלא הם היסוד של כל מה שאנחנו בונים.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">shield</span>
              </div>
              <h4 className="font-bold text-lg text-slate-900">100% פרטיות מובטחת</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                הקובץ מעובד ישירות בדפדפן שלך. מספרי חשבון ושמות מושחרים מקומית לפני הניתוח, ושום מידע לא נשמר בשרת.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">key_off</span>
              </div>
              <h4 className="font-bold text-lg text-slate-900">אפס סיסמאות</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                אנחנו לעולם לא מבקשים ממך סיסמאות או פרטי כניסה. הכל מתבצע דרך החיבור הטבעי והמאובטח שלך בדפדפן.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">extension</span>
              </div>
              <h4 className="font-bold text-lg text-slate-900">תוסף כרום חכם</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                מתקינים את תוסף הכרום ומבטלים מנויים בלחיצה אחת ישירות מתוך הדפדפן, בלי לחפש בתפריטים ובלי שאלונים.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Steps */}
        <section id="how-it-works" className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
              תהליך פשוט
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">איך זה עובד? ב-3 שלבים קלים</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2">
              <div className="text-3xl font-black text-emerald-600/40">01</div>
              <h4 className="font-bold text-base text-slate-900">בוחרים מה לבטל</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                מקלידים את שם השירות בשורת החיפוש או מעלים תדפיס אשראי כדי לראות את כל המנויים במקום אחד.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-black text-emerald-600/40">02</div>
              <h4 className="font-bold text-base text-slate-900">מקבלים קישור ישיר</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                המערכת עוקפת מסכי שימור ומלכודות שירות, ומביאה אותך ישירות לעמוד הביטול המדויק עם הסבר שלב-אחר-שלב.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-black text-emerald-600/40">03</div>
              <h4 className="font-bold text-base text-slate-900">הכסף נשאר אצלך</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                מאשרים את הביטול — ומפסיקים לשלם מאות שקלים בחודש על שירותים שלא בשימוש.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-4">
          <h3 className="text-2xl font-extrabold text-slate-900 text-center mb-6">שאלות נפוצות</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
              <h4 className="font-bold text-sm text-slate-900">האם זה באמת בחינם?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                כן לחלוטין! חיפוש ביטול ישיר וסריקות התדפיסים זמינים בחינם לכל משתמש.
              </p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
              <h4 className="font-bold text-sm text-slate-900">האם האתר שומר את פרטי הבנק שלי?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                בשום אופן לא. הקבצים מעובדים מקומית במכשיר שלך בלבד, ופרטים מזהים מושחרים אוטומטית.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
