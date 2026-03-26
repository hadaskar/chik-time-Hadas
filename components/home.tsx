"use client"
import React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function Home() {
  const router = useRouter()

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/nattanan23-clock-2696234_1920.jpg')" }}
      />

      {/* Light overlay */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-6 text-center">

        {/* Eyebrow */}
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary/70">
          your morning, your rules
        </p>

        {/* Main title */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-[clamp(3.5rem,12vw,7rem)] font-black leading-none tracking-tight text-foreground">
            Chik<span className="text-primary"> Time</span>
          </h1>
          <p className="max-w-xs text-base text-muted-foreground leading-relaxed">
            נהל את הזמן שלך בצורה חכמה — צעד אחר צעד, בקצב שלך
          </p>
        </div>

        {/* Divider pill */}
        <div className="h-px w-16 rounded-full bg-primary/30" />

        {/* CTA button */}
        <button
          onClick={() => router.push("/login")}
          className="group flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-bold text-white shadow-[0_8px_30px_rgba(111,163,199,0.45)] transition-all hover:scale-[1.04] hover:shadow-[0_12px_40px_rgba(111,163,199,0.6)] active:scale-[0.97]"
        >
          <span>בואי נתחיל</span>
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </button>

        {/* Small print */}
        <p className="text-xs text-muted-foreground/60">
          חינמי לחלוטין · ללא כרטיס אשראי
        </p>

      </div>

      {/* Decorative bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/40 to-transparent" />

    </div>
  )
}
