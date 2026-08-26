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
    <div className="w-full gemini-capsule p-6 sm:p-8 relative overflow-hidden">
      {/* Subtle top inner glow */}
      <div className="absolute top-0 right-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#44e2cd]/40 to-transparent blur-xs" />

      {/* Header with Gemini sparkle */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#44e2cd]/10 border border-[#44e2cd]/30 text-[#44e2cd] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(68,226,205,0.2)]">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <div>
            <h3 className="font-black text-lg sm:text-2xl text-white tracking-tight">
              איזה מנוי תרצה לבטל היום?
            </h3>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#44e2cd]">
          ביטול מיידי ⚡
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-400 mb-5">
        הקלד שם שירות או פקודה (לדוגמה: <i>&quot;גרוק&quot;, &quot;נטפליקס&quot;, &quot;אדובי&quot;, &quot;Canva&quot;</i>) — וקבל קישור ביטול ישיר:
      </p>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 relative">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="הקלד כאן את שם המנוי לביטול..."
            className="w-full gemini-input text-white placeholder:text-slate-500 px-5 py-4 rounded-2xl text-sm pl-12"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResult(null); setSearched(false); }}
              className="absolute left-4 top-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="gemini-btn-primary px-7 py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-lg">bolt</span>
          <span>{loading ? 'מאתר ביטול...' : 'מצא קישור ביטול'}</span>
        </button>
      </form>

      {/* Suggested Quick Tags */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/5 text-xs text-slate-400">
        <span className="font-bold text-slate-300">פופולרי:</span>
        {[
          { label: 'Grok / X', q: 'Grok' },
          { label: 'Netflix', q: 'Netflix' },
          { label: 'Spotify', q: 'Spotify' },
          { label: 'Adobe', q: 'Adobe' },
          { label: 'ChatGPT Plus', q: 'ChatGPT' },
          { label: 'Canva Pro', q: 'Canva' },
          { label: 'Apple ID', q: 'Apple' },
          { label: 'Google Play', q: 'Google Play' }
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
            className="gemini-tag px-3.5 py-1.5 rounded-xl font-medium"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Result Card */}
      {searched && (
        <div className="mt-5 p-5 rounded-2xl bg-white/[0.04] border border-[#44e2cd]/30 shadow-[0_0_30px_rgba(68,226,205,0.08)] animate-fadeIn">
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-lg text-[#44e2cd]">{result.name}</h4>
                  {result.notes && (
                    <p className="text-xs text-slate-300 mt-0.5">{result.notes}</p>
                  )}
                </div>
                <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full bg-[#44e2cd]/10 text-[#44e2cd] border border-[#44e2cd]/20">
                  {result.difficulty === 'easy' ? 'ביטול ישיר' : 'ביטול מודרך'}
                </span>
              </div>

              {result.steps && result.steps.length > 0 && (
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-xs space-y-1.5">
                  <p className="font-bold text-slate-200">הנחיות לביטול מהיר:</p>
                  {result.steps.map((step, idx) => (
                    <p key={idx} className="text-slate-400 flex items-start gap-2">
                      <span className="font-bold text-[#44e2cd]">{idx + 1}.</span>
                      <span>{step}</span>
                    </p>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a
                  href={result.cancelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 gemini-btn-primary text-center py-3.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <span>פתח עמוד ביטול רשמי של {result.name}</span>
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </a>
                {result.loginUrl && (
                  <a
                    href={result.loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold py-3.5 px-5 rounded-xl transition-colors text-center"
                  >
                    מסך התחברות
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">
              לא מצאנו קישור אוטומטי מדויק. נסה להקליד את שם השירות באנגלית או בעברית.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
