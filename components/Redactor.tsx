'use client'

import { useEffect, useRef, useState } from 'react'
import { redactCanvas, canvasToBase64 } from '@/lib/redact'

interface RedactorProps {
  sourceCanvas: HTMLCanvasElement
  textItems: unknown[]
  onRedacted: (base64: string) => void
}

export default function Redactor({ sourceCanvas, textItems, onRedacted }: RedactorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      const redacted = redactCanvas(sourceCanvas, textItems as any[])
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx && canvasRef.current) {
        canvasRef.current.width = redacted.width
        canvasRef.current.height = redacted.height
        ctx.drawImage(redacted, 0, 0)
        onRedacted(canvasToBase64(redacted))
      }
    } catch (err) {
      console.error('[Redactor] redaction failed:', err)
      setError(true)
    }
  }, [sourceCanvas, textItems, onRedacted])

  if (error) {
    return (
      <div className="mt-4 p-3 bg-red-50/40 rounded-2xl border border-red-100/60 text-xs text-red-700">
        לא ניתן היה לעבד את התמונה. נסה קובץ אחר.
      </div>
    )
  }

  return (
    <div className="mt-4 p-3 bg-emerald-50/40 rounded-2xl border border-emerald-100/60">
      <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-2">
        <span className="material-symbols-outlined text-sm">visibility_off</span>
        <span>נתונים רגישים הושחרו מקומית בדפדפן לפני שליחה לניתוח</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border border-slate-200 shadow-xs"
      />
    </div>
  )
}
