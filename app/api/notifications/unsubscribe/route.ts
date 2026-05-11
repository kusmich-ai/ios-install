// app/api/notifications/unsubscribe/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Shared handler. GET returns the HTML confirmation page (existing user-
// facing behavior); POST returns JSON for RFC 8058 one-click compliance.
// Both read uid from the URL query string — Gmail's one-click POST keeps
// the uid in the URL and only sends List-Unsubscribe=One-Click in the body.
async function doUnsubscribe(uid: string): Promise<{
  ok: boolean;
  status: number;
  error?: string;
}> {
  if (!uid) {
    return { ok: false, status: 400, error: 'Missing user ID' };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('notification_preferences')
    .update({ unsubscribed: true, updated_at: new Date().toISOString() })
    .eq('user_id', uid);

  if (error) {
    console.error('[Unsubscribe] Error:', error);
    return { ok: false, status: 500, error: 'Something went wrong. Please try again.' };
  }

  return { ok: true, status: 200 };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const uid = url.searchParams.get('uid') || '';

  const result = await doUnsubscribe(uid);

  if (!result.ok) {
    return new NextResponse(result.error, { status: result.status });
  }

  // Return a simple confirmation page
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
    <head><title>Unsubscribed</title></head>
    <body style="background:#0a0a0a; color:#e4e4e7; font-family:-apple-system,sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
      <div style="text-align:center; max-width:400px; padding:20px;">
        <h2 style="color:#ff9e19; margin-bottom:16px;">Unsubscribed</h2>
        <p>You won't receive any more email notifications from the IOS System Installer.</p>
        <p style="margin-top:24px;"><a href="https://unbecoming.app/chat" style="color:#ff9e19;">Return to app</a></p>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const uid = url.searchParams.get('uid') || '';

  const result = await doUnsubscribe(uid);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
