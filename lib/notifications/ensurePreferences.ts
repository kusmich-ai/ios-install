// lib/notifications/ensurePreferences.ts
import { createClient } from '@supabase/supabase-js';

export async function ensureNotificationPreferences(userId: string, email: string, timezone?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: existing } = await supabase
    .from('notification_preferences')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) return; // Already exists

  const { error } = await supabase
    .from('notification_preferences')
    .insert({
      user_id: userId,
      email: email,
      timezone: timezone || 'America/New_York',
      morning_reminder: true,
      missed_day_nudge: true,
      weekly_summary: true,
      milestone_alerts: true,
      unsubscribed: false,
    });

  if (error) {
    console.error('[Notifications] Failed to create preferences:', error);
  }
}
