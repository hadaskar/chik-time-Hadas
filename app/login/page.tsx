"use client"

import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Chrome, Mail, Lock, ArrowLeft, Loader2, Eye, EyeOff, User } from 'lucide-react'

export default function LoginPage() {
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleGoogleLogin = async () => {
    setErrorMsg(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setErrorMsg(error.message)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setErrorMsg('הכניסי את כתובת האימייל'); return }
    setLoading(true)
    setErrorMsg(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setLoading(false)
    if (error) {
      setErrorMsg(error.message)
    } else {
      setResetSent(true)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const { error } = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: fullName },
          },
        })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/‏‏istockphoto-1353518626-612x612 - עותק.jpg')",
          filter: "contrast(1.05) saturate(1.05) brightness(1.25)",
        }}
      />
      <div className="absolute inset-0" style={{ background: "rgba(240,237,232,0.18)" }} />
      <div className="absolute inset-0 backdrop-blur-[8px]" />

      {/* Card — always light */}
      <div className="relative z-10 w-full max-w-sm">
        <div
          className="rounded-[2rem] p-8"
          style={{
            background: "rgba(245,243,240,0.92)",
            backdropFilter: "blur(20px) saturate(1.6)",
            WebkitBackdropFilter: "blur(20px) saturate(1.6)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.6), 0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08)",
            colorScheme: "light",
            "--background": "#F0EDE8",
            "--foreground": "#1a2330",
            "--muted-foreground": "#6b7280",
            "--border": "#e2dfd9",
            "--primary": "#5b93b8",
            "--primary-foreground": "#ffffff",
            "--destructive": "#e17055",
            "--neu-shadow-light": "#ffffff",
            "--neu-shadow-dark": "#d1cec9",
          } as React.CSSProperties}
        >

          {/* Header */}
          <div className="mb-7 text-center">
            <h1 className="text-[2rem] font-black tracking-tight" style={{ color: "#1a2330" }}>
              Chik<span style={{ color: "#5b93b8" }}> Time</span>
            </h1>
            <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "#6b7280" }}>
              {forgotMode ? 'נשלח לך קישור לאיפוס הסיסמה' : isSignUp ? 'צור חשבון חינמי ותתחיל לנהל את הזמן שלך' : 'ברוך הבא — התחבר לחשבון שלך'}
            </p>
          </div>

          <div className="space-y-3">

            {forgotMode ? (
              /* Forgot password form */
              resetSent ? (
                <div className="text-center py-4">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">נשלח בהצלחה!</p>
                  <p className="text-xs text-muted-foreground mb-6">בדוק את תיבת המייל שלך — שלחנו קישור לאיפוס הסיסמה<br/><span style={{color:"#9ca3af"}}>לא רואה? בדוק בתיקיית הספאם</span></p>
                  <button
                    onClick={() => { setForgotMode(false); setResetSent(false); setErrorMsg(null) }}
                    className="text-xs text-primary font-semibold underline underline-offset-2"
                  >
                    חזרה להתחברות
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  {errorMsg && (
                    <div className="rounded-[14px] bg-destructive/10 px-4 py-3 text-center text-xs text-destructive">
                      {errorMsg}
                    </div>
                  )}
                  <div className="neu-pressed flex items-center gap-3 rounded-[16px] bg-background px-4 py-3">
                    <Mail className="h-4 w-4 shrink-0 text-primary/60" />
                    <input
                      type="email"
                      required
                      placeholder="הקלד אמייל"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-[#2D3436] outline-none placeholder:text-[#636e72]/60"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex w-full items-center justify-center gap-3 rounded-full py-3.5 text-[13px] font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-70"
                    style={{ background: "linear-gradient(135deg, #5b93b8 0%, #3d7499 100%)", boxShadow: "0 6px 24px rgba(91,147,184,0.45)" }}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'שלח קישור לאיפוס'}
                  </button>
                  <p className="text-center text-[11px]" style={{ color: "#9ca3af" }}>
                    המייל עלול להגיע לתיקיית הספאם
                  </p>
                  <button
                    type="button"
                    onClick={() => { setForgotMode(false); setErrorMsg(null) }}
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    חזרה להתחברות
                  </button>
                </form>
              )
            ) : (<>

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              className="neu-flat flex w-full items-center justify-center gap-3 rounded-[14px] bg-background py-3.5 text-[13px] font-semibold text-foreground transition-all hover:scale-[1.02] active:neu-pressed active:scale-[0.98]"
            >
              <Chrome className="h-[18px] w-[18px]" />
                Google המשך עם 
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 py-0.5">
              <div className="h-px flex-1" style={{ background: "rgba(0,0,0,0.08)" }} />
              <span className="text-[10px] font-medium tracking-widest" style={{ color: "#9ca3af" }}>או באמצעות אימייל</span>
              <div className="h-px flex-1" style={{ background: "rgba(0,0,0,0.08)" }} />
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="rounded-[14px] bg-destructive/10 px-4 py-3 text-center text-xs text-destructive">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">

              {isSignUp && (
                <div className="neu-pressed flex items-center gap-3 rounded-[16px] bg-background px-4 py-3">
                  <User className="h-4 w-4 shrink-0 text-primary/60" />
                  <input
                    type="text"
                    required={isSignUp}
                    placeholder="שם מלא"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-[#2D3436] outline-none placeholder:text-[#636e72]/60"
                  />
                </div>
              )}

              <div className="neu-pressed flex items-center gap-3 rounded-[16px] bg-background px-4 py-3">
                <Mail className="h-4 w-4 shrink-0 text-primary/60" />
                <input
                  type="email"
                  required
                  placeholder="הקלד אמייל"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[#2D3436] outline-none placeholder:text-[#636e72]/60"
                />
              </div>

              <div className="neu-pressed flex items-center gap-3 rounded-[16px] bg-background px-4 py-3">
                <Lock className="h-4 w-4 shrink-0 text-primary/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[#2D3436] outline-none placeholder:text-[#636e72]/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground/50 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => { setForgotMode(true); setErrorMsg(null) }}
                  className="w-full text-left text-[11px] text-muted-foreground/60 hover:text-primary transition-colors px-1"
                >
                  שכחתי סיסמה
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full items-center justify-center gap-3 rounded-full py-3.5 text-[13px] font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #5b93b8 0%, #3d7499 100%)", boxShadow: "0 6px 24px rgba(91,147,184,0.45)" }}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? 'צור חשבון' : 'כניסה למערכת'}</span>
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle */}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null) }}
              className="w-full pt-1 text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp
                ? <span>רשומים?  <span className="text-primary font-semibold underline underline-offset-2"> התחבר כאן</span></span>
                : <span> עדיין לא רשומים? <span className="text-primary font-semibold underline underline-offset-2">  בוא נרשם!</span></span>
              }
            </button>

            </>)}
          </div>
        </div>

        <p className="mt-5 text-center text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.55)", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
          Chik Time © 2026
        </p>
      </div>

    </div>
  )
}
