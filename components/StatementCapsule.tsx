'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StatementCapsule() {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleFileSelected() {
    router.push('/app')
  }

  return (
    <div className="w-full studio-capsule p-6 sm:p-8 relative overflow-hidden">
      {/* Top micro-line gradient */}
      <div className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">document_scanner</span>
          </div>
          <h2 className="font-semibold text-lg sm:text-xl text-white tracking-tight">
            שים פה את דף פירוט החיובים החודשי
          </h2>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-400">
          סריקה מלאה
        </span>
      </div>

      <p className="text-xs sm:text-sm text-zinc-400 mb-5 leading-relaxed">
        גרור צילום מסך או PDF של פירוט האשראי — ואנחנו נמצא את כל המנויים החבויים שתרצה לבטל:
      </p>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFileSelected();
        }}
        onClick={() => inputRef.current?.click()}
        className={`w-full rounded-xl p-5 sm:p-6 border border-dashed flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-sky-400 bg-sky-500/10'
            : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.02]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={() => handleFileSelected()}
        />

        <div className="flex items-center gap-3.5 text-right">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sky-400 shrink-0">
            <span className="material-symbols-outlined text-xl">upload_file</span>
          </div>
          <div>
            <h3 className="font-medium text-sm text-zinc-200">
              גרור לכאן את הקובץ או לחץ לבחירה
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              תומך בקובצי תמונה (PNG/JPG) וקובצי PDF מכל הבנקים
            </p>
          </div>
        </div>

        <div className="bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] font-medium px-4 py-2.5 rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1.5">
          <span>פתח סורק תדפיסים</span>
          <span className="material-symbols-outlined text-xs">arrow_back</span>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3.5 border-t border-white/[0.04] text-xs text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="text-sky-400">🔒</span>
          <span>100% פרטיות — הקובץ מעובד מקומית במכשיר שלך בלבד</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-400">🛡️</span>
          <span>שמות ומספרי חשבון מושחרים אוטומטית</span>
        </div>
      </div>
    </div>
  )
}
