// app/assessment/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation' // ← App Router: next/navigation
import IOSBaselineAssessment from '@/components/IOSBaselineAssessment'

export default function AssessmentPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Not authenticated - redirect to signin
        router.push('/auth/signin')
        return
      }

      // Check if user already completed baseline
      const { data: baseline } = await supabase
        .from('baseline_assessments')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (baseline) {
        // Already completed - redirect to chat
        router.push('/chat')
        return
      }

      setUser(user)
      setLoading(false)
    }

    loadUser()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#ff9e19' }}>Loading...</div>
        </div>
      </div>
    )
  }

  // Pass user to component so it can save to Supabase
  return <IOSBaselineAssessment user={user} />
}
