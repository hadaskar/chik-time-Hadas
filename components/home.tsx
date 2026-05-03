"use client"
import React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

const LIGHT: React.CSSProperties = {
  colorScheme: "light",
  "--background": "#F0EDE8",
  "--foreground": "#2D3436",
  "--muted-foreground": "#636e72",
  "--border": "#dbd8d3",
  "--primary": "#6FA3C7",
} as React.CSSProperties

export default function Home() {
  const router = useRouter()

  return (
    <div style={LIGHT} className="relative flex min-h-screen w-full flex-col overflow-hidden">

      {/* Background image — laptop photo, sharper */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/‏‏istockphoto-1353518626-612x612 - עותק.jpg')",
          filter: "contrast(1.08) saturate(0.9) brightness(0.97) sepia(0.12) blur(2.5px)",
        }}
      />

      {/* Subtle overlay — keep laptop clearly visible */}
      <div className="absolute inset-0" style={{ background: "rgba(80,50,30,0.22)" }} />

      {/* ── Title row — floats above the laptop ── */}
      <div className="relative z-10 flex flex-col items-center pt-10 pb-2 text-center">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.4em]"
          style={{ color: "#6FA3C7", textShadow: "0 1px 6px rgba(255,255,255,0.9)" }}
        >
          your morning, your rules
        </p>
        <h1
          className="mt-2 font-black leading-none tracking-tight"
          style={{
            fontSize: "clamp(3.2rem, 11vw, 6.5rem)",
            color: "#2D3436",
            textShadow: "0 2px 16px rgba(255,255,255,0.75)",
          }}
        >
          Chik<span style={{ color: "#6FA3C7" }}> Time</span>
        </h1>
      </div>

      {/* ── Screen card — positioned over the laptop display ── */}
      <div className="relative z-10 flex flex-1 items-center justify-center" style={{ marginTop: "5rem", paddingBottom: "6vh" }}>
        <div
          className="flex flex-col items-center gap-5 px-9 py-7 text-center"
          style={{ maxWidth: "320px", width: "90%" }}
        >
          {/* App icon — light, blends with laptop screen */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 2px 14px rgba(111,163,199,0.25), 0 0 0 1px rgba(111,163,199,0.18)",
            }}
          >
            <Image
              src="/icon.svg"
              alt="Chik Time"
              width={36}
              height={36}
              style={{ filter: "invert(57%) sepia(40%) saturate(500%) hue-rotate(175deg) brightness(0.9)" }}
            />
          </div>

          {/* App name + tagline */}
          <div className="flex flex-col gap-1">
            <p className="text-base font-extrabold tracking-tight" style={{ color: "#2D3436", textShadow: "0 1px 8px rgba(255,255,255,0.7)" }}>
              Chik Time
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#4a5568", textShadow: "0 1px 6px rgba(255,255,255,0.6)" }}>
              נהל את הזמן שלך בצורה חכמה
              <br />
              צעד אחר צעד, בקצב שלך
            </p>
          </div>

          {/* Divider */}
          <div className="h-px w-12 rounded-full" style={{ background: "rgba(111,163,199,0.35)" }} />

          {/* CTA button */}
          <button
            onClick={() => router.push("/login")}
            className="group flex w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-white transition-all hover:scale-[1.04] active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #6FA3C7 0%, #4a7fa8 100%)",
              padding: "13px 28px",
              boxShadow: "0 6px 24px rgba(111,163,199,0.5)",
            }}
          >
            <span>בוא נתחיל</span>
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </button>

          <p className="text-[11px]" style={{ color: "rgba(99,110,114,0.65)" }}>
            חינמי לחלוטין · ללא כרטיס אשראי
          </p>
        </div>
      </div>

    </div>
  )
}
