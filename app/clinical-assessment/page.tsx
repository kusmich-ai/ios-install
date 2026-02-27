'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

// ═══════════════════════════════════════════════════════════════════
// VALIDATED CLINICAL INSTRUMENTS
// PHQ-9 (Kroenke et al., 2001), GAD-7 (Spitzer et al., 2006),
// PSS-10 (Cohen et al., 1983), PWB-18 (Ryff, 1989)
// ═══════════════════════════════════════════════════════════════════

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading or watching television",
  "Moving or speaking so slowly that other people could have noticed — or the opposite, being so fidgety or restless",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
]

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen",
]

const PSS10_QUESTIONS = [
  "Been upset because of something that happened unexpectedly?",
  "Felt that you were unable to control the important things in your life?",
  "Felt nervous and stressed?",
  "Felt confident about your ability to handle your personal problems?",
  "Felt that things were going your way?",
  "Found that you could not cope with all the things that you had to do?",
  "Been able to control irritations in your life?",
  "Felt that you were on top of things?",
  "Been angered because of things that were outside of your control?",
  "Felt difficulties were piling up so high that you could not overcome them?",
]
const PSS10_REVERSED = [3, 4, 6, 7]

const PWB18_QUESTIONS = [
  { q: "I am not afraid to voice my opinions, even when they are in opposition to the opinions of most people.", domain: "autonomy", reversed: false },
  { q: "In general, I feel I am in charge of the situation in which I live.", domain: "mastery", reversed: false },
  { q: "I am not interested in activities that will expand my horizons.", domain: "growth", reversed: true },
  { q: "Most people see me as loving and affectionate.", domain: "relations", reversed: false },
  { q: "I live life one day at a time and don't really think about the future.", domain: "purpose", reversed: true },
  { q: "When I look at the story of my life, I am pleased with how things have turned out so far.", domain: "acceptance", reversed: false },
  { q: "My decisions are not usually influenced by what everyone else is doing.", domain: "autonomy", reversed: false },
  { q: "The demands of everyday life often get me down.", domain: "mastery", reversed: true },
  { q: "I think it is important to have new experiences that challenge how you think about yourself and the world.", domain: "growth", reversed: false },
  { q: "Maintaining close relationships has been difficult and frustrating for me.", domain: "relations", reversed: true },
  { q: "I have a sense of direction and purpose in life.", domain: "purpose", reversed: false },
  { q: "In general, I feel confident and positive about myself.", domain: "acceptance", reversed: false },
  { q: "I tend to worry about what other people think of me.", domain: "autonomy", reversed: true },
  { q: "I do not fit very well with the people and the community around me.", domain: "mastery", reversed: true },
  { q: "When I think about it, I haven't really improved much as a person over the years.", domain: "growth", reversed: true },
  { q: "I often feel lonely because I have few close friends with whom to share my concerns.", domain: "relations", reversed: true },
  { q: "My daily activities often seem trivial and unimportant to me.", domain: "purpose", reversed: true },
  { q: "I feel like many of the people I know have gotten more out of life than I have.", domain: "acceptance", reversed: true },
]

const PWB18_DOMAINS: Record<string, number[]> = {
  autonomy: [0, 6, 12],
  mastery: [1, 7, 13],
  growth: [2, 8, 14],
  relations: [3, 9, 15],
  purpose: [4, 10, 16],
  acceptance: [5, 11, 17],
}

const PWB18_DOMAIN_LABELS: Record<string, string> = {
  autonomy: "Autonomy",
  mastery: "Environmental Mastery",
  growth: "Personal Growth",
  relations: "Positive Relations",
  purpose: "Purpose in Life",
  acceptance: "Self-Acceptance",
}

// ═══════════════════════════════════════════════════════════════════
// RESPONSE OPTIONS
// ═══════════════════════════════════════════════════════════════════

const PHQ_GAD_OPTIONS = ["Not at all", "Several days", "More than half the days", "Nearly every day"]
const PSS_OPTIONS = ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"]
const PWB_OPTIONS = ["Strongly Disagree", "Disagree", "Slightly Disagree", "Neutral", "Slightly Agree", "Agree", "Strongly Agree"]

// ═══════════════════════════════════════════════════════════════════
// MEASURE METADATA
// ═══════════════════════════════════════════════════════════════════

interface MeasureConfig {
  key: string
  label: string
  shortLabel: string
  description: string
  timeframe: string
  questions: string[]
  options: string[]
  offset: number // PWB uses 1-7, others use 0-3 or 0-4
  maxScore: number
  scoreFn: (answers: number[]) => { total: number; subscales?: any; severity?: string }
}

const MEASURES: MeasureConfig[] = [
  {
    key: 'phq9',
    label: 'Patient Health Questionnaire',
    shortLabel: 'PHQ-9',
    description: 'Depression screening',
    timeframe: 'Over the last 2 weeks, how often have you been bothered by the following?',
    questions: PHQ9_QUESTIONS,
    options: PHQ_GAD_OPTIONS,
    offset: 0,
    maxScore: 27,
    scoreFn: (a) => {
      const total = a.reduce((x, y) => x + y, 0)
      let severity = 'Minimal'
      if (total >= 20) severity = 'Severe'
      else if (total >= 15) severity = 'Moderately Severe'
      else if (total >= 10) severity = 'Moderate'
      else if (total >= 5) severity = 'Mild'
      return { total, severity }
    }
  },
  {
    key: 'gad7',
    label: 'Generalized Anxiety Disorder Scale',
    shortLabel: 'GAD-7',
    description: 'Anxiety screening',
    timeframe: 'Over the last 2 weeks, how often have you been bothered by the following?',
    questions: GAD7_QUESTIONS,
    options: PHQ_GAD_OPTIONS,
    offset: 0,
    maxScore: 21,
    scoreFn: (a) => {
      const total = a.reduce((x, y) => x + y, 0)
      let severity = 'Minimal'
      if (total >= 15) severity = 'Severe'
      else if (total >= 10) severity = 'Moderate'
      else if (total >= 5) severity = 'Mild'
      return { total, severity }
    }
  },
  {
    key: 'pss10',
    label: 'Perceived Stress Scale',
    shortLabel: 'PSS-10',
    description: 'Stress assessment',
    timeframe: 'In the last month, how often have you...',
    questions: PSS10_QUESTIONS,
    options: PSS_OPTIONS,
    offset: 0,
    maxScore: 40,
    scoreFn: (a) => {
      const total = a.map((v, i) => PSS10_REVERSED.includes(i) ? 4 - v : v).reduce((x, y) => x + y, 0)
      let severity = 'Low Stress'
      if (total >= 27) severity = 'High Stress'
      else if (total >= 14) severity = 'Moderate Stress'
      return { total, severity }
    }
  },
  {
    key: 'pwb18',
    label: 'Psychological Well-Being Scales',
    shortLabel: 'PWB-18',
    description: 'Psychological well-being',
    timeframe: 'Please indicate how strongly you agree or disagree with each statement.',
    questions: PWB18_QUESTIONS.map(q => q.q),
    options: PWB_OPTIONS,
    offset: 1, // PWB uses 1-7 scale
    maxScore: 126,
    scoreFn: (a) => {
      const domainScores: Record<string, { raw: number; normalized: number }> = {}
      for (const [domain, indices] of Object.entries(PWB18_DOMAINS)) {
        const items = indices.map(i => PWB18_QUESTIONS[i].reversed ? 8 - a[i] : a[i])
        const raw = items.reduce((x, y) => x + y, 0)
        domainScores[domain] = { raw, normalized: Math.round(((raw - 3) / 18) * 100) }
      }
      const norms = Object.values(domainScores).map(d => d.normalized)
      const overall = Math.round(norms.reduce((a, b) => a + b, 0) / norms.length)
      return { total: overall, subscales: domainScores }
    }
  },
]

const TIMEPOINT_CONFIG: Record<string, { label: string; description: string }> = {
  baseline: { label: 'Baseline', description: 'Pre-program measurement' },
  stage_3: { label: 'Midpoint', description: 'Stage 3 measurement' },
  stage_6: { label: 'Completion', description: 'Stage 6 measurement' },
}

// ═══════════════════════════════════════════════════════════════════
// THEME - IOS Dark Design System
// ═══════════════════════════════════════════════════════════════════

const T = {
  bg: '#0a0a0a',
  surface: '#111111',
  card: '#161616',
  cardBorder: '#222222',
  accent: '#ff9e19',
  accentDim: 'rgba(255, 158, 25, 0.08)',
  accentGlow: 'rgba(255, 158, 25, 0.15)',
  text: '#e8e4df',
  textMid: '#999999',
  textDim: '#555555',
  green: '#22c55e',
  greenDim: 'rgba(34, 197, 94, 0.1)',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#a855f7',
  border: '#1e1e1e',
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

type Screen = 'loading' | 'consent' | 'assessment' | 'saving' | 'complete' | 'already_done' | 'error'

export default function ClinicalAssessmentPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  // State
  const [screen, setScreen] = useState<Screen>('loading')
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [timepoint, setTimepoint] = useState<string>('baseline')
  const [currentMeasure, setCurrentMeasure] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [animateIn, setAnimateIn] = useState(true)
  const [consentChecked, setConsentChecked] = useState(false)
  const [existingData, setExistingData] = useState<any>(null)
  const [error, setError] = useState('')
  
  // Timing refs (for research metadata)
  const sessionStartRef = useRef<string | null>(null)
  const measureStartRef = useRef<string | null>(null)
  const [measureTimings, setMeasureTimings] = useState<Record<string, { start: string; end?: string }>>({})

  // ── Auth & Status Check ─────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login?redirect=/clinical-assessment')
        return
      }

      setUserId(session.user.id)

      // Get user name
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', session.user.id)
        .single()
      
      if (profile?.full_name) setUserName(profile.full_name)

      // Check clinical assessment status
      const { data: status } = await supabase
        .rpc('get_clinical_assessment_status', { p_user_id: session.user.id })

      if (status) {
        setExistingData(status)
        
        if (status.next_pending) {
          setTimepoint(status.next_pending)
          setScreen('consent')
        } else {
          // All timepoints complete
          setScreen('already_done')
        }
      } else {
        // No status record - this is their first time
        setTimepoint('baseline')
        setScreen('consent')
      }
    }

    init()
  }, [supabase, router])

  // ── Administration Metadata ─────────────────────────────────
  const getAdminMetadata = () => ({
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    screen_width: typeof window !== 'undefined' ? window.innerWidth : 0,
    screen_height: typeof window !== 'undefined' ? window.innerHeight : 0,
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
    timestamp_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  // ── Start Assessment ────────────────────────────────────────
  const startAssessment = () => {
    const now = new Date().toISOString()
    sessionStartRef.current = now
    measureStartRef.current = now
    setMeasureTimings({ [MEASURES[0].key]: { start: now } })
    setCurrentMeasure(0)
    setCurrentQuestion(0)
    setAnswers({})
    setAnimateIn(true)
    setScreen('assessment')
  }

  // ── Handle Answer ───────────────────────────────────────────
  const handleAnswer = (value: number) => {
    const measure = MEASURES[currentMeasure]
    const key = `${measure.key}_${currentQuestion}`
    const newAnswers = { ...answers, [key]: value }
    setAnswers(newAnswers)

    setAnimateIn(false)
    setTimeout(() => {
      if (currentQuestion < measure.questions.length - 1) {
        // Next question in same measure
        setCurrentQuestion(currentQuestion + 1)
      } else if (currentMeasure < MEASURES.length - 1) {
        // Next measure - record timing for completed measure
        const now = new Date().toISOString()
        const nextMeasure = MEASURES[currentMeasure + 1]
        setMeasureTimings(prev => ({
          ...prev,
          [measure.key]: { ...prev[measure.key], end: now },
          [nextMeasure.key]: { start: now },
        }))
        measureStartRef.current = now
        setCurrentMeasure(currentMeasure + 1)
        setCurrentQuestion(0)
      } else {
        // All measures complete
        const now = new Date().toISOString()
        setMeasureTimings(prev => ({
          ...prev,
          [measure.key]: { ...prev[measure.key], end: now },
        }))
        submitAssessment(newAnswers, now)
      }
      setAnimateIn(true)
    }, 180)
  }

  // ── Handle Back ─────────────────────────────────────────────
  const handleBack = () => {
    setAnimateIn(false)
    setTimeout(() => {
      if (currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1)
      } else if (currentMeasure > 0) {
        const prevMeasure = MEASURES[currentMeasure - 1]
        setCurrentMeasure(currentMeasure - 1)
        setCurrentQuestion(prevMeasure.questions.length - 1)
      }
      setAnimateIn(true)
    }, 180)
  }

  // ── Submit ──────────────────────────────────────────────────
  const submitAssessment = async (finalAnswers: Record<string, number>, completedAt: string) => {
    if (!userId) return
    setScreen('saving')

    try {
      const adminMeta = getAdminMetadata()

      // Create/update session record
      const { data: session, error: sessionError } = await supabase
        .from('clinical_assessment_sessions')
        .upsert({
          user_id: userId,
          timepoint: timepoint,
          session_started_at: sessionStartRef.current,
          session_completed_at: completedAt,
          total_duration_seconds: Math.round(
            (new Date(completedAt).getTime() - new Date(sessionStartRef.current!).getTime()) / 1000
          ),
          is_complete: true,
          measures_completed: MEASURES.map(m => m.key),
          research_consent: consentChecked,
          consent_timestamp: consentChecked ? sessionStartRef.current : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,timepoint' })
        .select()

      if (sessionError) throw sessionError

      // Save each measure individually
      for (const measure of MEASURES) {
        const itemResponses = Array.from(
          { length: measure.questions.length },
          (_, i) => finalAnswers[`${measure.key}_${i}`] ?? 0
        )

        const scored = measure.scoreFn(itemResponses)
        const timing = measureTimings[measure.key] || {}
        const startTime = timing.start || sessionStartRef.current
        const endTime = measure.key === MEASURES[MEASURES.length - 1].key ? completedAt : (timing.end || completedAt)

        const { error: measureError } = await supabase
          .from('clinical_assessments')
          .upsert({
            user_id: userId,
            timepoint: timepoint,
            measure: measure.key,
            item_responses: itemResponses,
            total_score: scored.total,
            subscale_scores: scored.subscales || null,
            severity_label: scored.severity || null,
            started_at: startTime,
            completed_at: endTime,
            duration_seconds: Math.round(
              (new Date(endTime!).getTime() - new Date(startTime!).getTime()) / 1000
            ),
            administration_metadata: adminMeta,
            research_consent: consentChecked,
          }, { onConflict: 'user_id,timepoint,measure' })

        if (measureError) throw measureError
      }

      setScreen('complete')
    } catch (err: any) {
      console.error('Clinical assessment save error:', err)
      setError(err.message || 'Failed to save assessment data.')
      setScreen('error')
    }
  }

  // ── Computed Values ─────────────────────────────────────────
  const totalQuestions = MEASURES.reduce((a, m) => a + m.questions.length, 0)
  const completedQuestions = MEASURES.slice(0, currentMeasure).reduce((a, m) => a + m.questions.length, 0) + currentQuestion
  const progressPct = (completedQuestions / totalQuestions) * 100

  // ═══════════════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════════════

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: T.bg,
    color: T.text,
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 16px',
  }

  const cardStyle: React.CSSProperties = {
    background: T.card,
    border: `1px solid ${T.cardBorder}`,
    borderRadius: 16,
    padding: '32px 28px',
    width: '100%',
    maxWidth: 600,
  }

  const btnPrimary: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    background: T.accent,
    color: '#000',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.2s',
  }

  const btnSecondary: React.CSSProperties = {
    ...btnPrimary,
    background: 'transparent',
    color: T.accent,
    border: `1px solid ${T.accent}`,
  }

  const btnDisabled: React.CSSProperties = {
    ...btnPrimary,
    background: T.cardBorder,
    color: T.textDim,
    cursor: 'default',
  }

  // ═══════════════════════════════════════════════════════════════
  // SCREENS
  // ═══════════════════════════════════════════════════════════════

  // ── Loading ─────────────────────────────────────────────────
  if (screen === 'loading') {
    return (
      <div style={{ ...pageStyle, justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${T.cardBorder}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ color: T.textMid, fontSize: 14 }}>Loading assessment...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── Already Done ────────────────────────────────────────────
  if (screen === 'already_done') {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: 'center', marginTop: 80, marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>All Assessments Complete</h1>
          <p style={{ color: T.textMid, fontSize: 15, maxWidth: 400, margin: '0 auto' }}>
            You've completed all clinical assessments for your current stage. Your next assessment will be available when you reach the next measurement point.
          </p>
        </div>
        <button
          onClick={() => router.push('/chat')}
          style={btnSecondary}
        >
          Return to IOS
        </button>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────
  if (screen === 'error') {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: 'center', marginTop: 80, marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px' }}>Something went wrong</h1>
          <p style={{ color: T.red, fontSize: 14, maxWidth: 400, margin: '0 auto 24px' }}>{error}</p>
          <button onClick={() => setScreen('consent')} style={btnSecondary}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // ── Consent Screen ──────────────────────────────────────────
  if (screen === 'consent') {
    const tpConfig = TIMEPOINT_CONFIG[timepoint]
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: 'center', marginTop: 48, marginBottom: 32 }}>
          <div style={{
            fontSize: 10,
            letterSpacing: 4,
            color: T.accent,
            textTransform: 'uppercase',
            marginBottom: 12,
            fontWeight: 600,
          }}>
            Clinical Assessment
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px', letterSpacing: -0.5 }}>
            {tpConfig.label} Measurement
          </h1>
          <p style={{ color: T.textMid, fontSize: 14, margin: 0 }}>
            {tpConfig.description}
          </p>
        </div>

        <div style={cardStyle}>
          {/* What to expect */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: '0 0 16px', letterSpacing: 0.5 }}>
              What to expect
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MEASURES.map((m, i) => (
                <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: T.accentDim,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: T.accent, flexShrink: 0,
                  }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{m.shortLabel}</div>
                    <div style={{ fontSize: 12, color: T.textDim }}>{m.description} · {m.questions.length} questions</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: '12px 16px', background: T.surface, borderRadius: 10, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>
                <strong style={{ color: T.text }}>{totalQuestions} questions</strong> · Approximately 10–15 minutes.
                Answer honestly with whatever first comes to mind.
              </div>
            </div>
          </div>

          {/* Research consent */}
          <div style={{
            padding: '16px',
            background: T.surface,
            borderRadius: 12,
            border: `1px solid ${T.border}`,
            marginBottom: 28,
          }}>
            <label style={{ display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'flex-start' }}>
              <div
                onClick={() => setConsentChecked(!consentChecked)}
                style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${consentChecked ? T.accent : T.textDim}`,
                  background: consentChecked ? T.accent : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
              >
                {consentChecked && <span style={{ color: '#000', fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
              <div
                onClick={() => setConsentChecked(!consentChecked)}
                style={{ fontSize: 13, color: T.textMid, lineHeight: 1.6, cursor: 'pointer' }}
              >
                <strong style={{ color: T.text }}>Research consent (optional):</strong> I consent to my anonymized assessment data being used for research and program validation purposes. My identity will not be linked to published data.
              </div>
            </label>
          </div>

          {/* Begin button */}
          <button
            onClick={startAssessment}
            style={btnPrimary}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            Begin Assessment
          </button>

          {/* Skip option */}
          <button
            onClick={() => router.push('/chat')}
            style={{
              display: 'block',
              margin: '16px auto 0',
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              color: T.textDim,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            I'll do this later
          </button>
        </div>

        {/* Timepoint indicators */}
        <div style={{ display: 'flex', gap: 32, marginTop: 28 }}>
          {Object.entries(TIMEPOINT_CONFIG).map(([key, config]) => {
            const isComplete = existingData?.[key]?.completed
            const isCurrent = key === timepoint
            return (
              <div key={key} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: `2px solid ${isComplete ? T.green : isCurrent ? T.accent : T.cardBorder}`,
                  background: isComplete ? T.greenDim : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 6px',
                  fontSize: 12, fontWeight: 600,
                  color: isComplete ? T.green : isCurrent ? T.accent : T.textDim,
                }}>
                  {isComplete ? '✓' : key === 'baseline' ? '1' : key === 'stage_3' ? '2' : '3'}
                </div>
                <div style={{ fontSize: 11, color: isCurrent ? T.textMid : T.textDim }}>{config.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Saving ──────────────────────────────────────────────────
  if (screen === 'saving') {
    return (
      <div style={{ ...pageStyle, justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${T.cardBorder}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ color: T.textMid, fontSize: 14 }}>Saving your responses...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── Assessment ──────────────────────────────────────────────
  if (screen === 'assessment') {
    const measure = MEASURES[currentMeasure]
    const question = measure.questions[currentQuestion]
    const answerKey = `${measure.key}_${currentQuestion}`
    const currentAnswer = answers[answerKey]

    return (
      <div style={pageStyle}>
        {/* Progress bar */}
        <div style={{ width: '100%', maxWidth: 600, marginBottom: 8 }}>
          <div style={{ height: 3, background: T.cardBorder, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              width: `${progressPct}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${T.accent}, #ffb84d)`,
              transition: 'width 0.4s ease',
              borderRadius: 2,
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: T.textDim, letterSpacing: 2, textTransform: 'uppercase' }}>
              {TIMEPOINT_CONFIG[timepoint].label}
            </span>
            <span style={{ fontSize: 11, color: T.textDim }}>
              {completedQuestions + 1} of {totalQuestions}
            </span>
          </div>
        </div>

        {/* Measure label */}
        <div style={{ width: '100%', maxWidth: 600, marginBottom: 20, marginTop: 16 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: T.accentDim,
            borderRadius: 20,
          }}>
            <span style={{ fontSize: 12, color: T.accent, fontWeight: 600 }}>
              {measure.shortLabel}
            </span>
            <span style={{ fontSize: 11, color: T.textDim }}>
              {measure.description}
            </span>
          </div>
          <div style={{ fontSize: 13, color: T.textMid, marginTop: 10, lineHeight: 1.5 }}>
            {measure.timeframe}
          </div>
        </div>

        {/* Question card */}
        <div style={{
          ...cardStyle,
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}>
          <div style={{ fontSize: 12, color: T.textDim, marginBottom: 8 }}>
            Question {currentQuestion + 1} of {measure.questions.length}
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 600, margin: '0 0 28px', lineHeight: 1.45, color: T.text }}>
            {question}
          </h2>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {measure.options.map((opt, i) => {
              const value = i + measure.offset
              const isSelected = currentAnswer === value
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 18px',
                    background: isSelected ? T.accentDim : T.surface,
                    border: `1px solid ${isSelected ? T.accent : T.border}`,
                    borderRadius: 12,
                    color: T.text,
                    fontSize: 15,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s, background 0.15s',
                    width: '100%',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = T.accent
                      e.currentTarget.style.background = T.accentDim
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = T.border
                      e.currentTarget.style.background = T.surface
                    }
                  }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    border: `1.5px solid ${isSelected ? T.accent : T.cardBorder}`,
                    background: isSelected ? T.accent : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600,
                    color: isSelected ? '#000' : T.textDim,
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}>
                    {isSelected ? '✓' : value}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>

          {/* Back button */}
          {(currentMeasure > 0 || currentQuestion > 0) && (
            <button
              onClick={handleBack}
              style={{
                marginTop: 20,
                padding: '10px 20px',
                background: 'transparent',
                border: 'none',
                color: T.textDim,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = T.text }}
              onMouseLeave={e => { e.currentTarget.style.color = T.textDim }}
            >
              ← Back
            </button>
          )}
        </div>

        {/* Measure progress dots */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          {MEASURES.map((m, i) => (
            <div key={m.key} style={{
              width: i === currentMeasure ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i < currentMeasure ? T.green : i === currentMeasure ? T.accent : T.cardBorder,
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>
    )
  }

  // ── Complete ────────────────────────────────────────────────
  if (screen === 'complete') {
    // Calculate scores for display
    const scores = MEASURES.map(measure => {
      const itemResponses = Array.from(
        { length: measure.questions.length },
        (_, i) => answers[`${measure.key}_${i}`] ?? 0
      )
      return { ...measure, result: measure.scoreFn(itemResponses) }
    })

    return (
      <div style={pageStyle}>
        <div style={{ textAlign: 'center', marginTop: 48, marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: T.greenDim,
            border: `2px solid ${T.green}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 28,
          }}>✓</div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: T.accent, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
            Assessment Complete
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', letterSpacing: -0.5 }}>
            {TIMEPOINT_CONFIG[timepoint].label} Recorded
          </h1>
          <p style={{ color: T.textMid, fontSize: 14, margin: 0 }}>
            Your responses have been securely saved.
          </p>
        </div>

        {/* Score Summary */}
        <div style={cardStyle}>
          <h3 style={{
            fontSize: 12, fontWeight: 600, color: T.textDim,
            textTransform: 'uppercase', letterSpacing: 2,
            margin: '0 0 20px',
          }}>
            Your Results
          </h3>

          {scores.map(s => {
            const severityColor = s.result.severity?.includes('Severe') ? T.red
              : s.result.severity?.includes('Moderate') || s.result.severity?.includes('High') ? '#f59e0b'
              : s.result.severity?.includes('Mild') ? '#eab308'
              : T.green

            return (
              <div key={s.key} style={{
                padding: '16px 0',
                borderBottom: `1px solid ${T.border}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{s.shortLabel}</span>
                    <span style={{ fontSize: 12, color: T.textDim, marginLeft: 8 }}>{s.description}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 22, fontWeight: 700 }}>{s.result.total}</span>
                    {s.key !== 'pwb18' && (
                      <span style={{ fontSize: 12, color: T.textDim }}>/{s.maxScore}</span>
                    )}
                    {s.key === 'pwb18' && (
                      <span style={{ fontSize: 12, color: T.textDim }}>/100</span>
                    )}
                  </div>
                </div>
                {s.result.severity && (
                  <div style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    color: severityColor,
                    background: `${severityColor}15`,
                  }}>
                    {s.result.severity}
                  </div>
                )}
                {/* PWB-18 domain breakdown */}
                {s.key === 'pwb18' && s.result.subscales && (
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.entries(PWB18_DOMAIN_LABELS).map(([key, label]) => {
                      const val = (s.result.subscales as any)[key]?.normalized ?? 0
                      return (
                        <div key={key} style={{
                          padding: '4px 10px',
                          background: T.surface,
                          borderRadius: 6,
                          fontSize: 11,
                          border: `1px solid ${T.border}`,
                        }}>
                          <span style={{ color: T.textDim }}>{label}: </span>
                          <span style={{ fontWeight: 600 }}>{val}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6, margin: '0 0 8px' }}>
              These scores establish your {TIMEPOINT_CONFIG[timepoint].label.toLowerCase()} measurement.
              {timepoint === 'baseline' && ' Your next assessment will be available at Stage 3.'}
              {timepoint === 'stage_3' && ' Your final assessment will be available at Stage 6.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/chat')}
          style={{ ...btnPrimary, maxWidth: 600, marginTop: 24 }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          Return to IOS
        </button>
      </div>
    )
  }

  return null
}
