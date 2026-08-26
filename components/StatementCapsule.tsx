'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StatementCapsule() {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleFileSelected(file: File) {
    // Navigate to /app to process the file in full dashboard
    router.push('/app')
  }

  return (
    <div className="w-full gemini-capsule p-6 sm:p-8 relative overflow-hidden">
      {/* Subtle top inner glow */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent blur-xs" />

      {/* Header with Scan Icon */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
          </div>
          <div>
            <h3 className="font-black text-lg sm:text-2xl text-white tracking-tight">
              שים פה את דף פירוט החיובים החודשי
            </h3>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#38bdf8]">
          גילוי מנויים מלא 🔍
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-400 mb-5">
        גרור צילום מסך או קובץ PDF של כרטיס האשראי — ואנחנו נמצא את כל המנויים החבויים שתרצה לבטל:
      </p>

      {/* Upload Drop Capsule */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFileSelected(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`w-full rounded-2xl p-6 sm:p-8 border-2 border-dashed flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer transition-all duration-300 ${
          dragging
            ? 'border-[#38bdf8] bg-[#38bdf8]/10 scale-[1.01]'
            : 'border-white/10 bg-black/30 hover:border-[#38bdf8]/50 hover:bg-white/[0.02]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
        />

        <div className="flex items-center gap-4 text-right">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#38bdf8] shrink-0">
            <span className="material-symbols-outlined text-2xl">cloud_upload</span>
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base text-white">
              גרור לכאן את הקובץ או לחץ לבחירה
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              תומך בקובצי תמונה (PNG/JPG) וקובצי PDF מכל הבנקים וחברות האשראי
            </p>
          </div>
        </div>

        <div className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl text-xs transition-colors shrink-0 flex items-center gap-2">
          <span>פתח סורק תדפיסים</span>
          <span className="material-symbols-outlined text-sm">arrow_back</span>
        </div>
      </div>

      {/* Trust Badges Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8]">🔒</span>
          <span>100% פרטיות — הקובץ מעובד מקומית בדפדפן בלבד</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#44e2cd]">🛡️</span>
          <span>שמות ומספרי חשבון מושחרים אוטומטית</span>
        </div>
      </div>
    </div>
  )
}
