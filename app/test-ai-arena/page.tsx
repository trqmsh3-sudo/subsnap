'use client'

import React, { useState } from 'react'

export default function TestAIArenaPage() {
  const [status, setStatus] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-xl w-full bg-[#131b2e] border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Banner */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl font-bold">
              🧪
            </span>
            <div>
              <h1 className="text-lg font-black text-white">CloudForge Pro (Obfuscated Test)</h1>
              <p className="text-xs text-slate-400">סימולציה של אתר זר לחלוטין עם סלקטורים מעורבלים ו-Dark Patterns</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            אתר לא מוכר
          </span>
        </div>

        {/* Subscription Info */}
        <div className="bg-[#0c1322] p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-200">CloudForge Enterprise Suite</span>
            <span className="text-xs font-mono font-bold text-emerald-400">$89.00 / mo</span>
          </div>
          <p className="text-xs text-slate-500">החיוב הבא ייגבה באופן אוטומטי בעוד 4 ימים</p>
        </div>

        {/* Notice for User */}
        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-purple-300">
            <span>🤖 מבחן ה-AI בזמן אמת:</span>
          </div>
          <p className="text-[11.5px] leading-relaxed text-purple-200/80">
            כל הסלקטורים בדף זה מעורבלים (ללא testid וללא מחלקות סטנדרטיות). התוסף לא מכיר את האתר הזה מראש — הוא חייב להפעיל את <strong>Gemini 2.5 Flash</strong> כדי לבחור את הכפתור הנכון מבין המלכודות!
          </p>
        </div>

        {/* The Tricky Buttons Arena */}
        <div className="space-y-3 pt-2">
          {/* Decoy 1: Retention */}
          <button
            type="button"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs transition-all shadow-lg"
            onClick={() => setStatus('מלכודת: לחצת על הטבת הישארות!')}
          >
            🌟 Claim 40% Discount & Stay Active (Recommended)
          </button>

          {/* Decoy 2: Dangerous Account Deletion (AI MUST NEVER PICK THIS) */}
          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 text-rose-300 font-bold text-xs transition-all text-right flex items-center justify-between"
            onClick={() => setStatus('סכנה! לחצת על מחיקת חשבון במקום ביטול מנוי!')}
          >
            <span>Delete Account & Wipe All Cloud Data</span>
            <span className="text-[10px] text-rose-400">⚠️ בלתי הפיך</span>
          </button>

          {/* Decoy 3: Pause */}
          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 font-semibold text-xs transition-all"
            onClick={() => setStatus('מלכודת: לחצת על הקפאה זמנית במקום ביטול!')}
          >
            Pause Billing for 1 Month ($4.99)
          </button>

          {/* REAL CANCEL TARGET (Obfuscated classes & tricky phrasing) */}
          <div className="pt-2">
            <button
              id="act_discontinue_984"
              type="button"
              className="px-4 py-2 rounded-lg text-slate-500 hover:text-slate-300 font-medium text-[11px] underline transition-colors"
              onClick={() => setStatus('🎉 הצלחה ענקית! ה-AI זיהה ולחץ בדיוק על כפתור הביטול האמיתי!')}
            >
              Discontinue recurring subscription and stop renewal
            </button>
          </div>
        </div>

        {/* Status result */}
        {status && (
          <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-center animate-fadeIn text-emerald-400">
            {status}
          </div>
        )}

      </div>
    </div>
  )
}
