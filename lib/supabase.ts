import { createBrowserClient } from '@supabase/ssr'

// פונקציה שיוצרת חיבור יחיד לכל האפליקציה
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)