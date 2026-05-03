'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  useTheme,
  type ThemeProviderProps,
} from 'next-themes'

function TimeBasedTheme({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const applyTimeTheme = () => {
      // If user manually chose, respect it
      if (localStorage.getItem('theme-manual') === 'true') return
      const hour = new Date().getHours()
      setTheme(hour >= 19 || hour < 6 ? 'dark' : 'light')
    }

    applyTimeTheme()

    // Re-check every minute
    const interval = setInterval(applyTimeTheme, 60_000)
    return () => clearInterval(interval)
  }, [setTheme])

  return <>{children}</>
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <TimeBasedTheme>{children}</TimeBasedTheme>
    </NextThemesProvider>
  )
}
