'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Preview from '@/components/Preview'
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
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen pb-20 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold">
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
            <span>חזרה לעמוד הראשי</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">⚡</span>
            <span className="font-extrabold text-xl text-slate-900">SubSnap</span>
          </div>
        </div>
      </header>

      <main className="pt-8 pb-20 px-4 sm:px-6 max-w-3xl mx-auto space-y-8">
        {/* Hero Section: Summary Card */}
        <section className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border border-emerald-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full inline-block">
              {analyzed ? 'סיכום המנויים שאותרו' : 'דשבורד סריקה ואיתור מנויים'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              {analyzed && subscriptions.length > 0
                ? `אותרו ${subscriptions.length} מנויים פעילים`
                : analyzed
                ? 'לא אותרו מנויים בקובץ זה'
                : 'סריקת מנויים חכמה'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {analyzing
                ? '🔍 ה-AI מנתח כעת את התדפיס ומזהה שירותי מנויים...'
                : analyzed && subscriptions.length > 0
                ? `סך החיוב החודשי המוערך: ₪${totalMonthly.toFixed(2)}`
                : 'העלה צילום מסך או PDF של פירוט האשראי, או השתמש בשורת הביטול המהיר למטה.'}
            </p>
          </div>
        </section>

        {/* Feature 1: Quick Search Bar */}
        <QuickCancelBar />

        {/* Feature 2: Bank Statement Upload */}
        <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">upload_file</span>
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900">
                העלאת תדפיס חשבון / פירוט אשראי
              </h2>
              <p className="text-xs text-slate-500">
                תמיכה בקבצי תמונה (PNG/JPG) וקובצי PDF. פרטים מזהים מושחרים מקומית בדפדפן.
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

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-slate-600 flex items-center gap-1">
              🛡️ עיבוד מקומי במכשיר שלך
            </span>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-slate-600 flex items-center gap-1">
              🔒 ללא שמירת מידע בנקאי
            </span>
          </div>
        </section>

        {/* Subscription Results */}
        {analyzed && (
          <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                רשימת המנויים שזוהו ({subscriptions.length})
              </h3>
              {totalMonthly > 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  סה&quot;כ חודשי: ~₪{totalMonthly.toFixed(2)}
                </span>
              )}
            </div>

            {subscriptions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                <p className="font-bold text-sm text-slate-700">לא זוהו מנויים בתדפיס זה</p>
                <p className="text-xs">ודא שהתמונה ברורה ומכילה פירוט שורות חיוב, או הקלד את שם השירות בשורת החיפוש למעלה.</p>
              </div>
            ) : (
              <Preview subscriptions={subscriptions} />
            )}
          </section>
        )}
      </main>
    </div>
  )
}
