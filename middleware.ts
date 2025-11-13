import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/callback',
    '/auth/reset-password',
    '/privacy',
    '/terms',
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

  // If no session and trying to access protected route, redirect to signin
  if (!session && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/signin';
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated, manage the flow progression
  if (session) {
    const userId = session.user.id;

    // Get user's current progress
    const { data: screeningData } = await supabase
      .from('screening_responses')
      .select('clearance_status')
      .eq('user_id', userId)
      .single();

    const { data: legalData } = await supabase
      .from('legal_acceptances')
      .select('accepted')
      .eq('user_id', userId)
      .order('accepted_at', { ascending: false })
      .limit(1)
      .single();

    const { data: baselineData } = await supabase
      .from('baseline_assessments')
      .select('id')
      .eq('user_id', userId)
      .single();

    const hasCompletedScreening = screeningData && 
      (screeningData.clearance_status === 'granted' || 
       screeningData.clearance_status === 'granted_modified');
    const hasAcceptedLegal = legalData && legalData.accepted;
    const hasCompletedBaseline = !!baselineData;

    // =====================================================
    // FLOW ROUTING LOGIC
    // =====================================================
    
    // Step 1: After signup, redirect to screening
    if (!hasCompletedScreening && path !== '/screening' && !isPublicRoute) {
      return NextResponse.redirect(new URL('/screening', request.url));
    }

    // Step 2: After screening (if granted), redirect to legal agreements
    if (hasCompletedScreening && !hasAcceptedLegal && path !== '/legal-agreements' && path !== '/screening') {
      return NextResponse.redirect(new URL('/legal-agreements', request.url));
    }

    // Step 3: After legal agreements, redirect to baseline assessment
    if (hasCompletedScreening && hasAcceptedLegal && !hasCompletedBaseline && path !== '/assessment') {
      return NextResponse.redirect(new URL('/assessment', request.url));
    }

    // Step 4: After baseline, redirect to chat (main app)
    if (hasCompletedScreening && hasAcceptedLegal && hasCompletedBaseline) {
      // If user is on any of the flow pages, redirect to chat
      if (path === '/screening' || path === '/legal-agreements' || path === '/assessment') {
        return NextResponse.redirect(new URL('/chat', request.url));
      }
    }

    // Prevent accessing later steps without completing earlier ones
    
    // Can't access legal agreements without completing screening
    if (path === '/legal-agreements' && !hasCompletedScreening) {
      return NextResponse.redirect(new URL('/screening', request.url));
    }

    // Can't access assessment without completing legal agreements
    if (path === '/assessment' && (!hasCompletedScreening || !hasAcceptedLegal)) {
      if (!hasCompletedScreening) {
        return NextResponse.redirect(new URL('/screening', request.url));
      }
      return NextResponse.redirect(new URL('/legal-agreements', request.url));
    }

    // Can't access chat without completing baseline
    if (path === '/chat' && (!hasCompletedScreening || !hasAcceptedLegal || !hasCompletedBaseline)) {
      if (!hasCompletedScreening) {
        return NextResponse.redirect(new URL('/screening', request.url));
      }
      if (!hasAcceptedLegal) {
        return NextResponse.redirect(new URL('/legal-agreements', request.url));
      }
      return NextResponse.redirect(new URL('/assessment', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};
