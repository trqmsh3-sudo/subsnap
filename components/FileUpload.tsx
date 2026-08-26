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
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-all duration-200 bg-slate-50/60 ${
          dragging
            ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
            : 'border-slate-300/80 hover:border-emerald-500 hover:bg-slate-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shadow-xs">
          <span className="material-symbols-outlined text-3xl">upload_file</span>
        </div>

        {loading ? (
          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-sm sm:text-base">מעבד את הקובץ מקומית…</p>
            <p className="text-xs text-slate-500">משחיר פרטים רגישים ישירות בדפדפן שלך</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              גרור לכאן את תדפיס החשבון — קובץ PDF או צילום מסך
            </h3>
            <p className="text-xs text-slate-500">
              או לחץ לבחירת קובץ מהמחשב או הטלפון
            </p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs font-semibold text-center mt-2">{error}</p>
      )}
    </>
  )
}
