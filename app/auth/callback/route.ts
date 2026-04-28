import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(new URL('/auth/signin?error=Invalid authentication callback', origin))
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Error exchanging code for session:', error)
    return NextResponse.redirect(new URL('/auth/signin?error=Could not authenticate', origin))
  }

  if (!data?.user) {
    return NextResponse.redirect(new URL('/auth/signin?error=Could not authenticate', origin))
  }

  // Route the user to whichever onboarding step they still need.
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('has_accepted_terms, has_accepted_consent')
      .eq('id', data.user.id)
      .single()

    if (!profile?.has_accepted_terms || !profile?.has_accepted_consent) {
      return NextResponse.redirect(new URL('/onboarding/agreement', origin))
    }

    const { data: baseline } = await supabase
      .from('baseline_assessments')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (!baseline) {
      return NextResponse.redirect(new URL('/onboarding/baseline', origin))
    }

    return NextResponse.redirect(new URL('/chat', origin))
  } catch (err) {
    console.error('Error checking user progress:', err)
    return NextResponse.redirect(new URL('/onboarding/agreement', origin))
  }
}
