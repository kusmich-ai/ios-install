// app/api/progress/calculate/route.js - SECURED VERSION
import { createClient } from '@supabase/supabase-js';
import { 
  calculateAdherence, 
  calculateConsecutiveDays,
  calculateDeltas,
  calculateRewiredIndex,
  getTier,
  checkUnlockEligibility,
  getStagePractices
} from '@/lib/progress-utils';
import {
  verifyAuth,
  unauthorizedResponse,
  rateLimitedResponse,
  badRequestResponse,
  logAuditEvent,
} from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/rateLimit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VALID_ACTIONS = new Set(['recalculate', 'check_unlock', 'unlock_stage', 'weekly_delta']);

export async function POST(req) {
  try {
    // SECURITY: Get userId from session only
    const authResult = await verifyAuth();
    
    if (!authResult.authenticated || !authResult.userId) {
      return unauthorizedResponse('Please sign in to view progress.');
    }

    const userId = authResult.userId;

    // Rate limiting
    const rateLimitResult = checkRateLimit(userId, 'progress');
    if (!rateLimitResult.allowed) {
      return rateLimitedResponse(rateLimitResult.blockRemaining || rateLimitResult.resetIn);
    }

    const body = await req.json();
    const { action } = body;

    if (action && !VALID_ACTIONS.has(action)) {
      return badRequestResponse('Invalid action');
    }

    switch (action) {
      case 'recalculate':
        return await recalculateProgress(userId);
      case 'check_unlock':
        return await checkUnlock(userId);
      case 'unlock_stage':
        return await unlockNextStage(userId);
      case 'weekly_delta':
        const { scores } = body;
        if (!scores || typeof scores !== 'object') {
          return badRequestResponse('Missing or invalid scores');
        }
        const { regulation, awareness, outlook, attention } = scores;
        if (
          typeof regulation !== 'number' || regulation < 0 || regulation > 5 ||
          typeof awareness !== 'number' || awareness < 0 || awareness > 5 ||
          typeof outlook !== 'number' || outlook < 0 || outlook > 5 ||
          typeof attention !== 'number' || attention < 0 || attention > 5
        ) {
          return badRequestResponse('Invalid score values. Must be 0-5.');
        }
        return await recordWeeklyDelta(userId, scores);
      default:
        return await getFullProgress(userId);
    }

  } catch (error) {
    console.error('[Progress] Error:', error);
    return Response.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}

async function getFullProgress(userId) {
  const { data: progressData, error: progressError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (progressError) throw new Error('Failed to fetch user progress');

  const { data: baselineData } = await supabase
    .from('baseline_assessments')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: latestDelta } = await supabase
    .from('weekly_deltas')
    .select('*')
    .eq('user_id', userId)
    .order('week_start_date', { ascending: false })
    .limit(1)
    .single();

  const domainScores = latestDelta ? {
    regulation: latestDelta.regulation_score,
    awareness: latestDelta.awareness_score,
    outlook: latestDelta.outlook_score,
    attention: latestDelta.attention_score
  } : {
    regulation: baselineData?.calm_core_score || 0,
    awareness: baselineData?.observer_index_score || 0,
    outlook: baselineData?.vitality_index_score || 0,
    attention: ((baselineData?.focus_diagnostic_score || 0) + (baselineData?.presence_test_score || 0)) / 2
  };

  const rewiredIndex = calculateRewiredIndex(domainScores);
  const tier = getTier(rewiredIndex);

  const baselineScores = {
    regulation: baselineData?.calm_core_score || 0,
    awareness: baselineData?.observer_index_score || 0,
    outlook: baselineData?.vitality_index_score || 0,
    attention: ((baselineData?.focus_diagnostic_score || 0) + (baselineData?.presence_test_score || 0)) / 2
  };

  const deltas = calculateDeltas(baselineScores, domainScores);

  const unlockStatus = checkUnlockEligibility({
    currentStage: progressData.current_stage,
    adherencePercentage: progressData.adherence_percentage,
    consecutiveDays: progressData.consecutive_days,
    deltas,
    baselineScores,
    currentScores: domainScores
  });

  return Response.json({
    progress: {
      currentStage: progressData.current_stage,
      stageStartDate: progressData.stage_start_date,
      adherencePercentage: progressData.adherence_percentage,
      consecutiveDays: progressData.consecutive_days
    },
    scores: {
      rewiredIndex,
      tier: tier.name,
      tierDescription: tier.description,
      domainScores,
      deltas
    },
    unlock: unlockStatus,
    practices: getStagePractices(progressData.current_stage)
  });
}

async function recalculateProgress(userId) {
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('current_stage')
    .eq('user_id', userId)
    .single();

  const currentStage = progressData?.current_stage || 1;

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const startDate = fourteenDaysAgo.toISOString().split('T')[0];

  const { data: recentLogs } = await supabase
    .from('practice_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('practice_date', startDate)
    .order('practice_date', { ascending: false });

  const adherencePercentage = calculateAdherence(recentLogs || [], currentStage, 14);
  const consecutiveDays = calculateConsecutiveDays(recentLogs || [], currentStage);

  await supabase
    .from('user_progress')
    .update({
      adherence_percentage: adherencePercentage,
      consecutive_days: consecutiveDays
    })
    .eq('user_id', userId);

  return Response.json({ success: true, adherencePercentage, consecutiveDays });
}

async function checkUnlock(userId) {
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: baselineData } = await supabase
    .from('baseline_assessments')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: latestDelta } = await supabase
    .from('weekly_deltas')
    .select('*')
    .eq('user_id', userId)
    .order('week_start_date', { ascending: false })
    .limit(1)
    .single();

  const baselineScores = {
    regulation: baselineData?.calm_core_score || 0,
    awareness: baselineData?.observer_index_score || 0,
    outlook: baselineData?.vitality_index_score || 0,
    attention: ((baselineData?.focus_diagnostic_score || 0) + (baselineData?.presence_test_score || 0)) / 2
  };

  const currentScores = latestDelta ? {
    regulation: latestDelta.regulation_score,
    awareness: latestDelta.awareness_score,
    outlook: latestDelta.outlook_score,
    attention: latestDelta.attention_score
  } : baselineScores;

  const deltas = calculateDeltas(baselineScores, currentScores);

  const unlockStatus = checkUnlockEligibility({
    currentStage: progressData.current_stage,
    adherencePercentage: progressData.adherence_percentage,
    consecutiveDays: progressData.consecutive_days,
    deltas,
    baselineScores,
    currentScores
  });

  return Response.json(unlockStatus);
}

async function unlockNextStage(userId) {
  const unlockCheck = await checkUnlock(userId);
  const unlockData = await unlockCheck.json();

  if (!unlockData.eligible) {
    return Response.json({
      success: false,
      reason: 'Not eligible for unlock',
      missing: unlockData.missing
    });
  }

  const { data: progressData } = await supabase
    .from('user_progress')
    .select('current_stage')
    .eq('user_id', userId)
    .single();

  const newStage = progressData.current_stage + 1;

  if (newStage > 7) {
    return Response.json({ success: false, reason: 'Already at maximum stage' });
  }

  if (newStage === 7) {
    await logAuditEvent({
      userId,
      action: 'STAGE_7_UNLOCK_REQUEST',
      details: { currentStage: progressData.current_stage },
    });
    return Response.json({
      success: false,
      reason: 'Stage 7 requires application and manual approval.',
      requiresApproval: true
    });
  }

  await supabase
    .from('user_progress')
    .update({
      current_stage: newStage,
      stage_start_date: new Date().toISOString(),
      consecutive_days: 0
    })
    .eq('user_id', userId);

  await logAuditEvent({
    userId,
    action: 'STAGE_UNLOCK',
    details: { previousStage: progressData.current_stage, newStage },
  });

  const unlockMessages = {
    2: 'Neural Priming stabilized. Heart-mind coherence online. Embodied Mode unlocked!',
    3: 'Embodiment achieved. Identity Mode unlocked!',
    4: 'Identity proof installed. Flow Mode unlocked!',
    5: 'Flow performance stabilized. Relational Coherence unlocked!',
    6: 'Relational coherence stabilized. Integration Mode unlocked!',
    7: 'System Integration Complete. Welcome, Conductor.'
  };

  return Response.json({
    success: true,
    newStage,
    message: unlockMessages[newStage] || `Stage ${newStage} unlocked!`,
    newPractices: getStagePractices(newStage)
  });
}

async function recordWeeklyDelta(userId, scores) {
  const { regulation, awareness, outlook, attention } = scores;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartDate = weekStart.toISOString().split('T')[0];

  const averageScore = (regulation + awareness + outlook + attention) / 4;

  const { data: deltaData, error } = await supabase
    .from('weekly_deltas')
    .upsert({
      user_id: userId,
      week_start_date: weekStartDate,
      regulation_score: regulation,
      awareness_score: awareness,
      outlook_score: outlook,
      attention_score: attention,
      average_score: averageScore
    }, { onConflict: 'user_id,week_start_date' })
    .select()
    .single();

  if (error) throw error;

  const { data: baselineData } = await supabase
    .from('baseline_assessments')
    .select('*')
    .eq('user_id', userId)
    .single();

  const baselineScores = {
    regulation: baselineData?.calm_core_score || 0,
    awareness: baselineData?.observer_index_score || 0,
    outlook: baselineData?.vitality_index_score || 0,
    attention: ((baselineData?.focus_diagnostic_score || 0) + (baselineData?.presence_test_score || 0)) / 2
  };

  const currentScores = { regulation, awareness, outlook, attention };
  const deltas = calculateDeltas(baselineScores, currentScores);

  await supabase
    .from('user_progress')
    .update({
      regulation_delta: deltas.regulation,
      awareness_delta: deltas.awareness,
      outlook_delta: deltas.outlook,
      attention_delta: deltas.attention
    })
    .eq('user_id', userId);

  return Response.json({
    success: true,
    weeklyDelta: deltaData,
    deltas,
    rewiredIndex: calculateRewiredIndex(currentScores)
  });
}

export async function GET(req) {
  try {
    const authResult = await verifyAuth();
    
    if (!authResult.authenticated || !authResult.userId) {
      return unauthorizedResponse('Please sign in to view progress.');
    }

    return await getFullProgress(authResult.userId);

  } catch (error) {
    console.error('[Progress GET] Error:', error);
    return Response.json({ error: 'Failed to fetch progress.' }, { status: 500 });
  }
}
