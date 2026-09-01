'use client'

import React, { useState } from 'react'

export default function TestAIArenaPage() {
  const [currentScenario, setCurrentScenario] = useState<'adobe' | 'cloudforge' | 'retention'>('adobe')
  
  // Adobe State
  const [adobeStage, setAdobeStage] = useState<'overview' | 'fee_warning' | 'survey' | 'offers' | 'review' | 'cancelled'>('overview')
  const [adobeReason, setAdobeReason] = useState<string | null>(null)
  const [adobeUnderstood, setAdobeUnderstood] = useState(false)
  const [adobeTrap, setAdobeTrap] = useState<string | null>(null)

  // Cloudforge State
  const [cfStatus, setCfStatus] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      
      {/* Top Scenario Switcher */}
      <div className="max-w-2xl w-full mb-4 flex items-center justify-between bg-[#131b2e] border border-slate-700/60 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white px-2">🏟️ AI Arena:</span>
          <button
            type="button"
            onClick={() => setCurrentScenario('adobe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentScenario === 'adobe'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Adobe 5-Stage Gauntlet 🔥
          </button>
          <button
            type="button"
            onClick={() => setCurrentScenario('cloudforge')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentScenario === 'cloudforge'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            CloudForge (Obfuscated) 🧪
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setAdobeStage('overview')
            setAdobeReason(null)
            setAdobeUnderstood(false)
            setAdobeTrap(null)
            setCfStatus(null)
          }}
          className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700"
        >
          איפוס 🔄
        </button>
      </div>

      {/* =================== SCENARIO 1: ADOBE 5-STAGE GAUNTLET =================== */}
      {currentScenario === 'adobe' && (
        <div className="max-w-2xl w-full bg-[#161e31] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-lg">
                Ad
              </div>
              <div>
                <h1 className="text-base font-extrabold text-white">Adobe Creative Cloud Pro</h1>
                <p className="text-xs text-slate-400">סימולציה של האתר הקשה בעולם — 5 שלבי דארק פטרנס של אדובי</p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              שלב: {adobeStage}
            </span>
          </div>

          {/* STAGE 1: PLAN OVERVIEW */}
          {adobeStage === 'overview' && (
            <div className="space-y-5">
              <div className="bg-[#0c1322] p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-100">All Apps Plan (Annual, Paid Monthly)</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">$59.99 / month</span>
                </div>
                <p className="text-xs text-slate-400">Next payment: $59.99 on October 14, 2026</p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-semibold text-emerald-400">Recurring: Active</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="button"
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                  onClick={() => setAdobeTrap('מלכודת: לחצת על שינוי תוכנית במקום ביטול!')}
                >
                  Change Payment Method or Switch Plan
                </button>

                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 font-semibold text-xs"
                  onClick={() => setAdobeStage('fee_warning')}
                >
                  Cancel your plan
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: EARLY TERMINATION FEE TRAP */}
          {adobeStage === 'fee_warning' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed space-y-2">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                  <span>⚠️ Early Termination Fee Warning</span>
                </div>
                <p>Because you are cancelling before your 1-year commitment ends:</p>
                <p>An Early Termination Fee of <strong>$149.85</strong> will be charged per contract policy unless you keep your subscription active.</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  onClick={() => {
                    setAdobeTrap('מלכודת: נבהלת מדמי הביטול ונשארת במנוי!')
                    setAdobeStage('overview')
                  }}
                >
                  Keep my plan (Avoid $149.85 fee)
                </button>

                <button
                  type="button"
                  className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
                  onClick={() => setAdobeStage('survey')}
                >
                  Continue to cancel
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: MANDATORY RETENTION SURVEY */}
          {adobeStage === 'survey' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-bold text-white">Why are you cancelling?</h2>
                <p className="text-xs text-slate-400 mt-1">Please select a reason to proceed with cancellation</p>
              </div>

              <div className="space-y-2">
                {[
                  'Too expensive / Budget reasons',
                  'Found another product',
                  'Technical issues or performance',
                  'Only needed it for a short project',
                  'Other reasons'
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      adobeReason === reason
                        ? 'bg-blue-950/40 border-blue-500 text-white font-semibold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      checked={adobeReason === reason}
                      onChange={() => setAdobeReason(reason)}
                      className="accent-blue-500"
                    />
                    <span className="text-xs">{reason}</span>
                  </label>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!adobeReason}
                  className={`py-2.5 px-6 rounded-xl font-bold text-xs transition-all ${
                    adobeReason
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg cursor-pointer'
                      : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                  }`}
                  onClick={() => setAdobeStage('offers')}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: DECEPTIVE OFFERS / DISCOUNT TRAP */}
          {adobeStage === 'offers' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 text-xs space-y-2">
                <div className="text-sm font-extrabold text-emerald-300">🎉 Claim 3 Months at $0.00</div>
                <p className="text-slate-300 leading-relaxed">
                  Stay with us and receive the next 3 months completely free ($179.97 value). Your plan will automatically resume at $59.99/mo after 90 days.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="button"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-xl"
                  onClick={() => {
                    setAdobeTrap('מלכודת: קיבלת את הצעת ההנחה ונשארת במנוי פעיל!')
                    setAdobeStage('overview')
                  }}
                >
                  Accept 3 Months Free & Stay Active
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    className="text-xs text-slate-400 hover:text-slate-200 underline font-medium"
                    onClick={() => setAdobeStage('review')}
                  >
                    No thanks, continue to cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 5: LOSS AVERSION & FINAL CONFIRMATION */}
          {adobeStage === 'review' && (
            <div className="space-y-5">
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span>❌</span>
                  <span>Loss of 100GB Cloud Storage (Files will be archived)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span>❌</span>
                  <span>Access to 20,000+ Adobe Fonts revoked</span>
                </div>
              </div>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adobeUnderstood}
                  onChange={(e) => setAdobeUnderstood(e.target.checked)}
                  className="w-4 h-4 accent-red-500 rounded"
                />
                <span className="text-xs text-slate-200 font-semibold">
                  I understand that I will lose access to all apps and cloud storage upon cancellation.
                </span>
              </label>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!adobeUnderstood}
                  className={`py-3 px-6 rounded-xl font-extrabold text-xs transition-all ${
                    adobeUnderstood
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-xl cursor-pointer'
                      : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                  }`}
                  onClick={() => setAdobeStage('cancelled')}
                >
                  Confirm cancellation
                </button>
              </div>
            </div>
          )}

          {/* STAGE 6: CANCELLED */}
          {adobeStage === 'cancelled' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-3xl mx-auto">
                🎉
              </div>
              <h2 className="text-2xl font-black text-white">Your Plan is Cancelled</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Your subscription has been cancelled. Recurring billing is inactive.
              </p>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 inline-block text-xs font-mono text-emerald-400">
                Recurring: Inactive · Expires on October 14, 2026
              </div>
            </div>
          )}

          {/* Trap Alert */}
          {adobeTrap && (
            <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-600 text-amber-300 text-xs font-bold text-center">
              ⚠️ {adobeTrap}
            </div>
          )}

        </div>
      )}

      {/* =================== SCENARIO 2: CLOUDFORGE OBFUSCATED =================== */}
      {currentScenario === 'cloudforge' && (
        <div className="max-w-xl w-full bg-[#131b2e] border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl font-bold">
                🧪
              </span>
              <div>
                <h1 className="text-base font-black text-white">CloudForge Pro (Obfuscated)</h1>
                <p className="text-xs text-slate-400">סלקטורים מעורבלים ומלכודות מחיקת חשבון</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              אתר לא מוכר
            </span>
          </div>

          <div className="bg-[#0c1322] p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-200">CloudForge Enterprise Suite</span>
              <span className="text-xs font-mono font-bold text-emerald-400">$89.00 / mo</span>
            </div>
            <p className="text-xs text-slate-500">Recurring: Active · Next payment in 4 days</p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg"
              onClick={() => setCfStatus('מלכודת: לחצת על הטבת הישארות!')}
            >
              🌟 Claim 40% Discount & Stay Active (Recommended)
            </button>

            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 text-rose-300 font-bold text-xs transition-all text-right flex items-center justify-between"
              onClick={() => setCfStatus('סכנה! לחצת על מחיקת חשבון במקום ביטול מנוי!')}
            >
              <span>Delete Account & Wipe All Cloud Data</span>
              <span className="text-[10px] text-rose-400">⚠️ בלתי הפיך</span>
            </button>

            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 font-semibold text-xs"
              onClick={() => setCfStatus('מלכודת: לחצת על הקפאה זמנית במקום ביטול!')}
            >
              Pause Billing for 1 Month ($4.99)
            </button>

            <div className="pt-2">
              <button
                id="act_discontinue_984"
                type="button"
                className="px-4 py-2 rounded-lg text-slate-500 hover:text-slate-300 font-medium text-[11px] underline"
                onClick={() => setCfStatus('🎉 הצלחה ענקית! ה-AI זיהה ולחץ בדיוק על כפתור הביטול האמיתי!')}
              >
                Discontinue recurring subscription and stop renewal
              </button>
            </div>
          </div>

          {cfStatus && (
            <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-center text-emerald-400">
              {cfStatus}
            </div>
          )}

        </div>
      )}

    </div>
  )
}

