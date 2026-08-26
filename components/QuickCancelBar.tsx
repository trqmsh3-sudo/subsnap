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
    <div className="w-full studio-capsule p-6 sm:p-8 relative overflow-hidden">
      {/* Top micro-line gradient */}
      <div className="absolute top-0 right-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">bolt</span>
          </div>
          <h2 className="font-semibold text-lg sm:text-xl text-white tracking-tight">
            איזה מנוי תרצה לבטל היום?
          </h2>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-400">
          ביטול ישיר
        </span>
      </div>

      <p className="text-xs sm:text-sm text-zinc-400 mb-5 leading-relaxed">
        הקלד שם שירות (למשל <i>גרוק, נטפליקס, אדובי, ספוטיפיי, Canva</i>) כדי לקבל קישור ביטול רשמי ומדויק:
      </p>

      {/* Command Input Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 relative">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="הקלד שם מנוי לביטול..."
            className="w-full command-input text-white placeholder:text-zinc-500 px-4 py-3 rounded-xl text-sm pl-10 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResult(null); setSearched(false); }}
              className="absolute left-3 top-3 text-zinc-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-emerald px-5 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{loading ? 'מאתר קישור...' : 'מצא קישור ביטול'}</span>
          <span className="material-symbols-outlined text-sm">arrow_back</span>
        </button>
      </form>

      {/* Popular Quick Pills */}
      <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3.5 border-t border-white/[0.04] text-xs">
        <span className="text-zinc-400 text-[11px] ml-1">נפוץ עכשיו:</span>
        {[
          { label: 'Grok / X', q: 'Grok' },
          { label: 'Netflix', q: 'Netflix' },
          { label: 'Spotify', q: 'Spotify' },
          { label: 'Adobe', q: 'Adobe' },
          { label: 'ChatGPT Plus', q: 'ChatGPT' },
          { label: 'Canva', q: 'Canva' },
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
            className="studio-tag px-2.5 py-1 rounded-lg text-[11px]"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Result Card */}
      {searched && (
        <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-emerald-500/20 animate-fadeIn space-y-3">
          {result ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-emerald-400">{result.name}</h4>
                  {result.notes && (
                    <p className="text-xs text-zinc-400 mt-0.5">{result.notes}</p>
                  )}
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {result.difficulty === 'easy' ? 'ביטול ישיר' : 'ביטול מודרך'}
                </span>
              </div>

              {result.steps && result.steps.length > 0 && (
                <div className="bg-black/30 p-3 rounded-lg border border-white/[0.04] text-xs space-y-1">
                  <p className="font-medium text-zinc-300">שלבים לביטול:</p>
                  {result.steps.map((step, idx) => (
                    <p key={idx} className="text-zinc-400 flex items-start gap-1.5">
                      <span className="text-emerald-400 font-semibold">{idx + 1}.</span>
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
                  className="flex-1 btn-emerald text-center py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <span>פתח עמוד ביטול רשמי של {result.name}</span>
                  <span className="material-symbols-outlined text-xs">arrow_back</span>
                </a>
                {result.loginUrl && (
                  <a
                    href={result.loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] text-xs font-medium py-2.5 px-4 rounded-lg transition-colors text-center"
                  >
                    התחברות
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-zinc-400 text-center py-2">
              לא מצאנו קישור ישיר מדויק. נסה להקליד את שם השירות באנגלית או בעברית.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
