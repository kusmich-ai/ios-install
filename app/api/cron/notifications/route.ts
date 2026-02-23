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
    consecutiveM
