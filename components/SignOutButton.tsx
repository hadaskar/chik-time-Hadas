"use client"
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // ניקוי הקאש והעברה לעמוד התחברות
    router.refresh()
    router.push('/login')
  }

  return (
    <button 
      onClick={handleSignOut}
      className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-2 px-4 rounded-full border border-border hover:bg-secondary"
    >
      התנתקות
    </button>
  )
}