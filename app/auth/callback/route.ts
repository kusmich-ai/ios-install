// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      // Await cookies in Next.js 15+
      const cookieStore = await cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        // Redirect to signin with error message
        return NextResponse.redirect(
          new URL(`/auth/signin?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        )
      }
      
      // Success! Redirect to screening (first step in your flow)
      return NextResponse.redirect(new URL('/screening', requestUrl.origin))
      
    } catch (error) {
      console.error('Unexpected error during auth callback:', error)
      return NextResponse.redirect(
        new URL('/auth/signin?error=Something went wrong during confirmation', requestUrl.origin)
      )
    }
  }

  // No code provided - redirect to signin
  console.warn('Auth callback called without code parameter')
  return NextResponse.redirect(new URL('/auth/signin', requestUrl.origin))
}
