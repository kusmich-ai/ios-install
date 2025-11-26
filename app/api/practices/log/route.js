// app/api/practices/log/route.js
import { createClient } from '@supabase/supabase-js';
import { 
  calculateAdherence, 
  calculateConsecutiveDays,
  getStagePractices 
} from '@/lib/progress-utils';

// Create Supabase client with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { userId, practiceType, completed = true, notes = null, localDate = null } = await req.json();

    if (!userId || !practiceType) {
      return Response.json(
        { error: 'Missing required fields: userId and practiceType' },
        { status: 400 }
      );
    }

    // Get user's current stage
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('current_stage')
      .eq('user_id', userId)
      .single();

    if (progressError) {
      console.error('Error fetching user progress:', progressError);
      return Response.json(
        { error: 'Failed to fetch user progress' },
        { status: 500 }
      );
    }

    const currentStage = progressData?.current_stage || 1;
    // Use local date from client if provided, otherwise calculate from UTC
// The client should send their local date for consistency
const now = new Date();
const today = localDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Check if practice already logged for today
    const { data: existingLog, error: checkError } = await supabase
      .from('practice_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('practice_type', practiceType)
      .eq('practice_date', today)
      .single();

    let logResult;

    if (existingLog) {
      // Update existing log
      const { data, error } = await supabase
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
      // Insert new log
      const { data, error } = await supabase
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

    // Recalculate adherence and consecutive days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const startDate = fourteenDaysAgo.toISOString().split('T')[0];

    const { data: recentLogs, error: logsError } = await supabase
      .from('practice_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('practice_date', startDate)
      .order('practice_date', { ascending: false });

    if (logsError) {
      console.error('Error fetching recent logs:', logsError);
    }

    const adherencePercentage = calculateAdherence(recentLogs || [], currentStage, 14);
    const consecutiveDays = calculateConsecutiveDays(recentLogs || [], currentStage);

    // Update user_progress with new calculations
    const { error: updateError } = await supabase
      .from('user_progress')
      .update({
        adherence_percentage: adherencePercentage,
        consecutive_days: consecutiveDays
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating user progress:', updateError);
    }

    // Get today's practice status
    const { data: todayLogs, error: todayError } = await supabase
      .from('practice_logs')
      .select('practice_type, completed')
      .eq('user_id', userId)
      .eq('practice_date', today);

    const requiredPractices = getStagePractices(currentStage);
    const todayStatus = {};
    requiredPractices.forEach(p => {
      const log = todayLogs?.find(l => l.practice_type === p);
      todayStatus[p] = log?.completed || false;
    });

    const allCompleteToday = requiredPractices.every(p => todayStatus[p]);

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
    console.error('Practice log error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch today's practice status
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Get user's current stage
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('current_stage, adherence_percentage, consecutive_days')
      .eq('user_id', userId)
      .single();

    if (progressError) {
      return Response.json(
        { error: 'Failed to fetch user progress' },
        { status: 500 }
      );
    }

    const currentStage = progressData?.current_stage || 1;
    // Get timezone from query params or default to local server time
const timezone = searchParams.get('timezone');
const now = new Date();
const today = searchParams.get('localDate') || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Get today's logs
    const { data: todayLogs, error: logsError } = await supabase
      .from('practice_logs')
      .select('practice_type, completed, completed_at')
      .eq('user_id', userId)
      .eq('practice_date', today);

    if (logsError) {
      return Response.json(
        { error: 'Failed to fetch practice logs' },
        { status: 500 }
      );
    }

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
      adherencePercentage: progressData.adherence_percentage,
      consecutiveDays: progressData.consecutive_days,
      allCompleteToday: practices.every(p => p.completed)
    });

  } catch (error) {
    console.error('GET practice status error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
