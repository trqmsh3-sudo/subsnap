'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CANCELLATION_DB, CancellationEntry, findCancellationEntry } from '@/lib/cancellationDb'

interface Category {
  id: string
  label: string
  icon: string
  tags: { label: string; q: string; badge?: string }[]
}

const CATEGORIES: Category[] = [
  {
    id: 'popular_il',
    label: '🇮🇱 מנויים נפוצים',
    icon: 'star',
    tags: [
      { label: 'קלוד (Claude)', q: 'קלוד', badge: 'AI' },
      { label: 'גרוק / X', q: 'גרוק', badge: 'X' },
      { label: 'נטפליקס', q: 'נטפליקס', badge: 'סרטים' },
      { label: 'ספוטיפיי', q: 'ספוטיפיי', badge: 'מוזיקה' },
      { label: 'אדובי (Adobe)', q: 'אדובי', badge: 'עיצוב' },
      { label: 'צ\'אט GPT', q: 'צ\'אט ג\'יפיטי', badge: 'AI' },
      { label: 'קנבה פרו', q: 'קנבה', badge: 'עיצוב' },
      { label: 'אפל / iCloud', q: 'אפל', badge: 'iOS' },
    ],
  },
  {
    id: 'ai_tools',
    label: '🤖 כלי AI ומפתחים',
    icon: 'smart_toy',
    tags: [
      { label: 'קלוד Pro/Max', q: 'קלוד' },
      { label: 'צ\'אט GPT פלוס', q: 'צ\'אט ג\'יפיטי' },
      { label: 'מידג\'ורני (Midjourney)', q: 'מידג\'ורני' },
      { label: 'פרפלקסיטי (Perplexity)', q: 'פרפלקסיטי' },
      { label: 'קורסור (Cursor AI)', q: 'קורסור' },
      { label: 'גרוק (X Premium)', q: 'גרוק' },
    ],
  },
  {
    id: 'streaming',
    label: '🎬 סטרימינג ומוזיקה',
    icon: 'play_circle',
    tags: [
      { label: 'נטפליקס (Netflix)', q: 'נטפליקס' },
      { label: 'ספוטיפיי (Spotify)', q: 'ספוטיפיי' },
      { label: 'יוטיוב פרימיום', q: 'יוטיוב' },
      { label: 'דיסני פלוס (+Disney)', q: 'דיסני' },
      { label: 'אמזון פריים (Prime)', q: 'אמזון פריים' },
    ],
  },
  {
    id: 'work_saas',
    label: '💼 עבודה ואחסון',
    icon: 'business_center',
    tags: [
      { label: 'אדובי Creative Cloud', q: 'אדובי' },
      { label: 'מיקרוסופט 365 / Office', q: 'מיקרוסופט' },
      { label: 'קנבה (Canva Pro)', q: 'קנבה' },
      { label: 'נושן (Notion Plus)', q: 'נושן' },
      { label: 'דרופבוקס (Dropbox)', q: 'דרופבוקס' },
      { label: 'גוגל וואן (Google One)', q: 'גוגל וואן' },
      { label: 'לינקדאין פרימיום', q: 'לינקדאין' },
      { label: 'דואולינגו (Duolingo)', q: 'דואולינגו' },
    ],
  },
]

export default function SmartTagBar() {
  const [activeCategory, setActiveCategory] = useState('popular_il')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CancellationEntry | null>(null)
  const [searched, setSearched] = useState(false)
  const [suggestions, setSuggestions] = useState<CancellationEntry[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Live autocomplete filtering
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

    setShowSuggestions(false)
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

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0]

  return (
    <div ref={wrapperRef} className="w-full studio-capsule p-6 sm:p-8 relative overflow-visible shadow-2xl border-emerald-500/20">
      {/* Ambient Top Line */}
      <div className="absolute top-0 right-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
            ⚡
          </div>
          <div>
            <h2 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
              איזה מנוי תרצה לבטל היום?
            </h2>
            <p className="text-xs text-zinc-400">
              בחר קטגוריה או הקלד כל שם שירות בעולם לביטול ישיר
            </p>
          </div>
        </div>
        <span className="self-start sm:self-auto text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
          מנוע 1-Click Auto
        </span>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs font-semibold">
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === activeCategory
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-500 text-[#032014] font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white border border-white/[0.05]'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Command Search Bar with Live Autocomplete */}
      <div className="relative mb-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 relative z-20">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              placeholder="הקלד כאן (למשל: קלוד, גרוק, נטפליקס, אדובי, רידווייז)..."
              className="w-full command-input text-white placeholder:text-zinc-500 px-4 py-3.5 rounded-xl text-sm pl-10 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setResult(null); setSearched(false); setSuggestions([]); setShowSuggestions(false); }}
                className="absolute left-3 top-3.5 text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-emerald px-7 py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
          >
            <span>{loading ? 'מפענח ומאתר...' : 'בטל עכשיו'}</span>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
        </form>

        {/* Live Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full right-0 left-0 mt-2 bg-[#0e121a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-fadeIn space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-emerald-400 border-b border-white/[0.04] flex items-center justify-between">
              <span>תוצאות התאמה מהירה:</span>
              <span className="text-zinc-500 font-normal text-[10px]">לחץ לביטול מיידי</span>
            </div>
            {suggestions.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => executeCancel(item)}
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
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-[#032014] transition-colors">
                  בטל עכשיו ➔
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Animated Tags Grid for Selected Category */}
      <div className="space-y-2 pt-1 border-t border-white/[0.04]">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span>תגיות מהירות (לחיצה אחת לפתיחה):</span>
          <span className="text-[10px] text-emerald-400">⚡ 0 שניות</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {currentCategory.tags.map((item) => (
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
                    .catch((err) => console.error('[SmartTagBar] tag lookup failed:', err))
                }
              }}
              className="studio-tag px-3 py-1.5 rounded-xl text-xs font-semibold hover:border-emerald-500/40 hover:text-emerald-300 flex items-center gap-1.5 transition-all"
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400 font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Instant Result & Confirmation Card */}
      {searched && (
        <div className="mt-5 p-5 rounded-2xl bg-white/[0.02] border border-emerald-500/30 animate-fadeIn space-y-3">
          {result ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    ✓
                  </span>
                  <div>
                    <h4 className="font-bold text-base text-white">
                      עמוד הביטול של {result.nameHe || result.name} נפתח בחלון חדש!
                    </h4>
                    {result.notes && (
                      <p className="text-xs text-zinc-400 mt-0.5">{result.notes}</p>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {result.difficulty === 'easy' ? 'ביטול ישיר' : 'ביטול מודרך'}
                </span>
              </div>

              {result.steps && result.steps.length > 0 && (
                <div className="bg-black/30 p-4 rounded-xl border border-white/[0.04] text-xs space-y-1.5">
                  <p className="font-bold text-zinc-200">שלבים להשלמת הפעולה בחלון שנפתח:</p>
                  {result.steps.map((step, idx) => (
                    <p key={idx} className="text-zinc-400 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">{idx + 1}.</span>
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
                  className="flex-1 btn-emerald text-center py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span>פתח שוב את עמוד הביטול הרשמי</span>
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
                {result.loginUrl && (
                  <a
                    href={result.loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] text-xs font-medium py-2.5 px-4 rounded-xl transition-colors text-center"
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
