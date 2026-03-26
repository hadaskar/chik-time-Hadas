import type { Metadata, Viewport } from 'next'
import { DM_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'
import { RoutineProvider } from '../lib/routine-store' // ייבוא ה-provider
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { BrandLogo } from '@/components/brand-logo'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChikTime - Plan your time, in a Chik',
  description:
    'Plan your time in a Chik. Build, track, and master your routines with ease.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#F0EDE8',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <RoutineProvider>
            <div className="flex min-h-screen flex-col">
              <div className="flex-1">
                {children}
              </div>
              <footer className="w-full py-5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 select-none">
                  Chik Time @ 2026
                </p>
              </footer>
            </div>
            <BrandLogo />
            <ThemeToggle />
          </RoutineProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
