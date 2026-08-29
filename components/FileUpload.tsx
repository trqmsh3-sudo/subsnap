'use client'

import { useRef, useState } from 'react'
import { parsePdfToCanvas, imageFileToCanvas } from '@/lib/pdfParser'

interface FileUploadProps {
  onFileProcessed: (canvas: HTMLCanvasElement, textItems: unknown[]) => void
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setLoading(true)
    try {
      if (file.type === 'application/pdf') {
        const { canvas, textItems } = await parsePdfToCanvas(file)
        onFileProcessed(canvas, textItems)
      } else if (file.type.startsWith('image/')) {
        const { canvas } = await imageFileToCanvas(file)
        onFileProcessed(canvas, [])
      } else {
        setError('אנא העלה קובץ תמונה (PNG/JPG) או קובץ PDF.')
      }
    } catch (err) {
      console.error('[fileUpload] parse error:', err)
      setError('אירעה שגיאה בקריאת הקובץ. אנא נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <>
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
            : 'border-slate-300/80 bg-slate-50/60 hover:border-emerald-500/60 hover:bg-emerald-50/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs text-2xl">
          ☁️
        </div>

        {loading ? (
          <div className="space-y-1.5">
            <p className="font-extrabold text-slate-900 text-sm sm:text-base">מעבד את הקובץ מקומית בדפדפן…</p>
            <p className="text-xs text-slate-500 font-medium">משחיר פרטים אישיים ומספרי כרטיס ישירות במכשיר שלך</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              גרור לכאן את תדפיס החשבון — קובץ PDF או צילום מסך
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              או לחץ לבחירת קובץ מהמכשיר שלך (עיבוד 100% מקומי)
            </p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-rose-600 text-xs font-bold text-center mt-2">{error}</p>
      )}
    </>
  )
}
