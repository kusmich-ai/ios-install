// app/api/notifications/unsubscribe/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const uid = url.searchParams.get('uid');

  if (!uid) {
    return new NextResponse('Missing user ID', { status: 400 });
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
    return new NextResponse('Something went wrong. Please try again.', { status: 500 });
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
