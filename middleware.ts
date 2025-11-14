// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth/signin',
    '/auth/signup', 
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/callback', // IMPORTANT: Allow callback
    '/', // Landing page
  ]
  
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/auth/signin', req.url)
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated, enforce the flow: screening → legal → assessment → chat
  if (session && !isPublicRoute) {
    
    // Check screening completion
    const { data: screening } = await supabase
      .from('screenings')
      .select('completed')
      .eq('user_id', session.user.id)
      .single()

    // If no screening and not on screening page, redirect to screening
    if (!screening?.completed && path !== '/screening') {
      return NextResponse.redirect(new URL('/screening', req.url))
    }

    // Check legal agreement acceptance
    const { data: legal } = await supabase
      .from('legal_agreements')
      .select('accepted')
      .eq('user_id', session.user.id)
      .single()

    // If screening done but no legal agreement and not on legal page
    if (screening?.completed && !legal?.accepted && path !== '/legal-agreement') {
      return NextResponse.redirect(new URL('/legal-agreement', req.url))
    }

    // Check baseline completion
    const { data: baseline } = await supabase
      .from('baseline_assessments')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    // If legal done but no baseline and not on assessment page
    if (legal?.accepted && !baseline && path !== '/assessment') {
      return NextResponse.redirect(new URL('/assessment', req.url))
    }

    // If everything is complete, allow access to chat
    // (This is automatic - no redirect needed)
  }

  // If authenticated and on auth pages (except callback), redirect based on progress
  if (session && isPublicRoute && !path.includes('/callback')) {
    // Check where they are in the flow
    const { data: screening } = await supabase
      .from('screenings')
      .select('completed')
      .eq('user_id', session.user.id)
      .single()

    if (!screening?.completed) {
      return NextResponse.redirect(new URL('/screening', req.url))
    }

    const { data: legal } = await supabase
      .from('legal_agreements')
      .select('accepted')
      .eq('user_id', session.user.id)
      .single()

    if (!legal?.accepted) {
      return NextResponse.redirect(new URL('/legal-agreement', req.url))
    }

    const { data: baseline } = await supabase
      .from('baseline_assessments')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!baseline) {
      return NextResponse.redirect(new URL('/assessment', req.url))
    }

    // Everything complete, go to chat
    return NextResponse.redirect(new URL('/chat', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
