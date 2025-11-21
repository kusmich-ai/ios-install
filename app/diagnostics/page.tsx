'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function DataPersistenceChecker() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function runDiagnostics() {
      const results: any = {
        timestamp: new Date().toISOString(),
        checks: {},
        issues: [],
        recommendations: []
      }

      try {
        // Create Supabase client inline
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

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
            results.recommendations.push('Run SQL Fix 1: Create missing profiles')
            results.recommendations.push('Check if user_profiles table has RLS policies that allow INSERT')
          } else {
            // Check onboarding completeness
            if (!profile.has_accepted_terms || !profile.has_accepted_consent) {
              results.issues.push('❌ Legal agreements NOT saved to database')
              results.recommendations.push('CRITICAL: Check legal-agreements page - the update query is failing')
              results.recommendations.push('Open browser console (F12) and watch for errors when accepting terms')
              results.recommendations.push('Verify RLS policies allow UPDATE on user_profiles')
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
          note: 'localStorage should NOT be used for onboarding state - only database'
        }

        // 5. Check Supabase connection
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

        // 6. Check environment variables
        results.checks.environment = {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
        }

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          results.issues.push('Missing Supabase environment variables')
          results.recommendations.push('Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
        }

      } catch (error: any) {
        results.checks.criticalError = {
          message: error.message,
          stack: error.stack
        }
        results.issues.push('Critical error during diagnostics: ' + error.message)
      }

      setDiagnostics(results)
      setLoading(false)
    }

    runDiagnostics()
  }, [])

  const exportData = () => {
    const dataStr = JSON.stringify(diagnostics, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ios-diagnostics-${Date.now()}.json`
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Running diagnostics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          🔍 Data Persistence Diagnostics
        </h1>

        {/* Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Summary</h2>
          <div className="space-y-2">
            <div className="text-gray-300">
              <strong>Issues Found:</strong> <span className={diagnostics.issues.length > 0 ? 'text-red-400 font-bold' : 'text-green-400'}>{diagnostics.issues.length}</span>
            </div>
            <div className="text-gray-300">
              <strong>Timestamp:</strong> {diagnostics.timestamp}
            </div>
          </div>
        </div>

        {/* Issues */}
        {diagnostics.issues.length > 0 && (
          <div className="bg-red-950 border border-red-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-red-200 mb-4">🚨 Issues Found</h2>
            <ul className="space-y-2 text-red-100">
              {diagnostics.issues.map((issue: string, i: number) => (
                <li key={i} className="pl-4">• {issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {diagnostics.recommendations.length > 0 && (
          <div className="bg-amber-950 border border-amber-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-amber-200 mb-4">💡 Recommendations</h2>
            <ol className="space-y-2 text-amber-100 list-decimal list-inside">
              {diagnostics.recommendations.map((rec: string, i: number) => (
                <li key={i}>{rec}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Profile Status */}
        {diagnostics.checks.profile?.exists && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">📋 Profile Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">Terms Accepted</div>
                <div className={`text-lg font-bold ${diagnostics.checks.profile.data.hasAcceptedTerms ? 'text-green-400' : 'text-red-400'}`}>
                  {diagnostics.checks.profile.data.hasAcceptedTerms ? '✅ Yes' : '❌ No'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Consent Accepted</div>
                <div className={`text-lg font-bold ${diagnostics.checks.profile.data.hasAcceptedConsent ? 'text-green-400' : 'text-red-400'}`}>
                  {diagnostics.checks.profile.data.hasAcceptedConsent ? '✅ Yes' : '❌ No'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Medical Screening</div>
                <div className={`text-lg font-bold ${diagnostics.checks.profile.data.hasCompletedMedicalScreening ? 'text-green-400' : 'text-gray-500'}`}>
                  {diagnostics.checks.profile.data.hasCompletedMedicalScreening ? '✅ Yes' : '⏳ Pending'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Baseline Assessment</div>
                <div className={`text-lg font-bold ${diagnostics.checks.profile.data.hasCompletedBaseline ? 'text-green-400' : 'text-gray-500'}`}>
                  {diagnostics.checks.profile.data.hasCompletedBaseline ? '✅ Yes' : '⏳ Pending'}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Current Stage</div>
                <div className="text-lg font-bold text-orange-400">
                  Stage {diagnostics.checks.profile.data.currentStage}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Last Updated</div>
                <div className="text-sm text-gray-300">
                  {new Date(diagnostics.checks.profile.data.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">🔐 Session Info</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-400">Session exists:</span>
              <span className={`ml-2 font-semibold ${diagnostics.checks.session?.exists ? 'text-green-400' : 'text-red-400'}`}>
                {diagnostics.checks.session?.exists ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">User ID:</span>
              <span className="ml-2 text-gray-300 font-mono text-xs">
                {diagnostics.checks.session?.userId || 'none'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">User email:</span>
              <span className="ml-2 text-gray-300">
                {diagnostics.checks.user?.email || 'none'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Email confirmed:</span>
              <span className={`ml-2 font-semibold ${diagnostics.checks.user?.emailConfirmed === 'yes' ? 'text-green-400' : 'text-yellow-400'}`}>
                {diagnostics.checks.user?.emailConfirmed || 'unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Checks */}
        <details className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <summary className="text-xl font-bold text-white mb-4 cursor-pointer">
            🔬 Detailed Technical Data (click to expand)
          </summary>
          <pre className="text-sm text-gray-300 overflow-auto max-h-96 bg-gray-950 p-4 rounded mt-4">
            {JSON.stringify(diagnostics.checks, null, 2)}
          </pre>
        </details>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🔄 Rerun Diagnostics
          </button>
          
          <button
            onClick={exportData}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            💾 Download Full Report (JSON)
          </button>

          <button
            onClick={() => window.location.href = '/chat'}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            ← Back to Chat
          </button>
        </div>

        {/* Quick Next Steps */}
        {diagnostics.issues.length > 0 && (
          <div className="mt-8 bg-blue-950 border border-blue-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-200 mb-4">🎯 Next Steps</h2>
            <div className="space-y-4 text-blue-100 text-sm">
              {!diagnostics.checks.profile?.exists && (
                <div className="bg-blue-900 p-4 rounded">
                  <strong className="text-blue-200">Priority 1: Create your profile</strong>
                  <p className="mt-2">Run this in Supabase SQL Editor:</p>
                  <pre className="mt-2 bg-blue-950 p-2 rounded text-xs overflow-x-auto">
{`-- Replace YOUR_USER_ID with: ${diagnostics.checks.session?.userId}
INSERT INTO public.user_profiles (
  id, has_accepted_terms, has_accepted_consent,
  has_completed_medical_screening, has_completed_baseline,
  current_stage, created_at, updated_at
) VALUES (
  '${diagnostics.checks.session?.userId}',
  false, false, false, false, 1, NOW(), NOW()
);`}
                  </pre>
                </div>
              )}
              
              {diagnostics.checks.profile?.exists && (!diagnostics.checks.profile.data.hasAcceptedTerms || !diagnostics.checks.profile.data.hasAcceptedConsent) && (
                <div className="bg-red-900 p-4 rounded">
                  <strong className="text-red-200">Priority 1: Legal agreements not saving!</strong>
                  <p className="mt-2">Open browser console (F12), go to /legal-agreements, accept terms, and watch for errors.</p>
                  <p className="mt-2">Most likely causes:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>RLS policy blocking UPDATE</li>
                    <li>Save function not calling Supabase correctly</li>
                    <li>Error being silently swallowed</li>
                  </ul>
                </div>
              )}

              <div>
                <strong className="text-blue-200">Need the SQL script?</strong>
                <p className="mt-1">Download the full diagnostic report above, then run the SQL diagnostic script from the files I provided earlier.</p>
              </div>
            </div>
          </div>
        )}

        {diagnostics.issues.length === 0 && (
          <div className="mt-8 bg-green-950 border border-green-800 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-200 mb-2">All Good!</h2>
            <p className="text-green-100">
              Data persistence is working correctly. If you're still being redirected to /legal-agreements,
              the issue is likely in your middleware logic or browser cache.
            </p>
            <button
              onClick={() => {
                localStorage.clear()
                sessionStorage.clear()
                alert('Browser storage cleared! Now log out and log back in.')
              }}
              className="mt-4 bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Clear Browser Cache & Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
