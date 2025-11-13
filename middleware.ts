import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/privacy', '/terms', '/cookie-policy', '/contact', '/legal-agreements', '/screening'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/signin';
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated, check if they've completed baseline
  if (session) {
    try {
      // Check if user has completed baseline assessment
      const { data: progress, error } = await supabase
        .from('user_progress')
        .select('system_initialized')
        .eq('user_id', session.user.id)
        .single();

      const hasCompletedBaseline = progress?.system_initialized === true;

      // If trying to access assessment but already completed
      if (pathname === '/assessment' && hasCompletedBaseline) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/chat';
        return NextResponse.redirect(redirectUrl);
      }

      // If trying to access chat but haven't completed baseline
      if (pathname === '/chat' && !hasCompletedBaseline) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/assessment';
        return NextResponse.redirect(redirectUrl);
      }

      // If authenticated and on public route, redirect based on baseline status
      if (isPublicRoute && pathname !== '/') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = hasCompletedBaseline ? '/chat' : '/assessment';
        return NextResponse.redirect(redirectUrl);
      }

    } catch (error) {
      console.error('Middleware error:', error);
      // On error, allow the request through
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
