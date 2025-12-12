// app/api/admin/test-notifications/route.ts
// Test endpoint for Slack notifications (admin only)

import { NextResponse } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/security/auth';
import { testSlackConnection, sendSafetyNotification } from '@/lib/notifications';

// List of admin user IDs who can access this endpoint
// Add your user ID here after deployment
const ADMIN_USER_IDS = [
  // 'your-user-id-here',
];

export async function POST(req: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    
    if (!authResult.authenticated || !authResult.userId) {
      return unauthorizedResponse('Please sign in to continue.');
    }

    // Check if user is admin (or allow if ADMIN_USER_IDS is empty during setup)
    if (ADMIN_USER_IDS.length > 0 && !ADMIN_USER_IDS.includes(authResult.userId)) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { testType } = body;

    if (testType === 'connection') {
      // Simple connection test
      const success = await testSlackConnection();
      
      return NextResponse.json({
        success,
        message: success 
          ? 'Slack connection successful! Check your channel.' 
          : 'Slack connection failed. Check SLACK_SAFETY_WEBHOOK_URL.',
      });
    }

    if (testType === 'sample') {
      // Send a sample safety notification
      const success = await sendSafetyNotification('CRISIS_DETECTED', {
        coachId: 'nic',
        userId: 'TEST-USER-' + Date.now(),
        matchedPhrases: ['test phrase 1', 'test phrase 2'],
        category: 'crisis',
        level: 'crisis',
        conversationId: 'TEST-CONV-' + Date.now(),
      });

      return NextResponse.json({
        success,
        message: success
          ? 'Sample notification sent! Check your Slack channel.'
          : 'Failed to send notification. Check webhook configuration.',
      });
    }

    return NextResponse.json({ error: 'Invalid testType. Use "connection" or "sample".' }, { status: 400 });

  } catch (error) {
    console.error('[API/Admin/TestNotifications] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Simple GET to check if webhook is configured
  const webhookConfigured = !!process.env.SLACK_SAFETY_WEBHOOK_URL;
  
  return NextResponse.json({
    webhookConfigured,
    message: webhookConfigured 
      ? 'Webhook URL is configured. Use POST to test.' 
      : 'SLACK_SAFETY_WEBHOOK_URL not found in environment variables.',
  });
}
