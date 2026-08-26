import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SubSnap | הכסף שלך חוזר אליך — ביטול מנויים בלחיצה אחת',
  description:
    'המערכת החכמה לאיתור וביטול מנויים וחיובים מיותרים בלחיצה אחת, בחינם ובפרטיות מלאה.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-[#f8fafc] text-[#0f172a]">
        {children}
      </body>
    </html>
  )
}
