// app/api/practices/log/route.js
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Stage practices mapping
const STAGE_PRACTICES = {
  1: ['hrvb', 'awareness_rep'],
  2: ['hrvb', 'awareness_rep', 'somatic_flow'],
  3: ['hrvb', 'awareness_rep', 'somatic_flow', 'micro_action'],
  4: ['hrvb', 'awareness_rep', 'somatic_flow', 'micro_action', 'flow_block'],
  5: ['hrvb', 'awareness_rep', 'somatic_flow', 'micro_action', 'flow_block', 'co_regulation'],
  6: ['hrvb', 'awareness_rep', 'somatic_flow', 'micro_action', 'flow_block', 'co_regulation', 'nightly_debrief'],
  7: ['hrvb', 'awareness_rep', 'somatic_flow', 'micro_action', 'flow_block', 'co_regulation', 'nightly_debrief']
};

function getStagePractices(stage) {
  return STAGE_PRACTICES[stage] || STAGE_PRACTICES[1];
}

export async function POST(req) {
  try {
    const body = await req.json();
    let { userId, practiceType, completed = true, notes = null, localDate = null } = body;

    console.log('[Practice Log] Received:', { userId, practiceType, completed, localDate });

    // If no userId provided, try to get from session
    if (!userId) {
      try {
        const cookieStore = await cookies();
        
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            cookies: {
              getAll() {
                return cookieStore.getAll();
              },
            },
          }
        );
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        console.log('[Practice Log] Session user:', user?.id, 'Error:', authError?.message);
        
        if (user) {
          userId = user.id;
        }
      } catch (sessionError) {
        console.error('[Practice Log] Session error:', sessionError);
      }
    }

    // Final validation
    if (!userId) {
      return Response.json(
        { error: 'Not authenticated. Please log in.', debug: 'No userId from body or session' },
        { status: 401 }
      );
    }

    if (!practiceType) {
      return Response.json(
        { error: 'Missing practiceType' },
        { status: 400 }
      );
    }

    console.log('[Practice Log] Logging practice for user:', userId, 'type:', practiceType);

    // Get user's current stage
    const { data: progressData, error: progressError } = await supabaseAdmin
      .from('user_progress')
      .select('current_stage')
      .eq('user_id', userId)
      .single();

    if (progressError) {
      console.error('[Practice Log] Progress fetch error:', progressError);
      // If no progress record exists, create one
      if (progressError.code === 'PGRST116') {
        const { error: insertError } = await supabaseAdmin
          .from('user_progress')
          .insert({
            user_id: userId,
            current_stage: 1,
            adherence_percentage: 0,
            consecutive_days: 0
          });
        if (insertError) {
          console.error('[Practice Log] Failed to create progress:', insertError);
        }
      }
    }

    const currentStage = progressData?.current_stage || 1;
    
    // Use client-provided local date if available, otherwise fall back to server date
    // Client should send date in YYYY-MM-DD format based on their local timezone
    let today;
    if (localDate && /^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
      today = localDate;
      console.log('[Practice Log] Using client-provided date:', today);
    } else {
      // Fallback to server time (UTC on Vercel)
      // WARNING: This will be wrong for users not in UTC timezone!
      const serverDate = new Date();
      today = serverDate.getFullYear() + '-' + 
        String(serverDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(serverDate.getDate()).padStart(2, '0');
      console.log('[Practice Log] WARNING: Using server date (UTC fallback):', today);
    }
    const now = new Date().toISOString();

    console.log('[Practice Log] Stage:', currentStage, 'Date:', today);

    // Check for existing log today
    const { data: existingLog } = await supabaseAdmin
      .from('practice_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('practice_type', practiceType)
      .eq('practice_date', today)
      .single();

    let logResult;

    if (existingLog) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from('practice_logs')
        .update({
          completed,
          completed_at: completed ? now : null,
          notes
        })
        .eq('id', existingLog.id)
        .select()
        .single();

      if (error) {
        console.error('[Practice Log] Update error:', error);
        throw error;
      }
      logResult = data;
      console.log('[Practice Log] Updated existing log:', logResult.id);
    } else {
      // Insert new
      const { data, error } = await supabaseAdmin
        .from('practice_logs')
        .insert({
          user_id: userId,
          practice_type: practiceType,
          stage: currentStage,
          completed,
          completed_at: completed ? now : null,
          practice_date: today,
          notes
        })
        .select()
        .single();

      if (error) {
        console.error('[Practice Log] Insert error:', error);
        throw error;
      }
      logResult = data;
      console.log('[Practice Log] Created new log:', logResult.id);
    }

    // Calculate adherence
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const startDate = fourteenDaysAgo.toISOString().split('T')[0];

    const { data: recentLogs } = await supabaseAdmin
      .from('practice_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('practice_date', startDate)
      .eq('completed', true);

    const requiredPractices = getStagePractices(currentStage);
    const totalRequired = requiredPractices.length * 14;
    const completedCount = recentLogs?.length || 0;
    const adherencePercentage = totalRequired > 0 
      ? Math.min(100, Math.round((completedCount / totalRequired) * 100))
      : 0;

    // Calculate consecutive days with 1-DAY GRACE PERIOD
    // Grace period: Missing 1 day pauses the streak (doesn't reset it)
    // Missing 2+ consecutive days resets the streak
    let consecutiveDays = 0;
    let graceDayUsed = false; // Track if we've used the 1-day grace
    
    const logsByDate = {};
    (recentLogs || []).forEach(log => {
      if (!logsByDate[log.practice_date]) {
        logsByDate[log.practice_date] = new Set();
      }
      logsByDate[log.practice_date].add(log.practice_type);
    });

    // Start from today (client's local date) and work backwards
    // Parse the today string to create a date object for iteration
    const [year, month, day] = today.split('-').map(Number);
    const checkDate = new Date(year, month - 1, day); // month is 0-indexed
    
    for (let i = 0; i < 14; i++) {
      const dateStr = checkDate.getFullYear() + '-' + 
        String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(checkDate.getDate()).padStart(2, '0');
      const dayPractices = logsByDate[dateStr];
      const completedAllPractices = dayPractices && requiredPractices.every(p => dayPractices.has(p));
      
      if (completedAllPractices) {
        // Full day completed - add to streak
        consecutiveDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today can be incomplete - don't break streak, just skip today
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else if (!graceDayUsed) {
        // First missed day - use grace period (streak pauses but doesn't reset)
        graceDayUsed = true;
        checkDate.setDate(checkDate.getDate() - 1);
        console.log('[Practice Log] Grace day used for:', dateStr);
        continue;
      } else {
        // Second consecutive missed day - break the streak
        console.log('[Practice Log] Streak broken at:', dateStr, '(grace already used)');
        break;
      }
    }
    
    console.log('[Practice Log] Streak calculation:', { consecutiveDays, graceDayUsed });

    // Update user_progress
    await supabaseAdmin
      .from('user_progress')
      .update({
        adherence_percentage: adherencePercentage,
        consecutive_days: consecutiveDays
      })
      .eq('user_id', userId);

    // Get today's status
    const { data: todayLogs } = await supabaseAdmin
      .from('practice_logs')
      .select('practice_type, completed')
      .eq('user_id', userId)
      .eq('practice_date', today)
      .eq('completed', true);

    const todayStatus = {};
    requiredPractices.forEach(p => {
      todayStatus[p] = todayLogs?.some(l => l.practice_type === p) || false;
    });

    const allCompleteToday = requiredPractices.every(p => todayStatus[p]);

    console.log('[Practice Log] Success! Adherence:', adherencePercentage, 'Streak:', consecutiveDays);

    return Response.json({
      success: true,
      log: logResult,
      progress: {
        adherencePercentage,
        consecutiveDays,
        todayStatus,
        allCompleteToday
      }
    });

  } catch (error) {
    console.error('[Practice Log] Error:', error);
    return Response.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');
    const localDate = searchParams.get('localDate'); // Accept client's local date

    // Try to get from session if not provided
    if (!userId) {
      try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            cookies: {
              getAll() {
                return cookieStore.getAll();
              },
            },
          }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;
      } catch (e) {
        console.error('[Practice Log GET] Session error:', e);
      }
    }

    if (!userId) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: progressData } = await supabaseAdmin
      .from('user_progress')
      .select('current_stage, adherence_percentage, consecutive_days')
      .eq('user_id', userId)
      .single();

    const currentStage = progressData?.current_stage || 1;
    
    // Use client-provided local date if available, otherwise fall back to server date
    // IMPORTANT: Server runs in UTC, so without localDate, this will be wrong for non-UTC users
    let today;
    if (localDate && /^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
      today = localDate;
      console.log('[Practice Log GET] Using client-provided date:', today);
    } else {
      // Fallback to server time (UTC on Vercel)
      // WARNING: This will be wrong for users not in UTC timezone!
      const serverDate = new Date();
      today = serverDate.getFullYear() + '-' + 
        String(serverDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(serverDate.getDate()).padStart(2, '0');
      console.log('[Practice Log GET] WARNING: Using server date (UTC fallback):', today);
    }

    const { data: todayLogs } = await supabaseAdmin
      .from('practice_logs')
      .select('practice_type, completed, completed_at')
      .eq('user_id', userId)
      .eq('practice_date', today);

    const requiredPractices = getStagePractices(currentStage);
    const practices = requiredPractices.map(practiceId => {
      const log = todayLogs?.find(l => l.practice_type === practiceId);
      return {
        id: practiceId,
        completed: log?.completed || false,
        completedAt: log?.completed_at || null
      };
    });

    return Response.json({
      currentStage,
      practices,
      adherencePercentage: progressData?.adherence_percentage || 0,
      consecutiveDays: progressData?.consecutive_days || 0,
      allCompleteToday: practices.every(p => p.completed)
    });

  } catch (error) {
    console.error('[Practice Log GET] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
