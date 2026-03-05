'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'

export default function LoginPage() {
  // יוצרים את הלקוח של סופאבייס
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (provider: 'github' | 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800">התחברות למערכת</h1>
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => handleLogin('github')}
          className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all"
        >
          המשך עם GitHub
        </button>
        <button 
          onClick={() => handleLogin('google')}
          className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
        >
          המשך עם Google
        </button>
      </div>
    </div>
  )
}