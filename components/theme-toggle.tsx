"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  if (pathname === "/" || pathname === "/login") return null

  const isDark = theme === "dark"

  const handleToggle = () => {
    localStorage.setItem('theme-manual', 'true')
    setTheme(isDark ? "light" : "dark")
  }

  const handleAutoMode = () => {
    localStorage.removeItem('theme-manual')
    const hour = new Date().getHours()
    setTheme(hour >= 19 || hour < 6 ? 'dark' : 'light')
  }

  const isManual = typeof window !== 'undefined' && localStorage.getItem('theme-manual') === 'true'

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col items-center gap-2">
    {isManual && (
      <button
        onClick={handleAutoMode}
        aria-label="Switch to auto mode"
        className="neu-flat flex h-8 w-8 items-center justify-center rounded-full bg-background text-[10px] font-bold text-muted-foreground transition-all hover:scale-[1.08] hover:text-primary active:neu-pressed active:scale-[0.95]"
        title="חזור למצב אוטומטי"
      >
        A
      </button>
    )}
    <button
      onClick={handleToggle}
      aria-label="Toggle dark mode"
      className="fixed bottom-5 left-5 z-50 neu-flat flex h-12 w-12 items-center justify-center rounded-full bg-background text-muted-foreground transition-all hover:scale-[1.08] hover:text-primary active:neu-pressed active:scale-[0.95]"
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
    </div>
  )
}
