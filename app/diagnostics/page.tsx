import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DiagnosticsClient from './diagnostics-client'

export default async function DiagnosticsPage() {
  const supabase = await createClient()

  // Get session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  // Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Test connection
  const { data: connectionTest, error: connectionError } = await supabase
    .from('user_profiles')
    .select('count')
    .limit(1)

  // Compile diagnostics
  const diagnostics = {
    timestamp: new Date().toISOString(),
    checks: {
      session: {
        exists: !!session,
        userId: session?.user?.id || 'none',
        expiresAt: session?.expires_at,
        error: sessionError?.message
      },
      user: {
        exists: !!user,
        email: user?.email || 'none',
        emailConfirmed: user?.email_confirmed_at ? 'yes' : 'no',
        error: userError?.message
      },
      profile: {
        exists: !!profile,
        data: profile ? {
          hasAcceptedTerms: profile.has_accepted_terms,
          hasAcceptedConsent: profile.has_accepted_consent,
          hasCompletedMedicalScreening: profile.has_completed_medical_screening,
          hasCompletedBaseline: profile.has_completed_baseline,
          currentStage: profile.current_stage,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        } : null,
        error: profileError?.message
      },
      supabaseConnection: {
        working: !connectionError,
        error: connectionError?.message
      }
    },
    issues: [] as string[],
    recommendations: [] as string[]
  }

  // Analyze and add issues
  if (!session) {
    diagnostics.issues.push('No active session found')
    diagnostics.recommendations.push('User needs to log in')
  }

  if (!user && session) {
    diagnostics.issues.push('Session exists but user data not retrievable')
    diagnostics.recommendations.push('Check Supabase RLS policies')
  }

  if (!profile) {
    diagnostics.issues.push('User profile does not exist in database')
    diagnostics.recommendations.push('Check if user_profiles table has RLS policies that allow INSERT')
    diagnostics.recommendations.push('Verify signup process creates profile correctly')
  } else {
    if (!profile.has_accepted_terms || !profile.has_accepted_consent) {
      diagnostics.issues.push('Legal agreements not marked as accepted in database')
      diagnostics.recommendations.push('Check legal-agreements page save logic')
    }
    if (!profile.has_completed_medical_screening) {
      diagnostics.issues.push('Medical screening not completed')
    }
    if (!profile.has_completed_baseline) {
      diagnostics.issues.push('Baseline assessment not completed')
    }
  }

  if (connectionError) {
    diagnostics.issues.push('Cannot connect to Supabase')
    diagnostics.recommendations.push('Check environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  }

  return <DiagnosticsClient diagnostics={diagnostics} />
}
