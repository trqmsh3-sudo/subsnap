'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import QuickCancelBar from '@/components/QuickCancelBar'

const FileUpload = dynamic(() => import('@/components/FileUpload'), { ssr: false })
const Redactor = dynamic(() => import('@/components/Redactor'), { ssr: false })

export default function AppPage() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [textItems, setTextItems] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [userId, setUserId] = useState<string>('anonymous')

  useEffect(() => {
    import('@/lib/userId').then(({ getUserId }) => setUserId(getUserId()))
  }, [])

  function handleFileProcessed(c: HTMLCanvasElement, items: any[]) {
    setCanvas(c)
    setTextItems(items)
    setSubscriptions([])
    setAnalyzed(false)
  }

  const handleRedacted = useCallback(async (base64: string) => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, userId }),
      })
      if (res.status === 402) {
        setSubscriptions([])
        setAnalyzed(true)
        alert('סריקה חינמית כבר בוצעה.')
        return
      }
      const data = await res.json()
      setSubscriptions(data.subscriptions ?? [])
    } finally {
      setAnalyzing(false)
      setAnalyzed(true)
    }
  }, [userId])

  const totalMonthly = subscriptions.reduce((sum, s) => {
    const raw = typeof s.amount === 'string' ? parseFloat(s.amount.replace(/[^0-9.]/g, '')) : (s.amount || 0)
    return sum + (isNaN(raw) ? 0 : raw)
  }, 0)

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 pb-24 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-bold">
            <span>➔</span>
            <span>חזרה לדף הראשי</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-black text-sm">
              🧩
            </span>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">SubSnap Dashboard</span>
          </div>
        </div>
      </header>

      <main className="pt-8 pb-20 px-4 sm:px-6 max-w-3xl mx-auto space-y-8">
        {/* Status Summary Banner */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
            {analyzed ? 'סיכום סריקה' : 'דשבורד סריקה וביטול מנויים'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            {analyzed && subscriptions.length > 0
              ? `אותרו ${subscriptions.length} מנויים פעילים`
              : analyzed
              ? 'לא אותרו מנויים בקובץ זה'
              : 'סורק תדפיסים חכם וביטול בקליק'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {analyzing
              ? '🔍 ה-AI מפענח את התדפיס ומחלץ מנויים...'
              : analyzed && subscriptions.length > 0
              ? `סך החיוב החודשי שזוהה: ₪${totalMonthly.toFixed(2)}`
              : 'העלה צילום מסך או תדפיס PDF בנקאי, או הקלד שם מנוי לביטול ישיר.'}
          </p>
        </section>

        {/* Feature 1: Quick Prompt Capsule */}
        <QuickCancelBar />

        {/* Feature 2: Bank Statement Upload Capsule */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-lg">
              📄
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900">
                העלאת תדפיס חשבון / פירוט אשראי
              </h2>
              <p className="text-xs text-slate-500">
                מעובד ומטוהר ישירות במחשב שלך. מספרי כרטיס ופרטים אישיים מושחרים מקומית.
              </p>
            </div>
          </div>

          <FileUpload onFileProcessed={handleFileProcessed} />

          {canvas && (
            <Redactor
              sourceCanvas={canvas}
              textItems={textItems}
              onRedacted={handleRedacted}
            />
          )}

          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <span>🔒 עיבוד מקומי מלא ב-Client</span>
            <span>·</span>
            <span>🛡️ ללא שמירת מידע בנקאי</span>
          </div>
        </section>

        {/* Subscription Results */}
        {analyzed && (
          <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                מנויים שזוהו ({subscriptions.length})
              </h3>
              {totalMonthly > 0 && (
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  סה&quot;כ חודשי: ~₪{totalMonthly.toFixed(2)}
                </span>
              )}
            </div>

            {subscriptions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <p className="text-sm font-semibold">לא זוהו חיובים חוזרים בתדפיס זה.</p>
                <p className="text-xs text-slate-400">וודא שהקובץ מכיל שורות חיוב עם שמות בתי עסק.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">{sub.name || sub.serviceName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {sub.billingCycle || 'חודשי'} · {sub.amount ? `₪${sub.amount}` : 'סכום משתנה'}
                      </div>
                    </div>
                    {sub.cancelUrl && (
                      <a
                        href={sub.cancelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                      >
                        בטל מנוי ➔
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
