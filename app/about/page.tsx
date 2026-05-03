"use client"
import React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Clock, Target, Bell, ArrowLeft, Zap } from "lucide-react"

const LIGHT: React.CSSProperties = {
  colorScheme: "light",
  "--background": "#F0EDE8",
  "--foreground": "#2D3436",
  "--muted-foreground": "#636e72",
  "--primary": "#6FA3C7",
} as React.CSSProperties

const features = [
  {
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-50",
    title: "טיימר חכם",
    desc: "טיימר מובנה שמלווה אותך משימה אחר משימה בזמן אמת",
  },
  {
    icon: Target,
    color: "text-violet-500",
    bg: "bg-violet-50",
    title: "לוז מסודר",
    desc: "בנה שגרה יומית עם משימות מותאמות אישית ומשכי זמן מדויקים",
  },
  {
    icon: Bell,
    color: "text-rose-500",
    bg: "bg-rose-50",
    title: "תזכורות",
    desc: "קבל התראות בזמן הנכון כדי לא לפספס אף משימה",
  },
  {
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-50",
    title: "יעילות מקסימלית",
    desc: "מתמקד רק במה שחשוב — פחות בלאגן, יותר תוצאות",
  },
]

export default function AboutPage() {
  const router = useRouter()

  return (
    <div
      style={{ ...LIGHT, background: "#F0EDE8", color: "#2D3436" }}
      className="min-h-screen font-sans"
    >
      {/* ── Hero ── */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        {/* background image — right half */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/pexels-talal-5818517.jpg"
            alt="hourglass"
            fill
            priority
            className="object-cover object-center"
            style={{ filter: "brightness(0.92) saturate(1.1)" }}
          />
          {/* gradient overlay: left = solid bg, right = transparent */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, #F0EDE8 38%, rgba(240,237,232,0.82) 58%, rgba(240,237,232,0.12) 100%)",
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-8 py-20 md:px-16">
          <p
            className="mb-3 text-[11px] font-bold uppercase tracking-[0.45em]"
            style={{ color: "#6FA3C7" }}
          >
            time is everything
          </p>

          <h1
            className="mb-5 font-black leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", color: "#2D3436" }}
          >
            Chik<span style={{ color: "#6FA3C7" }}> Time</span>
          </h1>

          {/* "TIME IS MANY" quote block */}
          <div
            className="mb-8 rounded-2xl px-7 py-5 max-w-sm"
            style={{
              background: "rgba(111,163,199,0.12)",
              borderLeft: "4px solid #6FA3C7",
            }}
          >
            <p
              className="text-[13px] font-bold uppercase tracking-widest mb-1"
              style={{ color: "#6FA3C7" }}
            >
              "TIME IS MANY"
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#636e72" }}>
              הזמן הוא המשאב היחיד שלא ניתן להחזיר.
              <br />
              השאלה היא לא כמה הזמן שיש לך — אלא מה אתה עושה איתו.
            </p>
          </div>

          <p
            className="mb-10 text-base leading-relaxed max-w-xs"
            style={{ color: "#4a5568" }}
          >
            Chik Time נועדה לעזור לך למקד את הזמן שלך במה שבאמת חשוב — פחות עומס, יותר שקט נפשי.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/login")}
              className="rounded-full px-8 py-3.5 text-[13px] font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #6FA3C7 0%, #4a7fa8 100%)",
                boxShadow: "0 8px 28px rgba(111,163,199,0.45)",
              }}
            >
              מתחילים עכשיו ←
            </button>
            <button
              onClick={() => router.push("/")}
              className="rounded-full border px-8 py-3.5 text-[13px] font-semibold transition-all hover:scale-[1.02]"
              style={{
                borderColor: "rgba(111,163,199,0.4)",
                color: "#6FA3C7",
                background: "rgba(111,163,199,0.07)",
              }}
            >
              לדף הבית
            </button>
          </div>
        </div>
      </section>

      {/* ── Mission statement ── */}
      <section
        className="py-20 px-8 text-center"
        style={{ background: "rgba(111,163,199,0.08)" }}
      >
        <div className="mx-auto max-w-2xl">
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-4"
            style={{ color: "#6FA3C7" }}
          >
            המשימה שלנו
          </p>
          <h2
            className="text-3xl font-black leading-snug mb-5"
            style={{ color: "#2D3436" }}
          >
            למקד אתכם. להייעיל אתכם.
            <span style={{ color: "#6FA3C7" }}> לשחרר אתכם.</span>
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{ color: "#636e72" }}
          >
            אנחנו מאמינים שכשיש מסגרת ברורה — הכל זורם. Chik Time נותנת לך לוז חכם, טיימר שמלווה אותך צעד אחר צעד, ותזכורות שמוודאות שלא תפספס כלום. התוצאה? מיקוד אמיתי, יותר זמן פנוי, ותחושת הישג בכל יום.
          </p>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="py-20 px-8">
        <div className="mx-auto max-w-4xl">
          <p
            className="text-center text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: "#6FA3C7" }}
          >
            מה תקבלו
          </p>
          <h2
            className="text-center text-3xl font-black mb-12"
            style={{ color: "#2D3436" }}
          >
            כלים שמשנים שגרה
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, color, bg, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-6 transition-all hover:scale-[1.02]"
                style={{
                  background: "#F0EDE8",
                  boxShadow:
                    "8px 8px 18px rgba(0,0,0,0.07), -4px -4px 12px rgba(255,255,255,0.85)",
                }}
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}
                >
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3
                  className="mb-2 text-base font-bold"
                  style={{ color: "#2D3436" }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#636e72" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote closer ── */}
      <section className="py-24 px-8 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #6FA3C7 0, #6FA3C7 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative mx-auto max-w-xl">
          <p
            className="mb-3 text-[50px] font-black leading-none"
            style={{ color: "rgba(111,163,199,0.18)" }}
          >
            ❝
          </p>
          <p
            className="text-2xl font-black leading-snug mb-4"
            style={{ color: "#2D3436" }}
          >
            הזמן שלך שווה הכל.
          </p>
          <p className="text-sm leading-relaxed mb-9" style={{ color: "#636e72" }}>
            אל תנהל את הפרויקטים שלך — תן להם מקום לצמוח.
            <br />
            Chik Time כאן כדי לנהל את הזמן, בשבילך.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="rounded-full px-10 py-4 text-[13px] font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 60%, #a855f7 100%)",
              boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
            }}
          >
            צור חשבון חינמי — בצ׳יק!
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <div
        className="py-6 text-center text-[10px] uppercase tracking-widest"
        style={{ color: "rgba(111,163,199,0.5)", borderTop: "1px solid rgba(111,163,199,0.15)" }}
      >
        Chik Time © 2026
      </div>
    </div>
  )
}
