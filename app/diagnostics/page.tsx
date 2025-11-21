'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function DataPersistenceChecker() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function runDiagnostics() {
      const results: any = {
        timestamp: new Date().toISOString(),
        checks: {},
        issues: [],
        recommendations: []
      }

      try {
        // 1. Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        results.checks.session = {
          exists: !!session,
          userId: session?.user?.id || 'none',
          expiresAt: session?.expires_at,
          error: sessionError?.message
        }
        if (!session) {
          results.issues.push('No active session found')
          results.recommendations.push('User needs to log in')
        }

        // 2. Check current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        results.checks.user = {
          exists: !!user,
          email: user?.email || 'none',
          emailConfirmed: user?.email_confirmed_at ? 'yes' : 'no',
          error: userError?.message
        }

        if (!user && session) {
          results.issues.push('Session exists but user data not retrievable')
          results.recommendations.push('Check Supabase RLS policies')
        }

        // 3. Check user_profiles table
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          results.checks.profile = {
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
          }

          if (!profile) {
            results.issues.push('User profile does not exist in database')
            results.recommendations.push('Check if user_profiles table has RLS policies that allow INSERT')
            results.recommendations.push('Verify signup process creates profile correctly')
          } else {
            // Check onboarding completeness
            if (!profile.has_accepted_terms || !profile.has_accepted_consent) {
              results.issues.push('Legal agreements not marked as accepted in database')
              results.recommendations.push('Check legal-agreements page save logic')
            }
            if (!profile.has_completed_medical_screening) {
              results.issues.push('Medical screening not completed')
            }
            if (!profile.has_completed_baseline) {
              results.issues.push('Baseline assessment not completed')
            }
          }
        }

        // 4. Check localStorage (client-side only)
        const localStorageData: any = {}
        if (typeof window !== 'undefined') {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key) {
              try {
                localStorageData[key] = JSON.parse(localStorage.getItem(key) || '')
              } catch {
                localStorageData[key] = localStorage.getItem(key)
              }
            }
          }
        }
        results.checks.localStorage = {
          keys: Object.keys(localStorageData),
          data: localStorageData
        }

        // 5. Check if middleware is redirecting properly
        results.checks.middleware = {
          note: 'Middleware should check user_profiles for onboarding completion',
          expectedBehavior: 'If has_accepted_terms=false, redirect to /legal-agreements',
          recommendation: 'Verify middleware.ts logic'
        }

        // 6. Check Supabase connection
        const { data: connectionTest, error: connectionError } = await supabase
          .from('user_profiles')
          .select('count')
          .limit(1)
        
        results.checks.supabaseConnection = {
          working: !connectionError,
          error: connectionError?.message
        }

        if (connectionError) {
          results.issues.push('Cannot connect to Supabase')
          results.recommendations.push('Check environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)')
        }

      } catch (error: any) {
        results.checks.criticalError = {
          message: error.message,
          stack: error.stack
        }
        results.issues.push('Critical error during diagnostics')
      }

      setDiagnostics(results)
      setLoading(false)
    }

    runDiagnostics()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Running diagnostics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Data Persistence Diagnostics
        </h1>

        {/* Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Summary</h2>
          <div className="space-y-2">
            <div className="text-gray-300">
              <strong>Issues Found:</strong> {diagnostics.issues.length}
            </div>
            <div className="text-gray-300">
              <strong>Timestamp:</strong> {diagnostics.timestamp}
            </div>
          </div>
        </div>

        {/* Issues */}
        {diagnostics.issues.length > 0 && (
          <div className="bg-red-950 border border-red-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-red-200 mb-4">🚨 Issues</h2>
            <ul className="space-y-2 text-red-100">
              {diagnostics.issues.map((issue: string, i: number) => (
                <li key={i}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {diagnostics.recommendations.length > 0 && (
          <div className="bg-amber-950 border border-amber-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-amber-200 mb-4">💡 Recommendations</h2>
            <ul className="space-y-2 text-amber-100">
              {diagnostics.recommendations.map((rec: string, i: number) => (
                <li key={i}>• {rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Checks */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Detailed Checks</h2>
          <pre className="text-sm text-gray-300 overflow-auto">
            {JSON.stringify(diagnostics.checks, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            Rerun Diagnostics
          </button>
          
          <button
            onClick={() => {
              const dataStr = JSON.stringify(diagnostics, null, 2)
              const blob = new Blob([dataStr], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `ios-diagnostics-${Date.now()}.json`
              a.click()
            }}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            Download Diagnostic Report
          </button>
        </div>
      </div>
    </div>
  )
}
