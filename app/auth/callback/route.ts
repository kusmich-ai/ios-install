import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/auth/signin?error=Could not authenticate', origin))
    }

    // Check user's progress to determine where to send them
    if (data?.user) {
      try {
        // Check if screening completed
        const { data: screening } = await supabase
          .from('screening_responses')
          .select('clearance_status')
          .eq('user_id', data.user.id)
          .single()

        if (!screening) {
          // No screening - send to screening page
          return NextResponse.redirect(new URL('/screening', origin))
        }

        // Check if legal agreements completed
        const { data: legal } = await supabase
          .from('legal_acceptances')
          .select('id')
          .eq('user_id', data.user.id)
          .single()

        if (!legal) {
          // Screening done but no legal - send to legal agreements
          return NextResponse.redirect(new URL('/legal-agreements', origin))
        }

        // Check if baseline assessment completed
        const { data: baseline } = await supabase
          .from('baseline_assessments')
          .select('id')
          .eq('user_id', data.user.id)
          .single()

        if (!baseline) {
          // Legal done but no baseline - send to assessment
          return NextResponse.redirect(new URL('/assessment', origin))
        }

        // Everything complete - send to chat
        return NextResponse.redirect(new URL('/chat', origin))
        
      } catch (error) {
        console.error('Error checking user progress:', error)
        // On error, default to screening (they have a session)
        return NextResponse.redirect(new URL('/screening', origin))
      }
    }
  }

  // No code = invalid callback, send to sign-in
  return NextResponse.redirect(new URL('/auth/signin?error=Invalid authentication callback', origin))
}
