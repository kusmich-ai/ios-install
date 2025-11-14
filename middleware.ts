// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // CRITICAL: Refresh session BEFORE checking auth
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedPaths = ['/chat', '/assessment', '/screening']
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // Public routes that should redirect authenticated users away
  const authPaths = ['/auth/signin', '/auth/signup']
  const isAuthPath = authPaths.some(path => req.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !session) {
    // Redirect to signin if trying to access protected route without auth
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  if (isAuthPath && session) {
    // Already authenticated, redirect to screening/assessment flow
    return NextResponse.redirect(new URL('/screening', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/chat/:path*',
    '/assessment/:path*',
    '/screening/:path*',
    '/auth/:path*'
  ]
}
