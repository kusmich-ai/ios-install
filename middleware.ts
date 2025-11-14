// middleware.ts - SAFE VERSION

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    const supabase = createMiddlewareClient({ req, res });
    
    // Refresh session if it exists
    const { data: { session } } = await supabase.auth.getSession();
    
    const { pathname } = req.nextUrl;

    // Public routes that don't need authentication
    const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/privacy', '/terms', '/legal-agreements'];
    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/auth/');
    
    // If it's a public route, allow access
    if (isPublicRoute) {
      return res;
    }

    // Protected routes require authentication
    if (!session) {
      const redirectUrl = new URL('/auth/signin', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user has completed required steps
    if (session) {
      const userId = session.user.id;

      // Allow access to screening and legal-agreements regardless of completion
      if (pathname === '/screening' || pathname === '/legal-agreements') {
        return res;
      }

      try {
        // Check if user has completed screening
        const { data: screeningData } = await supabase
          .from('user_progress')
          .select('screening_completed, legal_accepted')
          .eq('user_id', userId)
          .single();

        // If no screening data, redirect to screening
        if (!screeningData?.screening_completed && pathname !== '/screening') {
          return NextResponse.redirect(new URL('/screening', req.url));
        }

        // If no legal acceptance, redirect to legal agreements
        if (!screeningData?.legal_accepted && pathname !== '/legal-agreements') {
          return NextResponse.redirect(new URL('/legal-agreements', req.url));
        }

        // Check if user has completed baseline assessment
        const { data: baselineData } = await supabase
          .from('user_data')
          .select('value')
          .eq('user_id', userId)
          .eq('key', 'ios:baseline:rewired_index')
          .single();

        // If no baseline and trying to access chat, redirect to assessment
        if (!baselineData?.value && pathname === '/chat') {
          return NextResponse.redirect(new URL('/assessment', req.url));
        }
      } catch (error) {
        console.error('Middleware database check error:', error);
        // On error, allow access rather than blocking
        return res;
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // On any error, allow the request through rather than crashing
    return NextResponse.next();
  }
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
};
