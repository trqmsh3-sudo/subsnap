import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // playwright uses native binaries that must not be bundled for Node.js.
  // pdfjs-dist is excluded from this list because it conflicts with
  // transpilePackages — and pdfjs is only ever imported inside 'use client'
  // components with ssr:false, so it never reaches the server bundle anyway.
  serverExternalPackages: ['playwright'],

  // Force Next.js / SWC to transpile pdfjs-dist from ESM → CJS before
  // webpack sees it.  Without this, webpack encounters pdf.mjs (which
  // has "main": "build/pdf.mjs" but no "type":"module") and can't
  // determine the module format, causing:
  //   TypeError: Object.defineProperty called on non-object
  //       at __webpack_require__.r
  transpilePackages: ['pdfjs-dist'],

  webpack(config, { isServer }) {
    if (!isServer) {
      // Belt-and-suspenders: tell webpack's resolver not to require fully-
      // specified ESM import paths when resolving anything inside pdfjs-dist.
      // This prevents "missing file extension" errors from pdfjs's own
      // internal imports.
      config.module.rules.push({
        test: /node_modules[\\/]pdfjs-dist/,
        resolve: { fullySpecified: false },
      })
    }
    return config
  },
}

export default nextConfig
