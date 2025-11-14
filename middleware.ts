// middleware.ts - EMERGENCY FIX
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const path = req.nextUrl.pathname
  
  console.log('🔍 Middleware checking:', path)
  
  const supabase = createMiddlewareClient({ req, res })

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('🔐 Has session?', !!session)

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
    console.log('❌ Redirecting to signin - no session')
    const redirectUrl = new URL('/auth/signin', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated and on auth pages (except callback), redirect to screening
  if (session && isPublicRoute && !path.includes('/callback') && path !== '/') {
    console.log('✅ Redirecting to screening - has session, on auth page')
    return NextResponse.redirect(new URL('/screening', req.url))
  }

  // Allow everything else through
  console.log('✅ Allowing through')
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
