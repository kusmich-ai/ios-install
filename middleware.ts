// middleware.ts - Sprint 2: simplified onboarding waterfall
//
// Onboarding gates: agreement (terms + consent) → baseline (rewired index) → /chat
// Coach, profile, and public-tools routes bypass onboarding checks.
// Old onboarding routes (/screening, /legal-agreements, /assessment, /mirror)
// redirect to whichever new step the user still needs — they'll be removed
// from the codebase entirely in Sprint 2 / Phase 6.

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/',
  '/begin',
  '/privacy',
  '/terms',
  '/auth/signin',
  '/auth/signup',
  '/auth/callback',
  '/auth/forgot-password',
  '/auth/reset-password',
]

const DEPRECATED_ONBOARDING_ROUTES = [
  '/screening',
  '/legal-agreements',
  '/assessment',
  '/mirror',
]

type OnboardingState = {
  hasAgreement: boolean
  hasBaseline: boolean
}

function nextOnboardingStep(state: OnboardingState): string {
  if (!state.hasAgreement) return '/onboarding/agreement'
  if (!state.hasBaseline) return '/onboarding/baseline'
  return '/chat'
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const path = request.nextUrl.pathname

  // CRITICAL: Refresh session before checking auth
  const { data: { session } } = await supabase.auth.getSession()

  // ============================================
  // PUBLIC TOOLS - No auth required
  // ============================================
  if (path.startsWith('/tools/')) {
    return response
  }

  // ============================================
  // PUBLIC ROUTES (no auth required)
  // ============================================
  if (PUBLIC_ROUTES.includes(path)) {
    // If an authenticated user lands on signin/signup, route them forward.
    if (session && (path === '/auth/signin' || path === '/auth/signup')) {
      try {
        const state = await loadOnboardingState(supabase, session.user.id)
        return NextResponse.redirect(new URL(nextOnboardingStep(state), request.url))
      } catch (error) {
        console.error('Error checking user progress on public auth route:', error)
        return NextResponse.redirect(new URL('/onboarding/agreement', request.url))
      }
    }
    return response
  }

  // ============================================
  // PROTECTED ROUTES (auth required)
  // ============================================
  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Coach and profile routes don't enforce onboarding state.
  if (path.startsWith('/coach/')) return response
  if (path.startsWith('/profile/')) return response

  // ============================================
  // ONBOARDING + CHAT GATING
  // Only paths that participate in onboarding need the state lookup.
  // ============================================
  const needsOnboardingState =
    path.startsWith('/onboarding/') ||
    path === '/chat' ||
    path.startsWith('/chat/') ||
    DEPRECATED_ONBOARDING_ROUTES.includes(path)

  if (!needsOnboardingState) {
    return response
  }

  let state: OnboardingState
  try {
    state = await loadOnboardingState(supabase, session.user.id)
  } catch (error) {
    console.error('Error loading onboarding state:', error)
    // Fail open to the agreement step rather than blocking access entirely.
    return NextResponse.redirect(new URL('/onboarding/agreement', request.url))
  }

  // Old onboarding routes redirect into the new flow at whichever step the
  // user still needs. They will be removed from the codebase in Phase 6;
  // this redirect bridges any user with a stale link or bookmark.
  if (DEPRECATED_ONBOARDING_ROUTES.includes(path)) {
    return NextResponse.redirect(new URL(nextOnboardingStep(state), request.url))
  }

  // If the user is already past the step they're trying to view, move them on.
  if (path === '/onboarding/agreement' && state.hasAgreement) {
    return NextResponse.redirect(
      new URL(state.hasBaseline ? '/chat' : '/onboarding/baseline', request.url)
    )
  }

  if (path === '/onboarding/baseline' && state.hasBaseline) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  // /onboarding/index-reveal is a results display — no gating.

  // ============================================
  // CHAT - Enforce both gates + Stage 2+ subscription
  // ============================================
  if (path === '/chat' || path.startsWith('/chat/')) {
    if (!state.hasAgreement) {
      return NextResponse.redirect(new URL('/onboarding/agreement', request.url))
    }
    if (!state.hasBaseline) {
      return NextResponse.redirect(new URL('/onboarding/baseline', request.url))
    }

    try {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('current_stage')
        .eq('user_id', session.user.id)
        .maybeSingle()

      const currentStage = progress?.current_stage || 1

      if (currentStage > 1) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status, current_period_end, cancel_at_period_end')
          .eq('user_id', session.user.id)
          .maybeSingle()

        const isSubscriptionActive =
          subscription?.status === 'active' ||
          subscription?.status === 'trialing' ||
          (subscription?.cancel_at_period_end &&
            subscription?.current_period_end &&
            new Date(subscription.current_period_end) > new Date())

        if (!isSubscriptionActive) {
          const pricingUrl = new URL('/pricing', request.url)
          pricingUrl.searchParams.set('reason', 'subscription_required')
          pricingUrl.searchParams.set('stage', currentStage.toString())
          return NextResponse.redirect(pricingUrl)
        }
      }
    } catch (error) {
      console.error('Error checking chat access:', error)
    }
  }

  return response
}

async function loadOnboardingState(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<OnboardingState> {
  const [profileRes, baselineRes] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('has_accepted_terms, has_accepted_consent')
      .eq('id', userId)
      .single(),
    supabase
      .from('baseline_assessments')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  return {
    hasAgreement: !!(
      profileRes.data?.has_accepted_terms && profileRes.data?.has_accepted_consent
    ),
    hasBaseline: !!baselineRes.data,
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
