"use client"

import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Chrome, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [fullName, setFullName] = useState('') // שדה חדש לשם המלא
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

  // הוספנו את ה-data בתוך ה-options במקרה של הרשמה
  const { data, error } = isSignUp 
    ? await supabase.auth.signUp({ 
        email, 
        password,
        options: { 
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { 
            full_name: fullName // זה השדה שישמור את השם בשרת!
          } 
        }
      })
    : await supabase.auth.signInWithPassword({ email, password })
  
  if (error) {
    setErrorMsg(error.message)
    setLoading(false)
  } else {
    // מעבר לדף הבית - הכל עבר בהצלחה
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

  {/* שדה שם מלא - יופיע רק אם המשתמש במצב הרשמה */}
  {isSignUp && (
    <div className="relative group animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <input 
        type="text" 
        required={isSignUp}
        placeholder="שם מלא" 
        className="w-full h-14 bg-muted/40 border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-2xl pl-14 pr-5 transition-all outline-none text-lg"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)} 
      />
    </div>
  )}

  {/* שדה אימייל */}
  <div className="relative group">
    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
    <input 
      type="email" 
      required
      placeholder="אימייל" 
      className="w-full h-14 bg-muted/40 border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-2xl pl-14 pr-5 transition-all outline-none text-lg"
      value={email}
      onChange={(e) => setEmail(e.target.value)} 
    />
  </div>
{/* שדה סיסמה */}
<div className="relative group">
  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
  
  <input 
    type={showPassword ? "text" : "password"} 
    required
    placeholder="סיסמה" 
    className="w-full h-14 bg-muted/40 border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-2xl pl-14 pr-14 transition-all outline-none text-lg"
    value={password}
    onChange={(e) => setPassword(e.target.value)} 
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
  >
    {showPassword ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
    )}
  </button>
</div>

  {/* כפתור כניסה/הרשמה הגדול */}
  <button 
    type="submit"
    disabled={loading}
    className="w-full h-16 bg-primary text-primary-foreground rounded-2xl font-black text-2xl hover:opacity-90 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-4 disabled:opacity-70 mt-4"
  >
    {loading ? (
      <Loader2 className="w-7 h-7 animate-spin" />
    ) : (
      <>
        <span className="tracking-tight">
          {isSignUp ? 'צור חשבון' : 'כניסה למערכת'}
        </span>
        <ArrowRight className="w-7 h-7 stroke-[2.5px]" /> 
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
                <>כבר יש לך חשבון? <span className="text-primary underline underline-offset-4">התחבר כאן</span></>
              ) : (
                <>עוד לא רשום? <span className="text-primary underline underline-offset-4">צור חשבון חדש</span></>
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