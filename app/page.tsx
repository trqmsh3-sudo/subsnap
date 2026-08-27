import Link from 'next/link'

function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#090a0f]/85 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            <span className="material-symbols-outlined text-base">bolt</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">SubSnap</span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="#how-it-works"
            className="text-xs font-medium text-zinc-400 hover:text-white transition-colors hidden sm:inline-block"
          >
            איך זה עובד?
          </a>
          <a
            href="#features"
            className="text-xs font-medium text-zinc-400 hover:text-white transition-colors hidden sm:inline-block"
          >
            יתרונות
          </a>
          <a
            href="#pricing"
            className="text-xs font-medium text-zinc-400 hover:text-white transition-colors hidden sm:inline-block"
          >
            תמחור Pro
          </a>
          <a
            href="https://github.com/trqmsh3-sudo/subsnap/raw/main/subsnap-extension.zip"
            download
            className="btn-emerald px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <span>הוסף לכרום בחינם</span>
            <span className="material-symbols-outlined text-xs">download</span>
          </a>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#06070a] py-12 px-6 mt-20">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-right">
          <div className="text-white font-bold text-base flex items-center gap-1.5">
            <span className="text-emerald-400">⚡</span> SubSnap
          </div>
          <p className="text-xs text-zinc-400">
            התוסף האוטונומי לביטול מנויים וחיובים חוזרים ישירות מתוך הדפדפן.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs text-zinc-400 font-medium">
          <Link href="/privacy" className="hover:text-zinc-200 transition-colors">מדיניות פרטיות</Link>
          <Link href="/terms" className="hover:text-zinc-200 transition-colors">תנאי שימוש</Link>
          <Link href="/refund" className="hover:text-zinc-200 transition-colors">מדיניות שירות</Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-zinc-500 mt-8 pt-6 border-t border-white/[0.03]">
        © 2026 SubSnap. תוסף דפדפן רשמי בטוח ומאובטח. פרטיות מקומית Zero-Knowledge.
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      <Header />

      {/* Ambient background glows */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-emerald-500/[0.09] via-sky-500/[0.03] to-transparent blur-[120px] pointer-events-none -z-10" />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-16">
        {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
        <section className="text-center space-y-5 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-emerald-500/30 text-xs font-semibold text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>תוסף כרום חדשני · 100% חינם · ללא סיסמאות</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            מפסיקים לשלם על מנויים.<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              התוסף שמבטל הכל בלחיצה אחת.
            </span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            במקום להסתבך בתפריטים מפותלים ובשאלוני שימור מעיקים — תוסף SubSnap פועל ישירות מתוך החשבונות המחוברים שלכם ומבטל כל מנוי תוך 3 שניות.
          </p>

          {/* Primary CTA Box */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://github.com/trqmsh3-sudo/subsnap/raw/main/subsnap-extension.zip"
              download
              className="btn-emerald w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="text-lg">⭐</span>
              <span>הוסף ל-Chrome בחינם (התקנה מהירה)</span>
              <span className="material-symbols-outlined text-base">arrow_back</span>
            </a>
          </div>

          <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-3 pt-1">
            <span>✓ ללא צורך בהרשמה</span>
            <span>·</span>
            <span>✓ אפס גישה לסיסמאות</span>
            <span>·</span>
            <span>✓ מותקן תוך 3 שניות</span>
          </p>
        </section>

        {/* ── INTERACTIVE EXTENSION PREVIEW HUD ─────────────────────────────── */}
        <section className="relative max-w-2xl mx-auto">
          {/* Outer glow ring */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-70" />
          
          <div className="studio-capsule p-6 sm:p-8 relative bg-[#090a0f]/95 border-emerald-500/30 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  ⚡
                </div>
                <div>
                  <div className="font-bold text-sm text-white">SubSnap Auto-Pilot</div>
                  <div className="text-[11px] text-zinc-400">תצוגת התוסף בסרגל הדפדפן</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>מחובר לדפדפן</span>
              </div>
            </div>

            {/* Mockup Quick Buttons */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold text-zinc-400">ביטול ישיר מתוך החשבון בלחיצה אחת:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: 'קלוד (Claude)', tag: 'בטל ⚡' },
                  { name: 'גרוק / X', tag: 'בטל ⚡' },
                  { name: 'נטפליקס', tag: 'בטל ⚡' },
                  { name: 'ספוטיפיי', tag: 'בטל ⚡' },
                  { name: 'אדובי (Adobe)', tag: 'בטל ⚡' },
                  { name: 'צ\'אט GPT', tag: 'בטל ⚡' },
                  { name: 'קנבה פרו', tag: 'בטל ⚡' },
                  { name: 'אפל / iCloud', tag: 'בטל ⚡' },
                ].map((s) => (
                  <div
                    key={s.name}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between hover:border-emerald-500/40 transition-colors"
                  >
                    <span className="text-xs font-semibold text-zinc-200">{s.name}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {s.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* In-page HUD simulation */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span className="text-zinc-300">התוסף מזהה את כפתור הביטול בכל אתר ומדגיש אותו בהילה זוהרת</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Auto-Click</span>
            </div>
          </div>
        </section>

        {/* ── 3 VALUE PILLARS ───────────────────────────────────────────────── */}
        <section id="features" className="space-y-6 pt-4">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              למה תוסף SubSnap עדיף על כל שיטה אחרת?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">הפשטות של תוסף דפדפן שרץ בתוך החשבון המחובר שלך</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="studio-capsule p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-xl">key_off</span>
              </div>
              <h3 className="font-bold text-base text-white">אפס סיסמאות (Zero Logins)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                מכיוון שהתוסף רץ בתוך הדפדפן שלך, הוא משתמש בחיבורים הקיימים שלך. אתה לא צריך להקליד סיסמה או לעבור אימות SMS מחדש.
              </p>
            </div>

            <div className="studio-capsule p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <span className="material-symbols-outlined text-xl">security</span>
              </div>
              <h3 className="font-bold text-base text-white">עקיפת שאלוני שימור</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                חברות כמו אדובי ואמזון שמות מסכי שכנוע וקנסות. התוסף יודע בדיוק אילו תשובות לבחור כדי להגיע לאישור הביטול בלי קנס.
              </p>
            </div>

            <div className="studio-capsule p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <span className="material-symbols-outlined text-xl">touch_app</span>
              </div>
              <h3 className="font-bold text-base text-white">נעוץ ותמיד זמין (1-Click)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                במקום לחפש בגוגל בכל פעם — פשוט לוחצים על סמל הברק (⚡) בסרגל הדפדפן, בוחרים שירות, והמנוי מבוטל.
              </p>
            </div>
          </div>
        </section>

        {/* ── 3-STEP SETUP GUIDE ────────────────────────────────────────────── */}
        <section id="how-it-works" className="studio-capsule p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white">איך מתחילים? ב-3 צעדים פשוטים</h2>
            <p className="text-xs text-zinc-400">התקנה מהירה של 10 שניות</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.04] space-y-2">
              <div className="text-2xl font-black text-emerald-400">01</div>
              <h4 className="font-bold text-sm text-white">מתקינים את התוסף</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                לוחצים על &quot;הוסף לכרום בחינם&quot; ומצמידים את סמל הברק (⚡) לסרגל העליון בדפדפן.
              </p>
            </div>

            <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.04] space-y-2">
              <div className="text-2xl font-black text-sky-400">02</div>
              <h4 className="font-bold text-sm text-white">בוחרים מנוי לביטול</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                פותחים את התוסף, מקלידים או לוחצים על השירות שרוצים לבטל (קלוד, נטפליקס, אדובי וכו&apos;).
              </p>
            </div>

            <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.04] space-y-2">
              <div className="text-2xl font-black text-purple-400">03</div>
              <h4 className="font-bold text-sm text-white">הביטול מתבצע מיד</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                התוסף נכנס לחשבון המחובר שלכם, מאתר את כפתור הביטול, ומאשר לכם את החיסכון!
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <a
              href="https://github.com/trqmsh3-sudo/subsnap/raw/main/subsnap-extension.zip"
              download
              className="btn-emerald inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold"
            >
              <span>התקן את התוסף עכשיו בחינם</span>
              <span className="material-symbols-outlined text-xs">arrow_back</span>
            </a>
          </div>
        </section>

        {/* ── PRICING SECTION (29.90 ILS / Year) ────────────────────────────── */}
        <section id="pricing" className="space-y-6 pt-4">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
              השקעה של פחות מקפה אחד — חיסכון של אלפי שקלים
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">תוכניות פשוטות והוגנות</h2>
            <p className="text-xs text-zinc-400">ללא התחייבות ארוכת טווח · אפשרות ביטול בכל עת</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free Plan */}
            <div className="studio-capsule p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-base text-white">SubSnap Basic</h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400">
                    לשימוש חופשי
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">0 ₪</span>
                  <span className="text-xs text-zinc-400">/ חינם לתמיד</span>
                </div>
                <p className="text-xs text-zinc-400">
                  כל הכלים הבסיסיים לביטול מנויים מהיר מתוך הדפדפן.
                </p>
                <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-white/[0.04]">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm">✓</span>
                    <span>תוסף כרום לביטול שירותים פופולריים</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm">✓</span>
                    <span>קישורי ביטול רשמיים ומדויקים</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm">✓</span>
                    <span>ללא צורך בהרשמה או סיסמאות</span>
                  </li>
                </ul>
              </div>
              <a
                href="https://github.com/trqmsh3-sudo/subsnap/raw/main/subsnap-extension.zip"
                download
                className="w-full py-2.5 rounded-xl text-center text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] transition-colors"
              >
                הורד תוסף בחינם
              </a>
            </div>

            {/* Pro Plan */}
            <div className="studio-capsule p-6 flex flex-col justify-between space-y-4 relative border-emerald-500/40 bg-gradient-to-b from-emerald-500/[0.04] to-transparent">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#032014] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                הכי פופולרי · חיסכון מובטח
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-base text-emerald-400 flex items-center gap-1.5">
                    <span>⚡ SubSnap Pro</span>
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    2.49 ₪ לחודש
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">29.90 ₪</span>
                  <span className="text-xs text-zinc-400">/ לשנה</span>
                </div>
                <p className="text-xs text-zinc-400">
                  אוטונומיה מלאה, סריקת תדפיסים ועקיפת שאלוני שימור.
                </p>
                <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-white/[0.04]">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm">✓</span>
                    <span className="font-medium text-white">תוסף Auto-Pilot מלא (ביטול בלחיצה אחת)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm">✓</span>
                    <span>עקיפת מסכי שימור ושאלונים (אדובי, אמזון)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm">✓</span>
                    <span>סורק תדפיסי אשראי לאיתור חיובים כפולים וסמויים</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 text-sm">✓</span>
                    <span>התראות מוקדמות לפני חידוש מנוי אוטומטי</span>
                  </li>
                </ul>
              </div>
              <a
                href="/app"
                className="w-full btn-emerald py-2.5 rounded-xl text-center text-xs font-bold transition-all block shadow-lg shadow-emerald-500/20"
              >
                שדרג ל-Pro עכשיו ➔
              </a>
              <p className="text-[10px] text-zinc-500 text-center -mt-2">
                * שימוש הוגן: עד 10 סריקות תדפיסים בחודש למנוי.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
