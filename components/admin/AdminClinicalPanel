'use client'

import { useState, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════════
// ADMIN CLINICAL DATA PANEL
// Add this component to your existing /app/admin/page.tsx
// ═══════════════════════════════════════════════════════════════════

// Types
interface MeasureOverview {
  timepoint: string
  measure: string
  participant_count: number
  mean_score: number
  sd_score: number
  min_score: number
  max_score: number
  avg_duration_seconds: number
}

interface UserDetail {
  user_id: string
  user_name: string
  timepoint: string
  measure: string
  total_score: number
  severity_label: string
  completed_at: string
  duration_seconds: number
  delta_from_baseline: number
}

interface ClinicalDashboardData {
  overview: MeasureOverview[] | null
  userDetails: UserDetail[] | null
  totalParticipants: number
  completionRates: {
    baseline: number
    stage_3: number
    stage_6: number
  }
}

const MEASURE_META: Record<string, { label: string; sub: string; maxScore: number; lowerIsBetter: boolean }> = {
  phq9: { label: 'PHQ-9', sub: 'Depression', maxScore: 27, lowerIsBetter: true },
  gad7: { label: 'GAD-7', sub: 'Anxiety', maxScore: 21, lowerIsBetter: true },
  pss10: { label: 'PSS-10', sub: 'Stress', maxScore: 40, lowerIsBetter: true },
  pwb18: { label: 'PWB-18', sub: 'Well-Being', maxScore: 100, lowerIsBetter: false },
}

const TIMEPOINT_LABELS: Record<string, string> = {
  baseline: 'Baseline',
  stage_3: 'Stage 3',
  stage_6: 'Stage 6',
}

// Severity colors
function getSeverityColor(label: string | null): string {
  if (!label) return '#999'
  if (label.includes('Severe')) return '#ef4444'
  if (label.includes('Moderate') || label.includes('High')) return '#f59e0b'
  if (label.includes('Mild')) return '#eab308'
  return '#22c55e' // Minimal, Low
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function AdminClinicalPanel() {
  const [data, setData] = useState<ClinicalDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/clinical?action=dashboard')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/admin/clinical?action=export_csv')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ios_clinical_data_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
    }
    setExporting(false)
  }

  // ── Theme (matching your existing admin dark theme) ─────────
  const T = {
    bg: '#0a0a0a',
    card: '#161616',
    cardBorder: '#222222',
    accent: '#ff9e19',
    accentDim: 'rgba(255, 158, 25, 0.08)',
    text: '#e8e4df',
    textMid: '#999',
    textDim: '#555',
    green: '#22c55e',
    greenDim: 'rgba(34, 197, 94, 0.1)',
    red: '#ef4444',
    redDim: 'rgba(239, 68, 68, 0.1)',
    border: '#1e1e1e',
    surface: '#111111',
  }

  const cardStyle: React.CSSProperties = {
    background: T.card,
    border: `1px solid ${T.cardBorder}`,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: T.textDim,
    textTransform: 'uppercase',
    letterSpacing: 2,
    margin: '0 0 16px',
  }

  if (loading) {
    return (
      <div style={cardStyle}>
        <h3 style={sectionLabel}>Clinical Assessments</h3>
        <div style={{ color: T.textDim, fontSize: 14 }}>Loading clinical data...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={cardStyle}>
        <h3 style={sectionLabel}>Clinical Assessments</h3>
        <div style={{ color: T.red, fontSize: 14 }}>
          {error || 'No data available. Clinical assessments table may not be set up yet.'}
        </div>
      </div>
    )
  }

  // Group user details by user
  const userMap: Record<string, { name: string; measures: UserDetail[] }> = {}
  data.userDetails?.forEach(d => {
    if (!userMap[d.user_id]) {
      userMap[d.user_id] = { name: d.user_name, measures: [] }
    }
    userMap[d.user_id].measures.push(d)
  })

  return (
    <div>
      {/* ── Header with Export ──────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: T.text }}>Clinical Assessments</h2>
          <div style={{ fontSize: 13, color: T.textMid, marginTop: 4 }}>
            PHQ-9 · GAD-7 · PSS-10 · PWB-18
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: `1px solid ${T.accent}`,
            borderRadius: 10,
            color: T.accent,
            fontSize: 13,
            fontWeight: 600,
            cursor: exporting ? 'default' : 'pointer',
            opacity: exporting ? 0.5 : 1,
          }}
        >
          {exporting ? 'Exporting...' : '📄 Export CSV'}
        </button>
      </div>

      {/* ── Completion Stats ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, color: T.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Total Participants
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: T.accent }}>{data.totalParticipants}</div>
        </div>
        {(['baseline', 'stage_3', 'stage_6'] as const).map(tp => (
          <div key={tp} style={cardStyle}>
            <div style={{ fontSize: 11, color: T.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              {TIMEPOINT_LABELS[tp]} Complete
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: T.text }}>
              {data.completionRates[tp]}
            </div>
          </div>
        ))}
      </div>

      {/* ── Aggregate Means by Measure × Timepoint ─────────────── */}
      {data.overview && data.overview.length > 0 && (
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px 8px' }}>
            <h3 style={sectionLabel}>Cohort Means</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
                  <th style={{ padding: '10px 24px', textAlign: 'left', fontSize: 11, color: T.textDim }}>Measure</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 11, color: T.textDim }}>Timepoint</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 11, color: T.textDim }}>N</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 11, color: T.textDim }}>Mean (SD)</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 11, color: T.textDim }}>Range</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 11, color: T.textDim }}>Avg Duration</th>
                </tr>
              </thead>
              <tbody>
                {data.overview.map((row, i) => {
                  const meta = MEASURE_META[row.measure]
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: '12px 24px' }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{meta?.label || row.measure}</span>
                        <span style={{ fontSize: 12, color: T.textDim, marginLeft: 8 }}>{meta?.sub}</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13 }}>
                        {TIMEPOINT_LABELS[row.timepoint]}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, color: T.textMid }}>
                        {row.participant_count}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{row.mean_score}</span>
                        <span style={{ fontSize: 12, color: T.textDim }}> (±{row.sd_score || 0})</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, color: T.textMid }}>
                        {row.min_score}–{row.max_score}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, color: T.textDim }}>
                        {row.avg_duration_seconds ? `${Math.round(row.avg_duration_seconds)}s` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Individual User Score Cards ─────────────────────────── */}
      <div style={cardStyle}>
        <h3 style={sectionLabel}>Individual Participants</h3>
        
        {Object.keys(userMap).length === 0 ? (
          <div style={{ color: T.textDim, fontSize: 14, textAlign: 'center', padding: 20 }}>
            No clinical assessments completed yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(userMap).map(([userId, user]) => {
              const isExpanded = expandedUser === userId
              // Get baseline and latest scores per measure
              const scoresByMeasure: Record<string, { baseline?: number; latest?: number; latestSeverity?: string; delta?: number }> = {}
              
              user.measures.forEach(m => {
                if (!scoresByMeasure[m.measure]) scoresByMeasure[m.measure] = {}
                if (m.timepoint === 'baseline') {
                  scoresByMeasure[m.measure].baseline = m.total_score
                }
                // Always update latest (since they come ordered by timepoint)
                scoresByMeasure[m.measure].latest = m.total_score
                scoresByMeasure[m.measure].latestSeverity = m.severity_label
                scoresByMeasure[m.measure].delta = m.delta_from_baseline
              })

              const timepoints = [...new Set(user.measures.map(m => m.timepoint))]

              return (
                <div key={userId} style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  {/* User header - always visible */}
                  <div
                    onClick={() => setExpandedUser(isExpanded ? null : userId)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 20px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: T.accentDim,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: T.accent,
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: T.textDim }}>
                          {timepoints.map(tp => TIMEPOINT_LABELS[tp]).join(' · ')}
                        </div>
                      </div>
                    </div>

                    {/* Quick score badges */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {Object.entries(scoresByMeasure).map(([measure, scores]) => {
                        const meta = MEASURE_META[measure]
                        if (!meta) return null
                        const delta = scores.delta || 0
                        const isImprovement = meta.lowerIsBetter ? delta < 0 : delta > 0
                        const hasDelta = timepoints.length > 1 && delta !== 0
                        
                        return (
                          <div key={measure} style={{
                            padding: '4px 10px',
                            background: T.card,
                            borderRadius: 8,
                            border: `1px solid ${T.cardBorder}`,
                            fontSize: 12,
                            textAlign: 'center',
                          }}>
                            <div style={{ color: T.textDim, fontSize: 10 }}>{meta.label}</div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>
                              {scores.latest}
                              {hasDelta && (
                                <span style={{
                                  color: isImprovement ? T.green : T.red,
                                  fontSize: 11,
                                  marginLeft: 4,
                                }}>
                                  {delta > 0 ? '↑' : '↓'}{Math.abs(delta)}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      <span style={{ color: T.textDim, fontSize: 16, marginLeft: 4 }}>
                        {isExpanded ? '▾' : '▸'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ padding: '0 20px 16px', borderTop: `1px solid ${T.border}` }}>
                      <div style={{ overflowX: 'auto', marginTop: 12 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '8px 0', textAlign: 'left', fontSize: 11, color: T.textDim }}>Measure</th>
                              {timepoints.map(tp => (
                                <th key={tp} style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, color: T.accent }}>{TIMEPOINT_LABELS[tp]}</th>
                              ))}
                              {timepoints.length > 1 && (
                                <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, color: T.green }}>Δ Change</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(MEASURE_META).map(([measure, meta]) => {
                              const userMeasures = user.measures.filter(m => m.measure === measure)
                              if (userMeasures.length === 0) return null
                              return (
                                <tr key={measure} style={{ borderTop: `1px solid ${T.border}` }}>
                                  <td style={{ padding: '10px 0' }}>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{meta.label}</div>
                                    <div style={{ fontSize: 11, color: T.textDim }}>{meta.sub}</div>
                                  </td>
                                  {timepoints.map(tp => {
                                    const m = userMeasures.find(x => x.timepoint === tp)
                                    if (!m) return <td key={tp} style={{ padding: '10px 12px', textAlign: 'center', color: T.textDim }}>—</td>
                                    return (
                                      <td key={tp} style={{ padding: '10px 12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 16, fontWeight: 700 }}>{m.total_score}</div>
                                        {m.severity_label && (
                                          <div style={{
                                            fontSize: 10,
                                            color: getSeverityColor(m.severity_label),
                                            fontWeight: 600,
                                          }}>{m.severity_label}</div>
                                        )}
                                      </td>
                                    )
                                  })}
                                  {timepoints.length > 1 && (() => {
                                    const latest = userMeasures[userMeasures.length - 1]
                                    const delta = latest?.delta_from_baseline || 0
                                    const isGood = meta.lowerIsBetter ? delta < 0 : delta > 0
                                    return (
                                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                        <span style={{
                                          fontWeight: 700,
                                          fontSize: 14,
                                          color: delta === 0 ? T.textDim : isGood ? T.green : T.red,
                                        }}>
                                          {delta > 0 ? '↑' : delta < 0 ? '↓' : '—'}{delta !== 0 ? Math.abs(delta) : ''}
                                        </span>
                                      </td>
                                    )
                                  })()}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
