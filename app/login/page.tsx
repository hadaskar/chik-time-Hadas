"use client"
import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Chrome } from 'lucide-react' // ודאי שהתקנת lucide-react

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // התחברות עם גוגל
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) alert(error.message)
  }

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    setLoading(true)
    const { error } = type === 'signup' 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* אלמנטים עיצוביים ברקע */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="bg-card border border-border/50 backdrop-blur-xl shadow-2xl rounded-[2rem] p-8 md:p-12 transition-all">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-tight text-foreground mb-2 italic">RISE</h1>
            <p className="text-muted-foreground text-sm font-medium">המלווה האישי שלך לבוקר מוצלח</p>
          </div>

          <div className="space-y-4">
            {/* Google Login Button */}
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-14 rounded-2xl font-bold transition-all active:scale-95 border border-border"
            >
              <Chrome className="w-5 h-5" />
              המשך עם Google
            </button>

            <div className="relative my-8 text-center">
              <span className="bg-card px-4 text-xs text-muted-foreground uppercase tracking-widest relative z-10">או באמצעות אימייל</span>
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border" />
            </div>

            {/* Email Inputs */}
            <div className="space-y-3">
              <input 
                type="email" 
                placeholder="אימייל" 
                className="w-full h-14 bg-muted/50 border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-2xl px-5 transition-all outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
              />
              <input 
                type="password" 
                placeholder="סיסמה" 
                className="w-full h-14 bg-muted/50 border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-2xl px-5 transition-all outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <button 
                onClick={() => handleEmailAuth('login')} 
                disabled={loading}
                className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'מתחבר...' : 'כניסה למערכת'}
              </button>
              
              <button 
                onClick={() => handleEmailAuth('signup')}
                className="w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                עוד לא רשומה? <span className="text-primary underline underline-offset-4">צרי חשבון חדש</span>
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-xs text-muted-foreground/60">
          © 2026 RISE. All rights reserved.
        </p>
      </div>
    </div>
  )
}