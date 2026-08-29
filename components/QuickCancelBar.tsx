'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CANCELLATION_DB, CancellationEntry, findCancellationEntry } from '@/lib/cancellationDb'

const HEBREW_TAGS = [
  { label: 'קלוד (Claude)', q: 'קלוד' },
  { label: 'גרוק / X', q: 'גרוק' },
  { label: 'נטפליקס', q: 'נטפליקס' },
  { label: 'ספוטיפיי', q: 'ספוטיפיי' },
  { label: 'אדובי', q: 'אדובי' },
  { label: 'צ\'אט GPT', q: 'צ\'אט ג\'יפיטי' },
  { label: 'מידג\'ורני', q: 'מידג\'ורני' },
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
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Live autocomplete filtering
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      setSelectedIndex(-1)
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
    setSelectedIndex(-1)
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

  // 1-Click Instant Execution
  function executeCancel(item: CancellationEntry) {
    setQuery(item.nameHe || item.name)
    setResult(item)
    setSearched(true)
    setShowSuggestions(false)
    if (item.cancelUrl) {
      window.open(item.cancelUrl, '_blank', 'noopener,noreferrer')
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      executeCancel(suggestions[selectedIndex])
      return
    }

    setShowSuggestions(false)
    
    // Check local direct match first for instant 0ms open
    const direct = findCancellationEntry(query)
    if (direct) {
      executeCancel(direct)
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data.entry) {
        setResult(data.entry)
        if (data.entry.cancelUrl) {
          window.open(data.entry.cancelUrl, '_blank', 'noopener,noreferrer')
        }
      } else {
        setResult(null)
      }
    } catch (err) {
      console.error('Lookup error:', err)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    } else if (e.key === 'ArrowDown') {
      if (!showSuggestions && suggestions.length > 0) {
        setShowSuggestions(true)
      } else if (suggestions.length > 0) {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % suggestions.length)
      }
    } else if (e.key === 'ArrowUp') {
      if (suggestions.length > 0) {
        e.preventDefault()
        setSelectedIndex(prev => (prev <= 0 ? suggestions.length - 1 : prev - 1))
      }
    }
  }

  return (
    <div ref={wrapperRef} className="w-full bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-lg">
            ⚡
          </div>
          <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
            איזה מנוי תרצה לבטל היום?
          </h2>
        </div>
        <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
          ביטול בלחיצה אחת ⚡
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
        הקלד שם מנוי או לחץ על תגית — ונפתח עבורך ישירות את נתיב הביטול הרשמי:
      </p>

      {/* Command Input Bar */}
      <div className="relative">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 relative z-20">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              placeholder="הקלד כאן (למשל: נטפליקס, קלוד, ספוטיפיי, אדובי)..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 px-4 py-3 rounded-xl text-sm pl-10 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setResult(null); setSearched(false); setSuggestions([]); setShowSuggestions(false); inputRef.current?.focus(); }}
                className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'מאתר נתיב ביטול...' : 'בטל עכשיו'}</span>
            <span>➔</span>
          </button>
        </form>

        {/* Live Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full right-0 left-0 mt-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl z-50 animate-fadeIn space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100 flex items-center justify-between">
              <span>בחר לפתיחה וביטול מיידי:</span>
              <span className="font-normal text-[10px]">לחיצה אחת</span>
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={item.name}
                type="button"
                onClick={() => executeCancel(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-right px-3.5 py-2.5 rounded-xl border flex items-center justify-between transition-colors group ${
                  selectedIndex === idx
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700">
                    {item.nameHe || item.name}
                  </div>
                  {item.notes && (
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.notes}</div>
                  )}
                </div>
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  בטל עכשיו ➔
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular Quick Pills */}
      <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3.5 border-t border-slate-100 text-xs">
        <span className="text-slate-500 text-[11px] ml-1 font-semibold">ביטול מהיר בלחיצה:</span>
        {HEBREW_TAGS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              const matched = findCancellationEntry(item.q)
              if (matched) {
                executeCancel(matched)
              } else {
                setQuery(item.label)
                fetch(`/api/lookup?q=${encodeURIComponent(item.q)}`)
                  .then((r) => r.json())
                  .then((d) => {
                    if (d.entry) executeCancel(d.entry)
                  })
              }
            }}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-transparent transition-all"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Confirmation & Instructions Card */}
      {searched && (
        <div className="mt-4 p-4 sm:p-5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 animate-fadeIn space-y-3">
          {result ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    ✓
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                      עמוד הביטול של {result.nameHe || result.name} נפתח בחלון חדש!
                    </h4>
                    {result.notes && (
                      <p className="text-xs text-slate-600 mt-0.5">{result.notes}</p>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {result.difficulty === 'easy' ? 'ביטול ישיר' : 'ביטול מודרך'}
                </span>
              </div>

              {result.steps && result.steps.length > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1.5 shadow-2xs">
                  <p className="font-bold text-slate-900">שלבים להשלמת הביטול בחלון שנפתח:</p>
                  {result.steps.map((step, idx) => (
                    <p key={idx} className="text-slate-600 flex items-start gap-2">
                      <span className="text-emerald-700 font-extrabold">{idx + 1}.</span>
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
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-center py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <span>פתח שוב את עמוד הביטול</span>
                  <span>➔</span>
                </a>
                {result.loginUrl && (
                  <a
                    href={result.loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl transition-all text-center"
                  >
                    עמוד התחברות לחשבון
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 text-center py-2 font-medium">
              לא מצאנו קישור ישיר מדויק. נסה להקליד את שם השירות באנגלית או בעברית.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
