"use client"
import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleEmailAuth = async (type: 'login' | 'signup') => {
    const { error } = type === 'signup' 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    
    if (error) alert(error.message)
    else alert(type === 'signup' ? 'בדקי את המייל לאישור!' : 'מחוברת!')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-50 text-black p-4">
      <h1 className="text-3xl font-bold">התחברות ל-Rise</h1>
      
      {/* הרשמה באימייל */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <input 
          type="email" placeholder="אימייל" 
          className="border p-3 rounded-lg"
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="סיסמה" 
          className="border p-3 rounded-lg"
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button onClick={() => handleEmailAuth('login')} className="bg-blue-600 text-white p-3 rounded-lg font-bold">התחברי</button>
        <button onClick={() => handleEmailAuth('signup')} className="text-blue-600 text-sm underline">עוד לא רשומה? צרי חשבון</button>
      </div>

      <div className="text-gray-400">או</div>

      {/* התחברות חיצונית */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={() => {/* פונקציית גוגל */}} className="border p-3 rounded-lg bg-white shadow-sm">המשך עם Google</button>
      </div>
    </div>
  )
}