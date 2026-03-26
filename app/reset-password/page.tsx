"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Lock, Eye, EyeOff, Loader2, Check } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Supabase will auto-detect the recovery token from the URL hash
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User arrived via recovery link — ready to set new password
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setErrorMsg("סיסמה חייבת להכיל לפחות 6 תווים")
      return
    }
    if (password !== confirm) {
      setErrorMsg("הסיסמאות לא תואמות")
      return
    }

    setLoading(true)
    setErrorMsg(null)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push("/dashboard"), 2000)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/nattanan23-clock-2696234_1920.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/65 backdrop-blur-[3px]" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="neu-flat rounded-[2rem] bg-background p-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Chik<span className="text-primary"> Time</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {success ? "הסיסמה עודכנה בהצלחה!" : "הגדר סיסמה חדשה"}
            </p>
          </div>

          {success ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground">מעביר לדשבורד...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-3">
              {errorMsg && (
                <div className="rounded-[14px] bg-destructive/10 px-4 py-3 text-center text-xs text-destructive">
                  {errorMsg}
                </div>
              )}

              <div className="neu-pressed flex items-center gap-3 rounded-[16px] bg-background px-4 py-3">
                <Lock className="h-4 w-4 shrink-0 text-primary/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="סיסמה חדשה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground/50 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="neu-pressed flex items-center gap-3 rounded-[16px] bg-background px-4 py-3">
                <Lock className="h-4 w-4 shrink-0 text-primary/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="אימות סיסמה"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-primary py-4 text-sm font-bold text-white shadow-[0_8px_30px_rgba(111,163,199,0.4)] transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "עדכון סיסמה"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-muted-foreground/40">
          Chik Time @ 2026
        </p>
      </div>
    </div>
  )
}
