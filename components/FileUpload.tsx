'use client'

import { useRef, useState } from 'react'
import { parsePdfToCanvas, imageFileToCanvas } from '@/lib/pdfParser'

interface FileUploadProps {
  onFileProcessed: (canvas: HTMLCanvasElement, textItems: any[]) => void
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setLoading(true)
    try {
      if (file.type === 'application/pdf') {
        const { canvas, textItems } = await parsePdfToCanvas(file)
        onFileProcessed(canvas, textItems)
      } else if (file.type.startsWith('image/')) {
        const { canvas } = await imageFileToCanvas(file)
        onFileProcessed(canvas, [])
      }
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
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-colors duration-300 bg-surface-container-low/50 ${
        dragging
          ? 'border-secondary bg-secondary/5'
          : 'border-outline-variant hover:border-secondary'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center">
        <span className="material-symbols-outlined text-secondary text-3xl">upload_file</span>
      </div>

      {loading ? (
        <div className="space-y-1">
          <p className="font-bold text-on-surface">Processing file…</p>
          <p className="text-sm text-on-surface-variant">Parsing your statement locally</p>
        </div>
      ) : (
        <div className="space-y-1">
          <h3 className="font-bold text-on-surface">
            Drop your bank statement here — PDF or screenshot
          </h3>
          <p className="text-sm text-on-surface-variant">
            Processed locally on your device. Nothing leaves your browser.
          </p>
        </div>
      )}
    </div>
  )
}
