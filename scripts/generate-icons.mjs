import { chromium } from 'playwright'
import path from 'path'

async function generateIcons() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  const svgHtml = (size) => `
    <html>
      <body style="margin:0; padding:0; background:transparent; display:flex; align-items:center; justify-content:center; width:${size}px; height:${size}px;">
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="24" fill="#0f172a"/>
          <path d="M55 15L25 55H48L42 85L75 45H52L55 15Z" fill="#44E2CD"/>
        </svg>
      </body>
    </html>
  `

  for (const size of [16, 48, 128]) {
    await page.setViewportSize({ width: size, height: size })
    await page.setContent(svgHtml(size))
    const iconPath = path.resolve('extension', 'icons', `icon${size}.png`)
    await page.screenshot({ path: iconPath, omitBackground: true })
    console.log(`Generated icon: ${iconPath}`)
  }

  await browser.close()
}

generateIcons()
