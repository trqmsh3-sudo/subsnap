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
    <div className="w-full max-w-2xl mx-auto my-8 bg-surface-container-high/70 backdrop-blur-xl border border-outline-variant/20 rounded-[2rem] p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[#44e2cd] text-xl">bolt</span>
        <h3 className="font-bold text-base sm:text-lg text-on-surface">
          Instant Cancel Prompt / חיפוש ביטול ישיר
        </h3>
      </div>
      <p className="text-xs text-on-surface-variant mb-4">
        Type what you want to cancel (e.g. <i>&quot;Cancel Grok&quot;, &quot;תבטל לי את נטפליקס&quot;, &quot;Adobe&quot;, &quot;Canva&quot;</i>)
      </p>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a company name or command..."
            className="w-full bg-surface-container-lowest text-on-surface px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-[#44e2cd] text-sm pr-10 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResult(null); setSearched(false); }}
              className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface text-sm"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-gradient-to-br from-[#69ffe9] to-[#44e2cd] text-[#003731] font-bold px-5 py-3 rounded-xl text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shrink-0"
        >
          {loading ? 'Searching...' : 'Find Link ⚡'}
        </button>
      </form>

      {/* Suggested Quick Tags */}
      <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-on-surface-variant">
        <span>Popular:</span>
        {['Grok / X', 'Netflix', 'Spotify', 'Adobe', 'ChatGPT', 'Canva', 'Disney+'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag)
              fetch(`/api/lookup?q=${encodeURIComponent(tag)}`)
                .then((r) => r.json())
                .then((d) => { setResult(d.entry); setSearched(true); })
            }}
            className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest/80 border border-outline-variant/10 hover:border-[#44e2cd]/50 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Result Card */}
      {searched && (
        <div className="mt-5 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20 animate-fadeIn">
          {result ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-[#44e2cd]">{result.name}</h4>
                  {result.notes && (
                    <p className="text-xs text-on-surface-variant mt-0.5">{result.notes}</p>
                  )}
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  result.difficulty === 'easy'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {result.difficulty}
                </span>
              </div>

              {result.steps && result.steps.length > 0 && (
                <div className="bg-surface-container-high/40 p-3 rounded-lg text-xs space-y-1">
                  <p className="font-semibold text-on-surface">Steps to cancel:</p>
                  {result.steps.map((step, idx) => (
                    <p key={idx} className="text-on-surface-variant">
                      {idx + 1}. {step}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <a
                  href={result.cancelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-[#44e2cd] to-[#69ffe9] text-[#003731] font-bold text-center py-2.5 px-4 rounded-lg text-xs hover:opacity-90 transition-opacity"
                >
                  Go to Cancellation Page ➔
                </a>
                {result.loginUrl && (
                  <a
                    href={result.loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-surface-container-high text-on-surface text-xs font-semibold py-2.5 px-4 rounded-lg hover:bg-surface-container-highest transition-colors"
                  >
                    Login First
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant text-center py-2">
              No direct cancellation match found. Try entering the exact service name.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
