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
    <div className="min-h-screen pb-24 selection:bg-[#44e2cd]/30 selection:text-[#44e2cd]">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#08090d]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold">
            <span className="material-symbols-outlined text-base">arrow_forward</span>
            <span>חזרה לראשי</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#44e2cd] to-[#2dd4bf] text-[#002b26] flex items-center justify-center font-black text-xs">⚡</span>
            <span className="font-black text-lg text-white">SubSnap AI</span>
          </div>
        </div>
      </header>

      {/* Ambient glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-[#38bdf8]/10 via-[#44e2cd]/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      <main className="pt-8 pb-20 px-4 sm:px-6 max-w-3xl mx-auto space-y-8">
        {/* Status Summary Banner */}
        <section className="gemini-capsule p-6 sm:p-8 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#44e2cd] bg-[#44e2cd]/10 border border-[#44e2cd]/20 px-3 py-1 rounded-full inline-block">
            {analyzed ? 'סיכום סריקה' : 'דשבורד סריקה וביטול מנויים'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            {analyzed && subscriptions.length > 0
              ? `אותרו ${subscriptions.length} מנויים פעילים`
              : analyzed
              ? 'לא אותרו מנויים בקובץ זה'
              : 'סורק תדפיסים חכם'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {analyzing
              ? '🔍 ה-AI סורק ומזהה מנויים...'
              : analyzed && subscriptions.length > 0
              ? `סך החיוב החודשי המוערך: ₪${totalMonthly.toFixed(2)}`
              : 'העלה צילום מסך או PDF, או השתמש בקפסולת הביטול המהיר.'}
          </p>
        </section>

        {/* Feature 1: Quick Prompt Capsule */}
        <QuickCancelBar />

        {/* Feature 2: Bank Statement Upload Capsule */}
        <section className="gemini-capsule p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">upload_file</span>
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">
                העלאת תדפיס חשבון / פירוט אשראי
              </h2>
              <p className="text-xs text-slate-400">
                מעובד ישירות בדפדפן. שמות ומספרי כרטיס מושחרים מקומית.
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

          <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5 text-xs text-slate-400">
            <span>🔒 עיבוד מקומי מלא</span>
            <span>·</span>
            <span>🛡️ ללא שמירת מידע בנקאי</span>
          </div>
        </section>

        {/* Subscription Results */}
        {analyzed && (
          <section className="gemini-capsule p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white">
                מנויים שזוהו ({subscriptions.length})
              </h3>
              {totalMonthly > 0 && (
                <span className="text-xs font-bold text-[#44e2cd] bg-[#44e2cd]/10 border border-[#44e2cd]/20 px-3 py-1 rounded-full">
                  סה&quot;כ חודשי: ~₪{totalMonthly.toFixed(2)}
                </span>
              )}
            </div>

            {subscriptions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <span className="material-symbols-outlined text-4xl text-slate-600">search_off</span>
                <p className="font-bold text-sm text-white">לא זוהו מנויים בתדפיס זה</p>
                <p className="text-xs">השתמש בשורת החיפוש למעלה כדי לקבל קישור ישיר לכל שירות שתרצה לבטל.</p>
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
