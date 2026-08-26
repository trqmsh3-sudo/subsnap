'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CANCELLATION_DB, CancellationEntry } from '@/lib/cancellationDb'

const HEBREW_TAGS = [
  { label: 'גרוק / X', q: 'גרוק' },
  { label: 'נטפליקס', q: 'נטפליקס' },
  { label: 'ספוטיפיי', q: 'ספוטיפיי' },
  { label: 'אדובי', q: 'אדובי' },
  { label: 'צ\'אט GPT', q: 'צ\'אט ג\'יפיטי' },
  { label: 'קנבה', q: 'קנבה' },
  { label: 'אפל / אייקלאוד', q: 'אפל' },
  { label: 'גוגל פליי', q: 'גוגל פליי' },
  { label: 'אמזון פריים', q: 'אמזון פריים' },
  { label: 'יוטיוב פרימיום', q: 'יוטיוב' },
  { label: 'דיסני פלוס', q: 'דיסני' },
]

export default function QuickCancelBar() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CancellationEntry | null>(null)
  const [searched, setSearched] = useState(false)
  const [suggestions, setSuggestions] = useState<CancellationEntry[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Live autocomplete filtering in Hebrew & English
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const q = query.toLowerCase().trim()
    const matches = CANCELLATION_DB.filter(item => 
      item.name.toLowerCase().includes(q) ||
      (item.nameHe && item.nameHe.toLowerCase().includes(q)) ||
      item.keywords.some(k => k.includes(q) || q.includes(k))
    ).slice(0, 5)

    setSuggestions(matches)
    setShowSuggestions(matches.length > 0)
  }, [query])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectService(item: CancellationEntry) {
    setQuery(item.nameHe || item.name)
    setResult(item)
    setSearched(true)
    setShowSuggestions(false)
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setShowSuggestions(false)
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
    <div ref={wrapperRef} className="w-full studio-capsule p-6 sm:p-8 relative overflow-visible">
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
        הקלד שם שירות (למשל <i>גרוק, נטפליקס, אדובי, ספוטיפיי, קנבה</i>) — וההצעות יקפצו מיד:
      </p>

      {/* Command Input Bar with Live Dropdown */}
      <div className="relative">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 relative z-20">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              placeholder="הקלד כאן בעברית או באנגלית (למשל: נטפליקס, גרוק...)..."
              className="w-full command-input text-white placeholder:text-zinc-500 px-4 py-3 rounded-xl text-sm pl-10 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setResult(null); setSearched(false); setSuggestions([]); setShowSuggestions(false); }}
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

        {/* ── LIVE AUTOCOMPLETE POPUP IN HEBREW ── */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full right-0 left-0 mt-2 bg-[#0e121a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-emerald-400 border-b border-white/[0.04] flex items-center justify-between">
              <span>תוצאות התאמה מהירה:</span>
              <span className="text-zinc-500 font-normal text-[10px]">לחץ לבחירה</span>
            </div>
            {suggestions.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => selectService(item)}
                className="w-full text-right px-3.5 py-2.5 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="font-semibold text-sm text-zinc-100 group-hover:text-emerald-400">
                    {item.nameHe || item.name}
                  </div>
                  {item.notes && (
                    <div className="text-[11px] text-zinc-400 mt-0.5">{item.notes}</div>
                  )}
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300">
                  {item.difficulty === 'easy' ? 'ביטול ישיר' : 'ביטול מודרך'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular Quick Pills in 100% Hebrew */}
      <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3.5 border-t border-white/[0.04] text-xs">
        <span className="text-zinc-400 text-[11px] ml-1">נפוץ עכשיו:</span>
        {HEBREW_TAGS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setQuery(item.label)
              const matched = CANCELLATION_DB.find(db => 
                db.name.toLowerCase().includes(item.q.toLowerCase()) || 
                db.keywords.some(k => k.includes(item.q.toLowerCase()))
              )
              if (matched) {
                setResult(matched)
                setSearched(true)
                setShowSuggestions(false)
              } else {
                fetch(`/api/lookup?q=${encodeURIComponent(item.q)}`)
                  .then((r) => r.json())
                  .then((d) => { setResult(d.entry); setSearched(true); setShowSuggestions(false); })
              }
            }}
            className="studio-tag px-2.5 py-1 rounded-lg text-[11px]"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Result Card in 100% Hebrew */}
      {searched && (
        <div className="mt-4 p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-emerald-500/20 animate-fadeIn space-y-3">
          {result ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-base text-emerald-400">{result.nameHe || result.name}</h4>
                  {result.notes && (
                    <p className="text-xs text-zinc-400 mt-0.5">{result.notes}</p>
                  )}
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {result.difficulty === 'easy' ? 'ביטול ישיר' : 'ביטול מודרך'}
                </span>
              </div>

              {result.steps && result.steps.length > 0 && (
                <div className="bg-black/30 p-3.5 rounded-lg border border-white/[0.04] text-xs space-y-1.5">
                  <p className="font-medium text-zinc-200">שלבים לביטול מהיר:</p>
                  {result.steps.map((step, idx) => (
                    <p key={idx} className="text-zinc-400 flex items-start gap-2">
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
                  <span>פתח עמוד ביטול רשמי של {result.nameHe || result.name}</span>
                  <span className="material-symbols-outlined text-xs">arrow_back</span>
                </a>
                {result.loginUrl && (
                  <a
                    href={result.loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] text-xs font-medium py-2.5 px-4 rounded-lg transition-colors text-center"
                  >
                    עמוד התחברות
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
