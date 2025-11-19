// lib/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr'

// Create a SINGLE instance that gets reused
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) {
    return client
  }

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )

  // Make it globally accessible for debugging
  if (typeof window !== 'undefined') {
    ;(window as any).supabase = client
  }

  return client
}
