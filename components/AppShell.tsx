'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Preview from '@/components/Preview'

// pdfjs-dist calls browser-only APIs at module-evaluation time.
// Loading these components lazily (ssr: false) prevents them from
// being evaluated in the Node.js server bundle.
const FileUpload = dynamic(() => import('@/components/FileUpload'), { ssr: false })
const Redactor = dynamic(() => import('@/components/Redactor'), { ssr: false })

export default function AppShell() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [textItems, setTextItems] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  function handleFileProcessed(c: HTMLCanvasElement, items: any[]) {
    setCanvas(c)
    setTextItems(items)
    setSubscriptions([])
  }

  const handleRedacted = useCallback(async (base64: string) => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })
      const data = await res.json()
      setSubscriptions(data.subscriptions ?? [])
    } finally {
      setAnalyzing(false)
    }
  }, [])

  return (
    <>
      <FileUpload onFileProcessed={handleFileProcessed} />

      {canvas && (
        <Redactor
          sourceCanvas={canvas}
          textItems={textItems}
          onRedacted={handleRedacted}
        />
      )}

      {analyzing && (
        <p className="text-sm text-gray-400 mt-4 text-center">Analyzing with AI...</p>
      )}

      <Preview subscriptions={subscriptions} />
    </>
  )
}
