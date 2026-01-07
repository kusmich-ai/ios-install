// app/api/admin/metrics/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// ============================================
// ADMIN EMAIL WHITELIST
// Add your team's email addresses here
// ============================================
const ADMIN_EMAILS = [
  'nkusmich@nicholaskusmich.com',
  'kayla@nicholaskusmich.com',
  'rachel@nicholaskusmich.com',
  // Add more admin emails as needed
];

// Create Supabase client with service role for admin queries
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get the current user's session
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all dashboard data using the function we created
    const { data: dashboardData, error: dashboardError } = await supabaseAdmin
      .rpc('get_admin_dashboard_data');

    if (dashboardError) {
      console.error('Dashboard data error:', dashboardError);
      
      // Fallback: fetch data from individual views
      const [
        overviewResult,
        stageResult,
        activityResult,
        funnelResult,
        revenueResult,
        signupsResult,
        usersResult
      ] = await Promise.all([
        supabaseAdmin.from('admin_subscription_overview').select('*').single(),
        supabaseAdmin.from('admin_stage_distribution').select('*'),
        supabaseAdmin.from('admin_activity_metrics').select('*').single(),
        supabaseAdmin.from('admin_funnel_metrics').select('*').single(),
        supabaseAdmin.from('admin_revenue_metrics').select('*').single(),
        supabaseAdmin.from('admin_daily_signups').select('*'),
        supabaseAdmin.from('admin_user_details').select('*').limit(50)
      ]);

      return NextResponse.json({
        overview: overviewResult.data,
        stageDistribution: stageResult.data,
        activityMetrics: activityResult.data,
        funnelMetrics: funnelResult.data,
        revenueMetrics: revenueResult.data,
        dailySignups: signupsResult.data,
        recentUsers: usersResult.data
      });
    }

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// POST: Fetch specific user details
// ============================================
export async function POST(req: Request) {
  try {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, action } = await req.json();

    if (action === 'getUserDetails' && userId) {
      // Get detailed user info
      const [progressResult, logsResult, deltasResult, baselineResult] = await Promise.all([
        supabaseAdmin
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabaseAdmin
          .from('practice_logs')
          .select('*')
          .eq('user_id', userId)
          .order('practice_date', { ascending: false })
          .limit(30),
        supabaseAdmin
          .from('weekly_deltas')
          .select('*')
          .eq('user_id', userId)
          .order('week_start', { ascending: false })
          .limit(12),
        supabaseAdmin
          .from('baseline_assessments')
          .select('*')
          .eq('user_id', userId)
          .single()
      ]);

      return NextResponse.json({
        progress: progressResult.data,
        recentPractices: logsResult.data,
        weeklyDeltas: deltasResult.data,
        baseline: baselineResult.data
      });
    }

    if (action === 'updateUserStage' && userId) {
      const { newStage } = await req.json();
      
      const { error } = await supabaseAdmin
        .from('user_progress')
        .update({ 
          current_stage: newStage,
          stage_start_date: new Date().toISOString().split('T')[0]
        })
        .eq('user_id', userId);

      if (error) throw error;
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
