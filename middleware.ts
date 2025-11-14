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
    '/auth/callback',
    '/',
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
      .from('screening_responses') // ✅ Changed from 'screenings' to match your actual table
      .select('clearance_level')
      .eq('user_id', session.user.id)
      .single()

    // ✅ FIXED: Only redirect if NOT on screening page AND screening not complete
    if (!screening?.clearance_level && path !== '/screening') {
      return NextResponse.redirect(new URL('/screening', req.url))
    }

    // Check legal agreement acceptance
    const { data: legal } = await supabase
      .from('legal_acceptances') // ✅ Changed from 'legal_agreements' to match your actual table
      .select('accepted_at')
      .eq('user_id', session.user.id)
      .single()

    // ✅ FIXED: Only redirect if NOT on legal page AND screening done but legal not accepted
    if (screening?.clearance_level && !legal?.accepted_at && path !== '/legal-agreement') {
      return NextResponse.redirect(new URL('/legal-agreement', req.url))
    }

    // Check baseline completion
    const { data: baseline } = await supabase
      .from('baseline_scores') // ✅ Changed to match your actual table
      .select('rewired_index')
      .eq('user_id', session.user.id)
      .single()

    // ✅ FIXED: Only redirect if NOT on assessment page AND legal done but baseline not complete
    if (legal?.accepted_at && !baseline?.rewired_index && path !== '/assessment') {
      return NextResponse.redirect(new URL('/assessment', req.url))
    }
  }

  // If authenticated and on auth pages (except callback), redirect based on progress
  if (session && isPublicRoute && !path.includes('/callback')) {
    const { data: screening } = await supabase
      .from('screening_responses')
      .select('clearance_level')
      .eq('user_id', session.user.id)
      .single()

    if (!screening?.clearance_level) {
      return NextResponse.redirect(new URL('/screening', req.url))
    }

    const { data: legal } = await supabase
      .from('legal_acceptances')
      .select('accepted_at')
      .eq('user_id', session.user.id)
      .single()

    if (!legal?.accepted_at) {
      return NextResponse.redirect(new URL('/legal-agreement', req.url))
    }

    const { data: baseline } = await supabase
      .from('baseline_scores')
      .select('rewired_index')
      .eq('user_id', session.user.id)
      .single()

    if (!baseline?.rewired_index) {
      return NextResponse.redirect(new URL('/assessment', req.url))
    }

    // Everything complete, go to chat
    return NextResponse.redirect(new URL('/chat', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
