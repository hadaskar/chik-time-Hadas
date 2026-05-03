"use client"

import { ClockCheck } from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function BrandLogo() {
  const { theme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  // On pages with background images, always use light style
  const forceLight = pathname === "/" || pathname === "/login" || pathname === "/about"
  const isDark = !forceLight && theme === "dark"

  return (
    <div
      className="fixed top-6 right-6 z-50 flex items-center gap-4 select-none cursor-pointer"
      onClick={() => router.push("/about")}
    >
      <div className="flex flex-col items-end gap-1">
        <span
          className="text-[15px] font-black uppercase tracking-[0.28em]"
          style={{ color: isDark ? "rgba(111,163,199,1)" : "rgba(60,110,150,1)" }}
        >
          Chik Time
        </span>
        <span
          className="text-[12px] font-semibold tracking-wide"
          style={{ color: isDark ? "rgba(111,163,199,0.75)" : "rgba(60,110,150,0.85)" }}
        >
          ניהול זמן בצ׳יק
        </span>
      </div>
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: isDark ? "#1C2128" : "#F0EDE8",
          boxShadow: isDark
            ? "6px 6px 12px #141A1F, -6px -6px 12px #242C33"
            : "8px 8px 16px #d1cec9, -8px -8px 16px #ffffff",
        }}
      >
        <ClockCheck
          className="h-[26px] w-[26px]"
          strokeWidth={1.5}
          style={{ color: isDark ? "rgba(111,163,199,0.9)" : "rgba(60,110,150,1)" }}
        />
      </div>
    </div>
  )
}
