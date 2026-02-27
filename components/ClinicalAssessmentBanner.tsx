'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { X, ClipboardCheck, ArrowRight } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════
// CLINICAL ASSESSMENT BANNER
// Drop this into your chat layout or sidebar.
// Auto-detects which timepoint is pending and shows a persistent
// but dismissible reminder. Dismissal lasts for the session only.
// ═══════════════════════════════════════════════════════════════════

const TIMEPOINT_COPY: Record<string, { title: string; subtitle: string }> = {
  baseline: {
    title: 'Complete Your Baseline Assessment',
    subtitle: 'Quick clinical check-in (~12 min) to establish your starting point. This helps validate your transformation.',
  },
  stage_3: {
    title: 'Midpoint Clinical Check-In Available',
    subtitle: 'You\'ve reached Stage 3. Time for a follow-up assessment to measure your progress (~12 min).',
  },
  stage_6: {
    title: 'Final Clinical Assessment Available',
    subtitle: 'You\'ve reached Stage 6 — Integration. Complete your final assessment to capture your full transformation (~12 min).',
  },
}

interface ClinicalBannerProps {
  userId: string
}

export default function ClinicalAssessmentBanner({ userId }: ClinicalBannerProps) {
  const [pending, setPending] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (!userId) return

    const checkStatus = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_clinical_assessment_status', { p_user_id: userId })

        if (error) {
          console.error('Clinical status check error:', error)
          setLoading(false)
          return
        }

        if (data?.next_pending) {
          setPending(data.next_pending)
        }
      } catch (err) {
        console.error('Clinical banner error:', err)
      }
      setLoading(false)
    }

    checkStatus()
  }, [userId])

  // Don't render anything while loading, if dismissed, or if nothing pending
  if (loading || dismissed || !pending) return null

  const copy = TIMEPOINT_COPY[pending] || TIMEPOINT_COPY.baseline

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 158, 25, 0.08), rgba(255, 158, 25, 0.03))',
      border: '1px solid rgba(255, 158, 25, 0.2)',
      borderRadius: 12,
      padding: '14px 16px',
      margin: '0 0 12px 0',
      position: 'relative',
    }}>
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Dismiss"
      >
        <X size={14} color="#666" />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Icon */}
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'rgba(255, 158, 25, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}>
          <ClipboardCheck size={18} color="#ff9e19" />
        </div>

        {/* Content */}
        <div style={{ flex: 1, paddingRight: 20 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#e8e4df',
            marginBottom: 4,
            lineHeight: 1.3,
          }}>
            {copy.title}
          </div>
          <div style={{
            fontSize: 12,
            color: '#888',
            lineHeight: 1.5,
            marginBottom: 10,
          }}>
            {copy.subtitle}
          </div>

          {/* CTA */}
          <a
            href="/clinical-assessment"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: '#ff9e19',
              color: '#000',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#ffb347')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#ff9e19')}
          >
            Start Assessment
            <ArrowRight size={14} />
          </a>

          <button
            onClick={() => setDismissed(true)}
            style={{
              marginLeft: 12,
              background: 'transparent',
              border: 'none',
              color: '#555',
              fontSize: 12,
              cursor: 'pointer',
              padding: '8px 4px',
            }}
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  )
}
