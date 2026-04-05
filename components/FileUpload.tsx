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
      className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all
        ${dragging ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-gray-400'}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {loading ? (
        <p className="text-gray-500 text-sm">Processing file...</p>
      ) : (
        <>
          <p className="text-lg font-medium text-gray-700">Drop your bank statement here</p>
          <p className="text-sm text-gray-400 mt-1">PDF or screenshot — stays on your device</p>
        </>
      )}
    </div>
  )
}
