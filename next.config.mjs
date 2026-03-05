// /** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // הוספת ההגדרה הזו תעזור לנטפרי לא לחסום את הורדת הפונטים והחיבורים המאובטחים
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
}

export default nextConfig