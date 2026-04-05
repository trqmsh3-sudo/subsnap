import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs-dist uses browser-only APIs and must not be bundled for the Node.js server
  serverExternalPackages: ['pdfjs-dist', 'playwright'],
};

export default nextConfig;
