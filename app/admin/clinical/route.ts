import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Admin email whitelist - must match your existing admin config
const ADMIN_EMAILS = [
  'nicholas@nicholaskusmich.com',
  'rachel@nicholaskusmich.com',
]

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Auth check
  const { data: { session } } = await supabase.auth.getSession()
  if (!session || !ADMIN_EMAILS.includes(session.user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    // ── Full dashboard data ───────────────────────────────────
    if (action === 'dashboard') {
      const { data, error } = await supabase.rpc('get_admin_clinical_data')
      if (error) throw error
      return NextResponse.json(data)
    }

    // ── Individual user detail ────────────────────────────────
    if (action === 'user_detail') {
      const userId = searchParams.get('user_id')
      if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

      const { data: assessments, error } = await supabase
        .from('clinical_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('timepoint')
        .order('measure')

      if (error) throw error

      const { data: sessions } = await supabase
        .from('clinical_assessment_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('timepoint')

      return NextResponse.json({ assessments, sessions })
    }

    // ── CSV Export ─────────────────────────────────────────────
    if (action === 'export_csv') {
      // Fetch all assessment data with user info
      const { data, error } = await supabase
        .from('clinical_assessments')
        .select(`
          user_id,
          timepoint,
          measure,
          item_responses,
          total_score,
          subscale_scores,
          severity_label,
          started_at,
          completed_at,
          duration_seconds,
          research_consent,
          created_at
        `)
        .order('user_id')
        .order('timepoint')
        .order('measure')

      if (error) throw error

      // Get user names
      const userIds = [...new Set((data || []).map(d => d.user_id))]
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, full_name')
        .in('user_id', userIds)

      const nameMap: Record<string, string> = {}
      profiles?.forEach(p => { nameMap[p.user_id] = p.full_name || 'Unknown' })

      // Build CSV
      const headers = [
        'participant_id', 'participant_name', 'timepoint', 'measure',
        'total_score', 'severity_label', 'duration_seconds',
        'research_consent', 'completed_at',
        // Item-level columns (max 18 for PWB-18)
        ...Array.from({ length: 18 }, (_, i) => `item_${i + 1}`),
        // PWB subscale columns
        'pwb_autonomy', 'pwb_mastery', 'pwb_growth',
        'pwb_relations', 'pwb_purpose', 'pwb_acceptance',
      ]

      const rows = (data || []).map(row => {
        const items = row.item_responses || []
        const subscales = row.subscale_scores || {}
        return [
          row.user_id,
          nameMap[row.user_id] || 'Unknown',
          row.timepoint,
          row.measure,
          row.total_score,
          row.severity_label || '',
          row.duration_seconds || '',
          row.research_consent ? 'yes' : 'no',
          row.completed_at || '',
          ...Array.from({ length: 18 }, (_, i) => items[i] !== undefined ? items[i] : ''),
          subscales.autonomy?.normalized || '',
          subscales.mastery?.normalized || '',
          subscales.growth?.normalized || '',
          subscales.relations?.normalized || '',
          subscales.purpose?.normalized || '',
          subscales.acceptance?.normalized || '',
        ]
      })

      const csv = [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${v}"`).join(',')),
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=ios_clinical_data_${new Date().toISOString().split('T')[0]}.csv`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (err: any) {
    console.error('Admin clinical API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
