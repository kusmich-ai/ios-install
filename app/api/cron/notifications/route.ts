// app/api/cron/notifications/route.ts
// Runs hourly via Vercel Cron. Checks each user's timezone and activity,
// then sends the appropriate email notifications.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/emails/send';
import {
  morningReminder,
  missedDay,
  threeDayAbsence,
  weeklySummary,
} from '@/lib/emails/templates';

// Verify cron secret to prevent unauthorized calls
function verifyCronSecret(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true;
  
  const url = new URL(req.url);
  if (url.searchParams.get('secret') === process.env.CRON_SECRET) return true;
  
  return false;
}

// Get current hour (0-23) in a given timezone
function getCurrentHourInTimezone(timezone: string): number {
  try {
    const now = new Date();
    const timeStr = now.toLocaleString('en-US', { timeZone: timezone, hour: 'numeric', hour12: false });
    return parseInt(timeStr, 10);
  } catch {
    return -1;
  }
}

// Get today's date string in a timezone (YYYY-MM-DD)
function getDateInTimezone(timezone: string, daysAgo: number = 0): string {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  return now.toLocaleDateString('en-CA', { timeZone: timezone });
}

// Check if a notification was already sent today
async function wasAlreadySentToday(
  supabase: any,
  userId: string,
  notificationType: string,
  timezone: string
): Promise<boolean> {
  const todayStart = getDateInTimezone(timezone) + 'T00:00:00';
  
  const { data } = await supabase
    .from('notification_log')
    .select('id')
    .eq('user_id', userId)
    .eq('notification_type', notificationType)
    .gte('sent_at', todayStart)
    .limit(1);

  return (data && data.length > 0) || false;
}

// Log that a notification was sent
async function logNotification(
  supabase: any,
  userId: string,
  notificationType: string,
  metadata?: Record<string, unknown>
) {
  await supabase
    .from('notification_log')
    .insert({
      user_id: userId,
      notification_type: notificationType,
      metadata: metadata || {},
    });
}

// Get user's practice data for the last N days
async function getUserPracticeData(
  supabase: any,
  userId: string,
  days: number,
  timezone: string
) {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    dates.push(getDateInTimezone(timezone, i));
  }

  const { data: practices } = await supabase
    .from('practice_logs')
    .select('practice_date, practice_type')
    .eq('user_id', userId)
    .in('practice_date', dates);

  // Group by date
  const byDate: Record<string, string[]> = {};
  (practices || []).forEach((p: { practice_date: string; practice_type: string }) => {
    if (!byDate[p.practice_date]) byDate[p.practice_date] = [];
    byDate[p.practice_date].push(p.practice_type);
  });

  const today = getDateInTimezone(timezone);
  const yesterday = getDateInTimezone(timezone, 1);

  const completedToday = (byDate[today] || []).length >= 2;
  const completedYesterday = (byDate[yesterday] || []).length >= 2;

  // Count consecutive missed days (not counting today)
  let consecutiveMissed = 0;
  for (let i = 1; i < days; i++) {
    const date = getDateInTimezone(timezone, i);
    if (!byDate[date] || byDate[date].length < 2) {
      consecutiveMissed++;
    } else {
      break;
    }
  }

  // Count completed days in last 7
  let completedDaysLast7 = 0;
  for (let i = 0; i < 7; i++) {
    const date = getDateInTimezone(timezone, i);
    if (byDate[date] && byDate[date].length >= 2) {
      completedDaysLast7++;
    }
  }

  return {
    completedToday,
    completedYesterday,
    consecutiveMissed,
    completedDaysLast7,
    totalDays: 7,
  };
}

// Get user's adherence percentage
async function getUserAdherence(
  supabase: any,
  userId: string
): Promise<number> {
  const { data } = await supabase
    .from('user_progress')
    .select('adherence_percentage')
    .eq('user_id', userId)
    .single();

  return data?.adherence_percentage || 0;
}

// Get signal check trend direction
async function getSignalTrend(
  supabase: any,
  userId: string
): Promise<'up' | 'down' | 'stable'> {
  const { data } = await supabase
    .from('signal_checks')
    .select('calm_score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(7);

  if (!data || data.length < 3) return 'stable';

  const recent = data.slice(0, 3).reduce((s: number, d: { calm_score: number }) => s + d.calm_score, 0) / 3;
  const earlier = data.slice(-3).reduce((s: number, d: { calm_score: number }) => s + d.calm_score, 0) / Math.min(3, data.slice(-3).length);

  if (recent - earlier >= 0.5) return 'up';
  if (earlier - recent >= 0.5) return 'down';
  return 'stable';
}

export async function GET(req: Request) {
  // Verify this is a legitimate cron call
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all users with notification preferences who haven't unsubscribed
  const { data: users, error } = await (supabase
    .from('notification_preferences') as any)
    .select('*')
    .eq('unsubscribed', false);

  if (error || !users) {
    console.error('[Cron] Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }

  const results = {
    processed: 0,
    morning_sent: 0,
    missed_day_sent: 0,
    absence_sent: 0,
    weekly_sent: 0,
    errors: 0,
  };

  for (const user of users) {
    results.processed++;

    try {
      const hour = getCurrentHourInTimezone(user.timezone || 'America/New_York');
      const timezone = user.timezone || 'America/New_York';
      const userName = '';
      const unsubscribeUrl = `https://unbecoming.app/api/notifications/unsubscribe?uid=${user.user_id}`;

      // Get practice data
      const practice = await getUserPracticeData(supabase, user.user_id, 7, timezone);

      // ============================================
      // MORNING REMINDER — 7am local, if not yet practiced today
      // ============================================
      if (hour === 7 && user.morning_reminder && !practice.completedToday) {
        const alreadySent = await wasAlreadySentToday(supabase, user.user_id, 'morning_reminder', timezone);
        
        if (!alreadySent) {
          const email = morningReminder(userName, unsubscribeUrl);
          const result = await sendEmail(user.email, email.subject, email.html);
          
          if (result.success) {
            await logNotification(supabase, user.user_id, 'morning_reminder');
            results.morning_sent++;
          } else {
            results.errors++;
          }
        }
      }

      // ============================================
      // MISSED DAY NUDGE — 10am local, if yesterday was missed
      // ============================================
      if (hour === 10 && user.missed_day_nudge && !practice.completedYesterday && practice.consecutiveMissed >= 1) {
        const alreadySent = await wasAlreadySentToday(supabase, user.user_id, 'missed_day', timezone);
        
        if (!alreadySent) {
          const adherence = await getUserAdherence(supabase, user.user_id);
          const email = missedDay(userName, adherence, practice.consecutiveMissed, unsubscribeUrl);
          const result = await sendEmail(user.email, email.subject, email.html);
          
          if (result.success) {
            await logNotification(supabase, user.user_id, 'missed_day', { consecutiveMissed: practice.consecutiveMissed });
            results.missed_day_sent++;
          } else {
            results.errors++;
          }
        }
      }

      // ============================================
      // 3-DAY ABSENCE — 10am local, if 3+ days missed
      // ============================================
      if (hour === 10 && user.missed_day_nudge && practice.consecutiveMissed >= 3) {
        const alreadySent = await wasAlreadySentToday(supabase, user.user_id, '3_day_absence', timezone);
        
        if (!alreadySent) {
          const email = threeDayAbsence(userName, practice.consecutiveMissed, unsubscribeUrl);
          const result = await sendEmail(user.email, email.subject, email.html);
          
          if (result.success) {
            await logNotification(supabase, user.user_id, '3_day_absence', { daysAway: practice.consecutiveMissed });
            results.absence_sent++;
          } else {
            results.errors++;
          }
        }
      }

      // ============================================
      // WEEKLY SUMMARY — Sunday 6pm local
      // ============================================
      const dayOfWeek = new Date().toLocaleDateString('en-US', { timeZone: timezone, weekday: 'long' });
      
      if (dayOfWeek === 'Sunday' && hour === 18 && user.weekly_summary) {
        const alreadySent = await wasAlreadySentToday(supabase, user.user_id, 'weekly_summary', timezone);
        
        if (!alreadySent) {
          const adherence = await getUserAdherence(supabase, user.user_id);
          const trend = await getSignalTrend(supabase, user.user_id);
          
          const trendInsight = trend === 'up'
            ? 'Your calm scores are climbing. The nervous system is responding to the training.'
            : trend === 'down'
              ? 'Calm scores dipped this week. Not a crisis — but consistency matters. Next week, recommit.'
              : 'Calm scores holding steady. Stability is progress too — the foundation is setting.';

          const email = weeklySummary(
            userName,
            practice.completedDaysLast7,
            practice.totalDays,
            adherence,
            trend,
            trendInsight,
            unsubscribeUrl
          );
          const result = await sendEmail(user.email, email.subject, email.html);
          
          if (result.success) {
            await logNotification(supabase, user.user_id, 'weekly_summary');
            results.weekly_sent++;
          } else {
            results.errors++;
          }
        }
      }

    } catch (err) {
      console.error(`[Cron] Error processing user ${user.user_id}:`, err);
      results.errors++;
    }
  }

  console.log('[Cron] Notification run complete:', results);
  return NextResponse.json(results);
}
