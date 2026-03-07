"use client"

import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Chrome, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setErrorMsg(error.message)
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const { data, error } = isSignUp 
      ? await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        })
      : await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      // מכיוון שביטלת אישור אימייל, המשתמש נכנס מיד
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* אלמנטים עיצוביים ברקע */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-md z-10 transition-all duration-500">
        <div className="bg-card border border-border/50 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-8 md:p-12">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black tracking-tighter text-foreground mb-3 italic drop-shadow-sm">RISE</h1>
            <p className="text-muted-foreground text-sm font-medium">
              {isSignUp ? 'צרי חשבון חדש כדי להתחיל' : 'המלווה האישי שלך לבוקר מוצלח'}
            </p>
          </div>

          <div className="space-y-6">
            {/* Google Login Button */}
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-14 rounded-2xl font-bold transition-all active:scale-95 border border-border group"
            >
              <Chrome className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              המשך עם Google
            </button>

            <div className="relative text-center">
              <span className="bg-card px-4 text-[10px] text-muted-foreground uppercase tracking-[0.2em] relative z-10">או באמצעות אימייל</span>
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border/60" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {errorMsg && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs py-3 px-4 rounded-xl text-center font-medium animate-in fade-in slide-in-from-top-1">
                  {errorMsg}
                </div>
              )}

              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="אימייל" 
                  className="w-full h-14 bg-muted/40 border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-2xl pl-14 pr-5 transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  required
                  placeholder="סיסמה" 
                  className="w-full h-14 bg-muted/40 border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-2xl pl-14 pr-5 transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'צרי חשבון' : 'כניסה למערכת'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Login/Signup */}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp)
                setErrorMsg(null)
              }}
              className="w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {isSignUp ? (
                <>כבר יש לך חשבון? <span className="text-primary underline underline-offset-4">התחברי כאן</span></>
              ) : (
                <>עוד לא רשומה? <span className="text-primary underline underline-offset-4">צרי חשבון חדש</span></>
              )}
            </button>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] text-muted-foreground/40 uppercase tracking-widest font-medium">
          RISE © 2026 • Morning Mastery
        </p>
      </div>
    </div>
  )
}