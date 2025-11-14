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
    '/', // Landing page
  ]
  
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // If not authenticated and trying to access protected route, redirect to signin
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/auth/signin', req.url)
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated and on auth pages (except callback), redirect to screening
  // Let the screening page itself handle checking completion status
  if (session && isPublicRoute && !path.includes('/callback')) {
    return NextResponse.redirect(new URL('/screening', req.url))
  }

  // For all other authenticated requests to protected pages:
  // Just let them through - the individual pages will handle their own flow logic
  // This prevents the middleware from causing redirect loops by checking the database
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
