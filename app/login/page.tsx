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
        style={{ backgroundImage: "url('/nattanan23-clock-2696234_1920.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/65 backdrop-blur-[3px]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="neu-flat rounded-[2rem] bg-background p-8">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Chik<span className="text-primary"> Time</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignUp ? '��� ����� ��� ��� ������' : '������ ����� ��� ����� �����'}
            </p>
          </div>

          <div className="space-y-3">

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              className="neu-flat flex w-full items-center justify-center gap-3 rounded-[16px] bg-background py-4 text-sm font-semibold text-foreground transition-all hover:scale-[1.02] active:neu-pressed active:scale-[0.98]"
            >
              <Chrome className="h-4 w-4" />
              ���� �� Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">�� ������� ������</span>
              <div className="h-px flex-1 bg-border" />
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
                    placeholder="�� ���"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
              )}

              <div className="neu-pressed flex items-center gap-3 rounded-[16px] bg-background px-4 py-3">
                <Mail className="h-4 w-4 shrink-0 text-primary/60" />
                <input
                  type="email"
                  required
                  placeholder="������"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="neu-pressed flex items-center gap-3 rounded-[16px] bg-background px-4 py-3">
                <Lock className="h-4 w-4 shrink-0 text-primary/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="�����"
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

              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-primary py-4 text-sm font-bold text-white shadow-[0_8px_30px_rgba(111,163,199,0.4)] transition-all hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(111,163,199,0.55)] active:scale-[0.97] disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? '��� �����' : '����� ������'}</span>
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
                ? <span>��� �� �� �����? <span className="text-primary font-semibold underline underline-offset-2">������ ���</span></span>
                : <span>��� �� �����? <span className="text-primary font-semibold underline underline-offset-2">��� ����� ���</span></span>
              }
            </button>

          </div>
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-muted-foreground/40">
          Chik Time � 2026
        </p>
      </div>

    </div>
  )
}
