// app/api/notifications/register/route.ts
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/security/auth';
import { ensureNotificationPreferences } from '@/lib/notifications/ensurePreferences';

export async function POST(req: Request) {
  const authResult = await verifyAuth();
  if (!authResult.authenticated || !authResult.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { email, timezone } = body;

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  await ensureNotificationPreferences(authResult.userId, email, timezone);

  return NextResponse.json({ success: true });
}
