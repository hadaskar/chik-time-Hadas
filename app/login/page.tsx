"use client"
import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import { useRouter } from 'next/navigation' // 1. ייבוא הראוטר

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter() // 2. הגדרת הראוטר בתוך הקומפוננטה

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    const { error } = type === 'signup' 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      alert(error.message)
    } else {
      if (type === 'signup') {
        alert('חשבון נוצר! כעת את יכולה להתחבר.')
      } else {
        // 3. כאן קורה השינוי - העברה לדף הבית
        router.push('/') 
        router.refresh() // מרענן את הנתונים כדי שהאפליקציה תדע שאת מחוברת
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-50 text-black p-4">
      <h1 className="text-3xl font-bold">התחברות ל-Rise</h1>
      
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <input 
          type="email" placeholder="אימייל" 
          className="border p-3 rounded-lg"
          value={email} // הוספתי value כדי שיהיה נקי
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="סיסמה" 
          className="border p-3 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button onClick={() => handleEmailAuth('login')} className="bg-blue-600 text-white p-3 rounded-lg font-bold">
          התחברי
        </button>
        <button onClick={() => handleEmailAuth('signup')} className="text-blue-600 text-sm underline">
          עוד לא רשומה? צרי חשבון
        </button>
      </div>

      <div className="text-gray-400">או</div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button className="border p-3 rounded-lg bg-white shadow-sm">המשך עם Google</button>
      </div>
    </div>
  )
}