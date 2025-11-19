// lib/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr'

// Create a SINGLE instance that gets reused everywhere
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // If client already exists, return it
  if (client) {
    return client
  }

  // Create new client with auth configuration
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )

  // Make it globally accessible for debugging
  if (typeof window !== 'undefined') {
    ;(window as any).supabase = client
  }

  return client
}
