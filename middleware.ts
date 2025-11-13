// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // CRITICAL: Refresh session before checking auth state
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth pages - redirect to screening if already logged in
  if (req.nextUrl.pathname.startsWith('/auth')) {
    if (session) {
      return NextResponse.redirect(new URL('/screening', req.url))
    }
    return res
  }

  // Protected routes - redirect to signin if not logged in
  const protectedPaths = ['/screening', '/chat', '/dashboard']
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/auth/signin', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/auth/:path*',
    '/screening/:path*',
    '/chat/:path*',
    '/dashboard/:path*',
  ],
}
