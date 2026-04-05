// pdfjs-dist uses browser-only APIs (Object.defineProperty on window, canvas, etc.)
// so it must be imported dynamically inside async functions — never at the module top level.

export async function parsePdfToCanvas(
  file: File
): Promise<{ canvas: HTMLCanvasElement; text: string; textItems: any[] }> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const page = await pdf.getPage(1)

  const viewport = page.getViewport({ scale: 2.0 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({ canvas, viewport }).promise

  const textContent = await page.getTextContent()
  const textItems = textContent.items.filter((item: any) => 'str' in item)
  const text = textItems.map((item: any) => item.str).join(' ')

  return { canvas, text, textItems }
}

export async function imageFileToCanvas(
  file: File
): Promise<{ canvas: HTMLCanvasElement; text: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      resolve({ canvas, text: '' })
    }
    img.src = url
  })
}
