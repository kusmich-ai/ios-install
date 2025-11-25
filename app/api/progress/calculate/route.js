// app/api/progress/calculate/route.js
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { userId, action } = await req.json();

    if (!userId) {
      return Response.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'recalculate':
        return await recalculateProgress(userId);
      case 'check_unlock':
        return await checkUnlock(userId);
      case 'unlock_stage':
        return await unlockNextStage(userId);
      case 'weekly_delta':
        return await recordWeeklyDelta(userId, await req.json());
      default:
        return await getFullProgress(userId);
    }

  } catch (error) {
    console.error('Progress calculation error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function getFullProgress(userId) {
  // Get user progress
  const { data: progressData, error: progressError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (progressError) {
    throw new Error('Failed to fetch user progress');
  }

  // Get baseline data
  const { data: baselineData, error: baselineError } = await supabase
    .from('baseline_assessments')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (baselineError) {
    console.error('Baseline error:', baselineError);
  }

  // Get latest weekly delta
  const { data: latestDelta, error: deltaError } = await supabase
    .from('weekly_deltas')
    .select('*')
    .eq('user_id', userId)
    .order('week_start_date', { ascending: false })
    .limit(1)
    .single();

  // Calculate REwired Index from baseline or latest delta
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

  // Calculate deltas from baseline
  const baselineScores = {
    regulation: baselineData?.calm_core_score || 0,
    awareness: baselineData?.observer_index_score || 0,
    outlook: baselineData?.vitality_index_score || 0,
    attention: ((baselineData?.focus_diagnostic_score || 0) + (baselineData?.presence_test_score || 0)) / 2
  };

  const deltas = calculateDeltas(baselineScores, domainScores);

  // Check unlock eligibility
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
  // Get current stage
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('current_stage')
    .eq('user_id', userId)
    .single();

  const currentStage = progressData?.current_stage || 1;

  // Get practice logs for last 14 days
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

  // Update user_progress
  const { error: updateError } = await supabase
    .from('user_progress')
    .update({
      adherence_percentage: adherencePercentage,
      consecutive_days: consecutiveDays
    })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  return Response.json({
    success: true,
    adherencePercentage,
    consecutiveDays
  });
}

async function checkUnlock(userId) {
  // Get all necessary data
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
  // First check if eligible
  const unlockCheck = await checkUnlock(userId);
  const unlockData = await unlockCheck.json();

  if (!unlockData.eligible) {
    return Response.json({
      success: false,
      reason: 'Not eligible for unlock',
      missing: unlockData.missing
    });
  }

  // Get current stage
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('current_stage')
    .eq('user_id', userId)
    .single();

  const newStage = progressData.current_stage + 1;

  if (newStage > 7) {
    return Response.json({
      success: false,
      reason: 'Already at maximum stage'
    });
  }

  // Update to new stage
  const { error: updateError } = await supabase
    .from('user_progress')
    .update({
      current_stage: newStage,
      stage_start_date: new Date().toISOString(),
      // Reset consecutive days for new stage
      consecutive_days: 0
    })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  // Get stage unlock message
  const unlockMessages = {
    2: 'Neural Priming stabilized. Heart-mind coherence online. You\'re ready to bring awareness into motion. Embodied Mode unlocked!',
    3: 'Embodiment achieved. The body is now connected awareness. Time to act from coherence. Identity Mode unlocked!',
    4: 'Identity proof installed. You now act from awareness, not toward it. Flow Mode unlocked!',
    5: 'Flow performance stabilized. The mind is no longer the operator - it\'s the tool. Relational Coherence unlocked!',
    6: 'Relational coherence stabilized. You are now connected. Integration Mode unlocked!',
    7: 'System Integration Complete. Welcome, Conductor. The IOS is now self-evolving.'
  };

  return Response.json({
    success: true,
    newStage,
    message: unlockMessages[newStage] || `Stage ${newStage} unlocked!`,
    newPractices: getStagePractices(newStage)
  });
}

async function recordWeeklyDelta(userId, data) {
  const { regulation, awareness, outlook, attention } = data.scores || {};

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
  const weekStartDate = weekStart.toISOString().split('T')[0];

  const averageScore = (regulation + awareness + outlook + attention) / 4;

  // Upsert weekly delta
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
    }, {
      onConflict: 'user_id,week_start_date'
    })
    .select()
    .single();

  if (error) throw error;

  // Update user_progress with latest deltas
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

// GET endpoint for quick progress check
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    return await getFullProgress(userId);

  } catch (error) {
    console.error('GET progress error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
