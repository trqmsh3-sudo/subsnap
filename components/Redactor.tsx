'use client'

import { useEffect, useRef } from 'react'
import { redactCanvas, canvasToBase64 } from '@/lib/redact'

interface RedactorProps {
  sourceCanvas: HTMLCanvasElement
  textItems: any[]
  onRedacted: (base64: string) => void
}

export default function Redactor({ sourceCanvas, textItems, onRedacted }: RedactorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const redacted = redactCanvas(sourceCanvas, textItems)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && canvasRef.current) {
      canvasRef.current.width = redacted.width
      canvasRef.current.height = redacted.height
      ctx.drawImage(redacted, 0, 0)
      onRedacted(canvasToBase64(redacted))
    }
  }, [sourceCanvas, textItems, onRedacted])

  return (
    <div className="mt-4">
      <p className="text-xs text-gray-400 mb-2">
        Sensitive data has been masked — this is what gets sent for analysis
      </p>
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border border-gray-200 shadow-sm"
      />
    </div>
  )
}
