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

        // Has screening - check legal
        const { data: legal } = await supabase
          .from('legal_acceptances')
          .select('accepted')
          .eq('user_id', session.user.id)
          .eq('accepted', true)
          .maybeSingle()

        if (!legal) {
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

  // If on legal page - check if already accepted
  if (path === '/legal-agreements' || path === '/legal') {
    try {
      const { data: legal } = await supabase
        .from('legal_acceptances')
        .select('accepted')
        .eq('user_id', session.user.id)
        .eq('accepted', true)
        .maybeSingle()

      if (legal) {
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
        // Already completed assessment - send to chat
        return NextResponse.redirect(new URL('/chat', request.url))
      }
    } catch (error) {
      console.error('Error checking baseline:', error)
    }
  }

  // Allow access to current route
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico
