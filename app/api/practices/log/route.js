// app/api/practices/log/route.js - SECURED VERSION
import { createClient } from '@supabase/supabase-js';
import {
  verifyAuth,
  unauthorizedResponse,
  rateLimitedResponse,
  badRequestResponse,
} from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { getScheduledPracticeIdsForDate } from '@/app/config/stages';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const STAGE_PRACTICES = {
  1: ['hrvb', 'awareness_rep'],
  2: ['hrvb', 'awareness_rep', 'somatic_flow'],
  3: ['hrvb', 'awareness_rep', 'somatic_flow', 'micro_action'],
  4: ['hrvb', 'awareness_rep', 'somatic_flow', 'micro_action', 'flow_block'],
  5: ['hrvb', 'awareness_rep', 'somatic_flow', 'micro_action', 'flow_block', 'co_regulation'],
  6: ['hrvb', 'awareness_rep', 'somatic_flow', 'micro_action', 'flow_block', 'co_regulation', 'nightly_debrief'],
  7: ['hrvb', 'awareness_rep', 'somatic_flow', 'micro_action', 'flow_block', 'co_regulation', 'nightly_debrief']
};

const VALID_PRACTICES = new Set([
  'hrvb', 'awareness_rep', 'somatic_flow', 'micro_action', 
  'flow_block', 'co_regulation', 'nightly_debrief'
]);

function getStagePractices(stage) {
  return STAGE_PRACTICES[stage] || STAGE_PRACTICES[1];
}

export async function POST(req) {
  try {
    // SECURITY: Get userId from session, NEVER from request body
    const authResult = await verifyAuth();
    
    if (!authResult.authenticated || !authResult.userId) {
      return unauthorizedResponse('Please sign in to log practices.');
    }

    const userId = authResult.userId;

    // Rate limiting
    const rateLimitResult = checkRateLimit(userId, 'practice');
    if (!rateLimitResult.allowed) {
      return rateLimitedResponse(rateLimitResult.blockRemaining || rateLimitResult.resetIn);
    }

    const body = await req.json();
    const { practiceType, completed = true, notes = null, localDate = null } = body;

    // Validate practiceType
    if (!practiceType || !VALID_PRACTICES.has(practiceType)) {
      return badRequestResponse('Invalid practice type');
    }

    // Validate notes
    if (notes !== null && (typeof notes !== 'string' || notes.length > 5000)) {
      return badRequestResponse('Invalid notes format');
    }

    // Validate date format
    if (localDate && !/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
      return badRequestResponse('Invalid date format. Use YYYY-MM-DD.');
    }

    // Get user's current stage
    const { data: progressData, error: progressError } = await supabaseAdmin
      .from('user_progress')
     .select('current_stage, stage_start_date')
      .eq('user_id', userId)
      .single();

    if (progressError && progressError.code === 'PGRST116') {
      await supabaseAdmin
        .from('user_progress')
        .insert({
          user_id: userId,
          current_stage: 1,
          adherence_percentage: 0,
          consecutive_days: 0
        });
    }

    const currentStage = progressData?.current_stage || 1;
    
    // Verify practice is available for user's stage
    const allowedPractices = getStagePractices(currentStage);
    if (!allowedPractices.includes(practiceType)) {
      return badRequestResponse(`${practiceType} is not available at your current stage.`);
    }

    // Determine date
    let today;
    if (localDate && /^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
      today = localDate;
    } else {
      const serverDate = new Date();
      today = serverDate.getFullYear() + '-' + 
        String(serverDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(serverDate.getDate()).padStart(2, '0');
    }
    const now = new Date().toISOString();

    // Check for existing log
    const { data: existingLog } = await supabaseAdmin
      .from('practice_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('practice_type', practiceType)
      .eq('practice_date', today)
      .single();

    let logResult;

    if (existingLog) {
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

      if (error) throw error;
      logResult = data;
    } else {
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

      if (error) throw error;
      logResult = data;
    }

    // ============================================
    // SCHEDULE-AWARE ADHERENCE CALCULATION
    // ============================================
    // Adaptive window based on days in stage
    const stageStartDate = progressData?.stage_start_date 
      ? new Date(progressData.stage_start_date) 
      : null;
    const daysInStage = stageStartDate 
      ? Math.floor((new Date().getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 1;
    const effectiveDays = Math.min(Math.max(daysInStage, 1), 14);

    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - effectiveDays);
    const startDate = windowStart.toISOString().split('T')[0];

    const { data: recentLogs } = await supabaseAdmin
      .from('practice_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('practice_date', startDate)
      .eq('completed', true);

    // Schedule-aware: count expected practices per day based on that day's schedule
    let totalExpected = 0;
    let totalCompleted = 0;
    const todayDate = new Date();

    for (let i = 0; i < effectiveDays; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      // Get only practices SCHEDULED for this specific day of the week
      const scheduledPractices = getScheduledPracticeIdsForDate(currentStage, checkDate);
      totalExpected += scheduledPractices.length;

      // Count completed scheduled practices for this date
      const dayLogs = (recentLogs || []).filter(log => log.practice_date === dateStr);
      const completedPracticeIds = dayLogs.map(log => log.practice_type);

      for (const practiceId of scheduledPractices) {
        if (completedPracticeIds.includes(practiceId)) {
          totalCompleted++;
        }
      }
    }

    const adherencePercentage = totalExpected > 0 
      ? Math.min(100, Math.round((totalCompleted / totalExpected) * 100))
      : 0;

    // ============================================
    // SCHEDULE-AWARE CONSECUTIVE DAYS CALCULATION
    // ============================================
    let consecutiveDays = 0;
    let graceDayUsed = false;
    
    const logsByDate = {};
    (recentLogs || []).forEach(log => {
      if (!logsByDate[log.practice_date]) {
        logsByDate[log.practice_date] = new Set();
      }
      logsByDate[log.practice_date].add(log.practice_type);
    });

    const [year, month, day] = today.split('-').map(Number);
    const checkDate = new Date(year, month - 1, day);
    
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.getFullYear() + '-' + 
        String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(checkDate.getDate()).padStart(2, '0');
      
      // Get only practices SCHEDULED for this specific day
      const scheduledPractices = getScheduledPracticeIdsForDate(currentStage, checkDate);

      // If no practices scheduled this day (future-proofing), skip without breaking streak
      if (scheduledPractices.length === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }

      const dayPractices = logsByDate[dateStr];
      const completedAllScheduled = dayPractices && scheduledPractices.every(p => dayPractices.has(p));
      
      if (completedAllScheduled) {
        consecutiveDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today is incomplete — skip without breaking streak
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else if (!graceDayUsed) {
        graceDayUsed = true;
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }

    // Update progress
    await supabaseAdmin
      .from('user_progress')
      .update({
        adherence_percentage: adherencePercentage,
        consecutive_days: consecutiveDays
      })
      .eq('user_id', userId);

    // ============================================
    // TODAY'S STATUS — SCHEDULE-AWARE
    // ============================================
    const { data: todayLogs } = await supabaseAdmin
      .from('practice_logs')
      .select('practice_type, completed')
      .eq('user_id', userId)
      .eq('practice_date', today)
      .eq('completed', true);

    // Only count practices that are SCHEDULED for today
    const scheduledToday = getScheduledPracticeIdsForDate(currentStage);
    const todayStatus = {};
    scheduledToday.forEach(p => {
      todayStatus[p] = todayLogs?.some(l => l.practice_type === p) || false;
    });

    return Response.json({
      success: true,
      log: logResult,
      progress: {
        adherencePercentage,
        consecutiveDays,
        todayStatus,
        allCompleteToday: scheduledToday.every(p => todayStatus[p])
      }
    });

  } catch (error) {
    console.error('[Practice Log] Error:', error);
    return Response.json(
      { error: 'Failed to log practice. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const authResult = await verifyAuth();
    
    if (!authResult.authenticated || !authResult.userId) {
      return unauthorizedResponse('Please sign in to view practices.');
    }

    const userId = authResult.userId;
    const { searchParams } = new URL(req.url);
    const localDate = searchParams.get('localDate');

    const { data: progressData } = await supabaseAdmin
      .from('user_progress')
      .select('current_stage, adherence_percentage, consecutive_days')
      .eq('user_id', userId)
      .single();

    const currentStage = progressData?.current_stage || 1;
    
    let today;
    if (localDate && /^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
      today = localDate;
    } else {
      const serverDate = new Date();
      today = serverDate.getFullYear() + '-' + 
        String(serverDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(serverDate.getDate()).padStart(2, '0');
    }

    const { data: todayLogs } = await supabaseAdmin
      .from('practice_logs')
      .select('practice_type, completed, completed_at')
      .eq('user_id', userId)
      .eq('practice_date', today);

    // Schedule-aware: only return practices scheduled for the requested date
    const requestedDate = new Date(today + 'T12:00:00'); // noon to avoid timezone issues
    const scheduledToday = getScheduledPracticeIdsForDate(currentStage, requestedDate);
    
    const practices = scheduledToday.map(practiceId => {
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
    return Response.json(
      { error: 'Failed to fetch practices.' },
      { status: 500 }
    );
  }
}
