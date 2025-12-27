// app/api/stage/unlock/route.ts
// Protected stage unlock endpoint - prevents bypassing progression

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { withProtection, validateStageProgression, withRateLimit } from '@/lib/api-protection';
import { canAccessStage } from '@/lib/access-control';

const FREE_STAGE_LIMIT = 1;

export const POST = withProtection(
  async (req: NextRequest, { userId }) => {
    // Strict rate limiting on unlock attempts - 5 per hour
    const rateLimitResponse = withRateLimit(`unlock:${userId}`, 5, 3600000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const { targetStage } = body;

    // Validate target stage
    if (!targetStage || typeof targetStage !== 'number' || targetStage < 2 || targetStage > 7) {
      return NextResponse.json(
        { error: 'Invalid target stage', code: 'INVALID_STAGE' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Get current progress
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (progressError || !progress) {
      return NextResponse.json(
        { error: 'User progress not found', code: 'NO_PROGRESS' },
        { status: 404 }
      );
    }

    // 2. Verify sequential progression (can only unlock current_stage + 1)
    if (targetStage !== progress.current_stage + 1) {
      console.warn(`[Unlock Attempt] User ${userId} tried to skip from stage ${progress.current_stage} to ${targetStage}`);
      
      return NextResponse.json(
        { 
          error: 'Cannot skip stages', 
          code: 'STAGE_SKIP_ATTEMPT',
          currentStage: progress.current_stage,
          targetStage,
          nextUnlockable: progress.current_stage + 1
        },
        { status: 403 }
      );
    }

    // 3. Verify unlock eligibility (adherence, deltas, etc.)
    const progressionCheck = await validateStageProgression(userId, targetStage);
    if (progressionCheck) {
      return progressionCheck;
    }

    // 4. CRITICAL: Check subscription for Stage 2+
    if (targetStage > FREE_STAGE_LIMIT) {
      const accessCheck = await canAccessStage(userId, targetStage);
      
      if (!accessCheck.hasAccess) {
        console.warn(`[Unlock Attempt] User ${userId} tried to unlock Stage ${targetStage} without subscription`);
        
        return NextResponse.json(
          { 
            error: 'Subscription required to unlock this stage',
            code: 'SUBSCRIPTION_REQUIRED',
            currentStage: progress.current_stage,
            targetStage,
            subscriptionStatus: accessCheck.subscriptionStatus,
            upgradeUrl: '/pricing'
          },
          { status: 403 }
        );
      }
    }

    // 5. Double-check unlock criteria (server-side verification)
    const unlockCriteria = await verifyUnlockCriteria(supabase, userId, progress.current_stage);
    
    if (!unlockCriteria.eligible) {
      return NextResponse.json(
        { 
          error: 'Unlock criteria not met',
          code: 'CRITERIA_NOT_MET',
          details: unlockCriteria.details
        },
        { status: 403 }
      );
    }

    // 6. All checks passed - perform the unlock
    const { error: updateError } = await supabase
      .from('user_progress')
      .update({
        current_stage: targetStage,
        stage_unlocked_at: new Date().toISOString(),
        unlock_eligible: false, // Reset for next stage
        days_in_stage: 0,
        stage_start_date: new Date().toISOString().split('T')[0]
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('[Unlock Error]', updateError);
      return NextResponse.json(
        { error: 'Failed to unlock stage' },
        { status: 500 }
      );
    }

    // 7. Log the unlock event
    await supabase.from('stage_unlocks').insert({
      user_id: userId,
      from_stage: progress.current_stage,
      to_stage: targetStage,
      unlocked_at: new Date().toISOString(),
      adherence_at_unlock: unlockCriteria.details.adherence,
      delta_at_unlock: unlockCriteria.details.averageDelta
    });

    return NextResponse.json({
      success: true,
      previousStage: progress.current_stage,
      newStage: targetStage,
      message: getUnlockMessage(targetStage)
    });
  },
  {
    // Basic auth protection - subscription check done manually above
  }
);

// Server-side verification of unlock criteria
async function verifyUnlockCriteria(
  supabase: any, 
  userId: string, 
  currentStage: number
): Promise<{ eligible: boolean; details: any }> {
  
  // Get required thresholds for current stage
  const thresholds = {
    1: { adherence: 80, days: 14, delta: 0.3 },
    2: { adherence: 80, days: 14, delta: 0.5 },
    3: { adherence: 80, days: 14, delta: 0.5 },
    4: { adherence: 80, days: 14, delta: 0.6 },
    5: { adherence: 80, days: 14, delta: 0.7 },
    6: { adherence: 85, days: 14, delta: 0.8 } // Stage 6→7 is manual review
  };

  const required = thresholds[currentStage as keyof typeof thresholds];
  if (!required) {
    return { eligible: false, details: { reason: 'Invalid stage for auto-unlock' } };
  }

  // Calculate actual metrics
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Get practice logs for last 14 days
  const { data: logs } = await supabase
    .from('practice_logs')
    .select('practice_date, completed')
    .eq('user_id', userId)
    .gte('practice_date', fourteenDaysAgo.toISOString().split('T')[0])
    .eq('completed', true);

  // Get weekly deltas
  const { data: deltas } = await supabase
    .from('weekly_deltas')
    .select('regulation, awareness, outlook, attention')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(2);

  // Calculate adherence
  const practicesPerDay = getPracticesPerStage(currentStage);
  const expectedPractices = 14 * practicesPerDay;
  const completedPractices = logs?.length || 0;
  const adherence = Math.round((completedPractices / expectedPractices) * 100);

  // Calculate average delta (current week vs baseline)
  let averageDelta = 0;
  if (deltas && deltas.length > 0) {
    const latest = deltas[0];
    const { data: baseline } = await supabase
      .from('baseline_assessments')
      .select('regulation_score, awareness_score, outlook_score, attention_score')
      .eq('user_id', userId)
      .single();

    if (baseline) {
      averageDelta = (
        ((latest.regulation - baseline.regulation_score) +
         (latest.awareness - baseline.awareness_score) +
         (latest.outlook - baseline.outlook_score) +
         (latest.attention - baseline.attention_score)) / 4
      );
    }
  }

  // Check days in stage
  const { data: progress } = await supabase
    .from('user_progress')
    .select('stage_start_date')
    .eq('user_id', userId)
    .single();

  let daysInStage = 0;
  if (progress?.stage_start_date) {
    const start = new Date(progress.stage_start_date);
    const now = new Date();
    daysInStage = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  const details = {
    adherence,
    requiredAdherence: required.adherence,
    daysInStage,
    requiredDays: required.days,
    averageDelta: Math.round(averageDelta * 100) / 100,
    requiredDelta: required.delta
  };

  const eligible = 
    adherence >= required.adherence &&
    daysInStage >= required.days &&
    averageDelta >= required.delta;

  return { eligible, details };
}

function getPracticesPerStage(stage: number): number {
  const practices: { [key: number]: number } = {
    1: 2, // HRVB + Awareness Rep
    2: 3, // + Somatic Flow
    3: 4, // + Morning Micro-Action
    4: 5, // + Flow Block
    5: 6, // + Co-Regulation
    6: 7, // + Nightly Debrief
    7: 7
  };
  return practices[stage] || 2;
}

function getUnlockMessage(stage: number): string {
  const messages: { [key: number]: string } = {
    2: "Neural Priming stabilized. Heart-mind coherence online. Embodied Awareness unlocked.",
    3: "Embodiment achieved. The body is now conscious awareness. Identity Mode unlocked.",
    4: "Identity proof installed. You now act from awareness. Flow Mode unlocked.",
    5: "Flow performance stabilized. The mind is your tool. Relational Coherence unlocked.",
    6: "Relational coherence online. You are connected. Integration Mode unlocked.",
    7: "Welcome, Conductor. The IOS is now self-evolving. Accelerated Expansion unlocked."
  };
  return messages[stage] || "Stage unlocked.";
}
