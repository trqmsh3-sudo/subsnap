'use client'

import React, { useState } from 'react'

interface CancellationEntry {
  name: string
  loginUrl: string
  cancelUrl: string
  notes?: string
  difficulty: 'easy' | 'hard'
  tier?: 'auto' | 'session' | 'manual'
  steps?: string[]
}

export default function QuickCancelBar() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CancellationEntry | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResult(data.entry ?? null)
    } catch (err) {
      console.error('Lookup error:', err)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto my-6 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <span className="material-symbols-outlined text-lg">bolt</span>
        </div>
        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
          ביטול מנוי מהיר בלחיצה אחת
        </h3>
      </div>
      <p className="text-xs sm:text-sm text-slate-600 mb-5">
        הקלד את שם השירות שברצונך לבטל (לדוגמה: <i>&quot;נטפליקס&quot;, &quot;גרוק&quot;, &quot;אדובי&quot;, &quot;Canva&quot;</i>) ותקבל מיד קישור ביטול ישיר והנחיות:
      </p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="איזה מנוי תרצה לבטל היום?..."
            className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 px-4 py-3.5 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm pl-10 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResult(null); setSearched(false); }}
              className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold px-6 py-3.5 rounded-2xl text-sm shadow-sm transition-all disabled:opacity-50 shrink-0 flex items-center justify-center gap-1.5"
        >
          <span>{loading ? 'מחפש קישור...' : 'קבל קישור ביטול ⚡'}</span>
        </button>
      </form>

      {/* Suggested Quick Tags */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">פופולרי עכשיו:</span>
        {[
          { label: 'Grok / X', q: 'Grok' },
          { label: 'נטפליקס', q: 'Netflix' },
          { label: 'ספוטיפיי', q: 'Spotify' },
          { label: 'אדובי', q: 'Adobe' },
          { label: 'ChatGPT Plus', q: 'ChatGPT' },
          { label: 'קנבה (Canva)', q: 'Canva' },
          { label: 'אמזון פריים', q: 'Amazon Prime' }
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setQuery(item.label)
              fetch(`/api/lookup?q=${encodeURIComponent(item.q)}`)
                .then((r) => r.json())
                .then((d) => { setResult(d.entry); setSearched(true); })
            }}
            className="px-3 py-1 rounded-full bg-slate-100/80 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200/60 font-medium transition-all"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Result Card */}
      {searched && (
        <div className="mt-5 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 animate-fadeIn">
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900">{result.name}</h4>
                  {result.notes && (
                    <p className="text-xs text-slate-600 mt-0.5">{result.notes}</p>
                  )}
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {result.difficulty === 'easy' ? 'ביטול פשוט' : 'ביטול מודרך'}
                </span>
              </div>

              {result.steps && result.steps.length > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100/60 text-xs space-y-1.5">
                  <p className="font-bold text-slate-800">שלבים פשוטים לביטול:</p>
                  {result.steps.map((step, idx) => (
                    <p key={idx} className="text-slate-600 flex items-start gap-1.5">
                      <span className="font-semibold text-emerald-600">{idx + 1}.</span>
                      <span>{step}</span>
                    </p>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={result.cancelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center py-3 px-4 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1"
                >
                  <span>פתח את עמוד הביטול של {result.name}</span>
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </a>
                {result.loginUrl && (
                  <a
                    href={result.loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-slate-700 border border-slate-200 text-xs font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors text-center"
                  >
                    התחברות לחשבון
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-600 text-center py-2">
              לא מצאנו קישור אוטומטי מדויק. נסה להקליד את שם השירות באנגלית או בעברית.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
