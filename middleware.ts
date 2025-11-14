// middleware.ts - SIMPLIFIED (No database checks)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const path = req.nextUrl.pathname
  
  // Add logging to help debug
  console.log('🔍 Middleware:', path)
  
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('🔐 Session:', session ? 'YES' : 'NO')

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
    console.log('❌ No session, redirecting to signin')
    const redirectUrl = new URL('/auth/signin', req.url)
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated and on auth pages (except callback)
  if (session && isPublicRoute && !path.includes('/callback')) {
    console.log('✅ Has session but on auth page, redirecting to screening')
    return NextResponse.redirect(new URL('/screening', req.url))
  }

  // For all other authenticated requests, let pages handle their own logic
  console.log('✅ Allowing through')
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
