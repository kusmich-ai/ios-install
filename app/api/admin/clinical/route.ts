// app/api/admin/clinical/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Admin email whitelist - must match your existing admin config
const ADMIN_EMAILS = [
  'nkusmich@nicholaskusmich.com',
  'kayla@nicholaskusmich.com',
  'rachel@nicholaskusmich.com',
];

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  // Auth check
  const user = await getAuthenticatedUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = getAdminClient();
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    // ── Full dashboard data ───────────────────────────────────
    if (action === 'dashboard') {
      const { data, error } = await supabase.rpc('get_admin_clinical_data');
      if (error) throw error;
      return NextResponse.json(data);
    }

    // ── Individual user detail ────────────────────────────────
    if (action === 'user_detail') {
      const userId = searchParams.get('user_id');
      if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

      const { data: assessments, error } = await supabase
        .from('clinical_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('timepoint')
        .order('measure');

      if (error) throw error;

      const { data: sessions } = await supabase
        .from('clinical_assessment_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('timepoint');

      return NextResponse.json({ assessments, sessions });
    }

    // ── CSV Export ─────────────────────────────────────────────
    if (action === 'export_csv') {
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
        .order('measure');

      if (error) throw error;

      // Get user names
      const userIds = [...new Set((data || []).map(d => d.user_id))];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', userIds);

      const nameMap: Record<string, string> = {};
      profiles?.forEach(p => { nameMap[p.id] = p.full_name || 'Unknown'; });

      // Build CSV
      const headers = [
        'participant_id', 'participant_name', 'timepoint', 'measure',
        'total_score', 'severity_label', 'duration_seconds',
        'research_consent', 'completed_at',
        ...Array.from({ length: 18 }, (_, i) => `item_${i + 1}`),
        'pwb_autonomy', 'pwb_mastery', 'pwb_growth',
        'pwb_relations', 'pwb_purpose', 'pwb_acceptance',
      ];

      const rows = (data || []).map(row => {
        const items = row.item_responses || [];
        const subscales = row.subscale_scores || {};
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
        ];
      });

      const csv = [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${v}"`).join(',')),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=ios_clinical_data_${new Date().toISOString().split('T')[0]}.csv`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use: dashboard, user_detail, export_csv' }, { status: 400 });

  } catch (err: any) {
    console.error('Admin clinical API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
