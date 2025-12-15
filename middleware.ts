// middleware.ts - UPDATED with The Mirror + Profile routes
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get current path
  const path = request.nextUrl.pathname

  // CRITICAL: Refresh session before checking auth
  const { data: { session } } = await supabase.auth.getSession()

  // ============================================
  // PUBLIC ROUTES (no auth required)
  // ============================================
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/callback',
    '/auth/forgot-password',
    '/auth/reset-password'
  ]

  if (publicRoutes.includes(path)) {
    // If authenticated user hits signin/signup, redirect to their next step
    if (session && (path === '/auth/signin' || path === '/auth/signup')) {
      // Check their progress to determine where to send them
      try {
        // Check screening status
        const { data: screening } = await supabase
          .from('screening_responses')
          .select('clearance_status')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (!screening) {
          // No screening completed - send to screening
          return NextResponse.redirect(new URL('/screening', request.url))
        }

        // Check legal from user_profiles
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('has_accepted_terms, has_accepted_consent')
          .eq('id', session.user.id)
          .single()

        if (!profile || !profile.has_accepted_terms || !profile.has_accepted_consent) {
          // No legal acceptance - send to legal
          return NextResponse.redirect(new URL('/legal-agreements', request.url))
        }

        // Has legal - check baseline
        const { data: baseline } = await supabase
          .from('baseline_assessments')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (!baseline) {
          // No baseline - send to assessment
          return NextResponse.redirect(new URL('/assessment', request.url))
        }

        // Has baseline - check The Mirror
        const { data: patternProfile } = await supabase
          .from('pattern_profiles')
          .select('id, skipped')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (!patternProfile) {
          // No pattern profile - send to mirror
          return NextResponse.redirect(new URL('/mirror', request.url))
        }

        // Everything complete - send to chat
        return NextResponse.redirect(new URL('/chat', request.url))
      } catch (error) {
        console.error('Error checking user progress:', error)
        // On error, send to screening (safest default)
        return NextResponse.redirect(new URL('/screening', request.url))
      }
    }

    // Public route, not authenticated or not on auth page - allow access
    return response
  }

  // ============================================
  // PROTECTED ROUTES (auth required)
  // ============================================
  
  if (!session) {
    // Not authenticated - redirect to signin
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // ============================================
  // COACH ROUTES - Just need auth, skip onboarding checks
  // ============================================
  if (path.startsWith('/coach/')) {
    // User is authenticated, allow access to coach pages
    return response
  }

  // ============================================
  // PROFILE ROUTES - Just need auth, skip onboarding checks
  // ============================================
  if (path.startsWith('/profile/')) {
    // User is authenticated, allow access to profile pages
    return response
  }

  // User is authenticated - check if they're on the right step

  // If on screening page - check if already completed
  if (path === '/screening') {
    try {
      const { data: screening } = await supabase
        .from('screening_responses')
        .select('clearance_status')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (screening && screening.clearance_status === 'granted') {
        // Already passed screening - send to legal
        return NextResponse.redirect(new URL('/legal-agreements', request.url))
      }
    } catch (error) {
      console.error('Error checking screening:', error)
    }
  }

  // Check legal from user_profiles
  if (path === '/legal-agreements' || path === '/legal') {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('has_accepted_terms, has_accepted_consent')
        .eq('id', session.user.id)
        .single()

      if (profile && profile.has_accepted_terms && profile.has_accepted_consent) {
        // Already accepted legal - send to assessment
        return NextResponse.redirect(new URL('/assessment', request.url))
      }
    } catch (error) {
      console.error('Error checking legal:', error)
    }
  }

  // If on assessment - check if already completed
  if (path === '/assessment') {
    try {
      const { data: baseline } = await supabase
        .from('baseline_assessments')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (baseline) {
        // Already completed assessment - send to mirror (not chat)
        return NextResponse.redirect(new URL('/mirror', request.url))
      }
    } catch (error) {
      console.error('Error checking baseline:', error)
    }
  }

  // ============================================
  // THE MIRROR - Check if completed or skipped
  // ============================================
  if (path === '/mirror') {
    try {
      // First verify user has completed baseline (required before mirror)
      const { data: baseline } = await supabase
        .from('baseline_assessments')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!baseline) {
        // No baseline yet - send to assessment first
        return NextResponse.redirect(new URL('/assessment', request.url))
      }

      // Check if already completed or skipped The Mirror
      const { data: patternProfile } = await supabase
        .from('pattern_profiles')
        .select('id, skipped')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (patternProfile) {
        // Already completed or skipped - send to chat
        return NextResponse.redirect(new URL('/chat', request.url))
      }

      // No pattern profile - allow access to /mirror
    } catch (error) {
      console.error('Error checking mirror status:', error)
    }
  }

  // ============================================
  // CHAT - Ensure all onboarding steps completed
  // ============================================
  if (path === '/chat' || path.startsWith('/chat/')) {
    try {
      // Check baseline first
      const { data: baseline } = await supabase
        .from('baseline_assessments')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!baseline) {
        // No baseline - send to assessment
        return NextResponse.redirect(new URL('/assessment', request.url))
      }

      // Check The Mirror (must be completed or skipped)
      const { data: patternProfile } = await supabase
        .from('pattern_profiles')
        .select('id, skipped')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!patternProfile) {
        // No pattern profile - send to mirror
        return NextResponse.redirect(new URL('/mirror', request.url))
      }

      // All checks passed - allow access to chat
    } catch (error) {
      console.error('Error checking chat access:', error)
    }
  }

  // Allow access to current route
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
