import { findSensitiveText } from './patterns'

export function redactCanvas(
  sourceCanvas: HTMLCanvasElement,
  textItems: Array<{ str: string; transform: number[] }>
): HTMLCanvasElement {
  const output = document.createElement('canvas')
  output.width = sourceCanvas.width
  output.height = sourceCanvas.height

  const ctx = output.getContext('2d')!
  ctx.drawImage(sourceCanvas, 0, 0)

  const fullText = textItems.map((i) => i.str).join(' ')
  const sensitive = findSensitiveText(fullText)

  // For each sensitive match, find and paint over the bounding box
  ctx.fillStyle = '#000000'
  for (const item of textItems) {
    const isSensitive = sensitive.some((s) =>
      item.str.includes(s.match.trim())
    )
    if (isSensitive) {
      const [a, b, c, d, e, f] = item.transform
      const x = e
      const y = output.height - f
      const w = item.str.length * a * 0.6
      const h = Math.abs(a) * 1.2
      ctx.fillRect(x, y - h, w, h)
    }
  }

  return output
}

export function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png').split(',')[1]
}
