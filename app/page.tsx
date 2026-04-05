// Server component — no 'use client'.
// Renders AppShell which is a Client Component that lazily loads
// FileUpload and Redactor (both depend on pdfjs-dist) with ssr: false.

import AppShell from '@/components/AppShell'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">SubSnap</h1>
        <p className="text-gray-400 mb-8 text-sm">Snap your statement. Slash your subs.</p>
        <AppShell />
      </div>
    </main>
  )
}
