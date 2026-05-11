// Sprint 5 A.2.1 — Resend webhook receiver
//
// Receives email event webhooks from Resend (sent, delivered, bounced,
// complained, opened, clicked, etc.). Validates Svix signature, looks up
// user_id by recipient email, and inserts into email_events.
//
// Auto-unsubscribe on bounce/complaint deferred to A.2.2.
// Email_log correlation via resend_email_id deferred to future sprint.

import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  // 1. Read raw body BEFORE parsing (Svix needs it for HMAC)
  const rawBody = await req.text();

  // 2. Validate signing secret is configured
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhook:resend] RESEND_WEBHOOK_SECRET not configured');
    return Response.json(
      { error: 'Server misconfigured' },
      { status: 500 }
    );
  }

  // 3. Verify signature via Svix
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.warn('[webhook:resend] Missing Svix headers');
    return Response.json(
      { error: 'Missing signature headers' },
      { status: 401 }
    );
  }

  let event: any;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.warn('[webhook:resend] Invalid signature:', err);
    return Response.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  // 4. Extract key fields
  const eventType: string | undefined = event?.type;
  const data = event?.data || {};
  const resendEmailId: string | undefined = data.email_id;
  const recipientEmail: string | undefined = Array.isArray(data.to)
    ? data.to[0]
    : data.to;
  const occurredAt: string | undefined = event?.created_at;

  if (!eventType || !resendEmailId || !recipientEmail || !occurredAt) {
    console.warn('[webhook:resend] Malformed payload:', {
      eventType,
      resendEmailId,
      recipientEmail,
      occurredAt,
    });
    return Response.json(
      { error: 'Malformed payload' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();

  // 5. Look up user_id by recipient email (best-effort; null is acceptable)
  let userId: string | null = null;
  try {
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('email', recipientEmail)
      .limit(1)
      .maybeSingle();
    userId = (prefs as { user_id: string } | null)?.user_id ?? null;
  } catch (err) {
    console.error('[webhook:resend] User lookup error:', err);
    // Continue with userId = null
  }

  // 6. Insert into email_events; UNIQUE(resend_email_id, event_type) dedupes
  // Resend webhook retries — graceful on duplicate via Postgres 23505 code.
  const { error: insertError } = await supabase
    .from('email_events')
    .insert({
      resend_email_id: resendEmailId,
      user_id: userId,
      recipient_email: recipientEmail,
      event_type: eventType,
      occurred_at: occurredAt,
      payload: event,
    });

  if (insertError) {
    if (insertError.code === '23505') {
      return Response.json(
        { ok: true, deduped: true },
        { status: 200 }
      );
    }
    console.error('[webhook:resend] Insert error:', insertError);
    return Response.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }

  return Response.json({ ok: true }, { status: 200 });
}
