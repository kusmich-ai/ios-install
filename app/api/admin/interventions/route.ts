// app/api/admin/interventions/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Resend } from 'resend';

// ============================================
// ADMIN EMAIL WHITELIST (same as metrics route)
// ============================================
const ADMIN_EMAILS = [
  'nkusmich@nicholaskusmich.com',
  'kayla@nicholaskusmich.com',
  'rachel@nicholaskusmich.com',
];

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// EMAIL TEMPLATES BY INTERVENTION TYPE
// ============================================
const EMAIL_TEMPLATES: { [key: string]: (firstName: string) => { subject: string; html: string } } = {
  reengagement_email: (firstName) => ({
    subject: `${firstName}, we noticed you've been away`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; background: #0a0a0a; padding: 32px; border-radius: 12px; color: #e5e5e5;">
        <p style="color: #ff9e19; font-size: 14px; margin-bottom: 8px;">IOS System Installer</p>
        <h2 style="color: white; margin: 0 0 16px 0; font-size: 22px;">Hey ${firstName},</h2>
        <p style="line-height: 1.6; font-size: 15px; color: #a3a3a3;">
          I noticed you haven't checked in for a few days. No judgment — life happens. But here's the thing: your nervous system doesn't care about your schedule. It responds to consistency.
        </p>
        <p style="line-height: 1.6; font-size: 15px; color: #a3a3a3;">
          The progress you've already built is still in there. You don't need to start over — just show up today. Even 5 minutes of HRVB breathing will reconnect the signal.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://unbecoming.app" style="display: inline-block; padding: 12px 32px; background: #ff9e19; color: black; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Open IOS Installer</a>
        </div>
        <p style="font-size: 13px; color: #525252; margin-top: 24px;">
          Your system is waiting. — Nicholas
        </p>
      </div>
    `,
  }),

  encouragement_email: (firstName) => ({
    subject: `${firstName}, you're closer than you think`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; background: #0a0a0a; padding: 32px; border-radius: 12px; color: #e5e5e5;">
        <p style="color: #ff9e19; font-size: 14px; margin-bottom: 8px;">IOS System Installer</p>
        <h2 style="color: white; margin: 0 0 16px 0; font-size: 22px;">Hey ${firstName},</h2>
        <p style="line-height: 1.6; font-size: 15px; color: #a3a3a3;">
          I'm looking at your data and I want you to know — you're building something real. The fact that you're still here matters more than perfect consistency.
        </p>
        <p style="line-height: 1.6; font-size: 15px; color: #a3a3a3;">
          The dip you're experiencing is normal. It's actually part of the process — your nervous system is integrating, not failing. The users who push through this exact phase are the ones who see the biggest breakthroughs.
        </p>
        <p style="line-height: 1.6; font-size: 15px; color: #a3a3a3;">
          Show up today. That's the only assignment.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://unbecoming.app" style="display: inline-block; padding: 12px 32px; background: #ff9e19; color: black; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Continue Your Practice</a>
        </div>
        <p style="font-size: 13px; color: #525252; margin-top: 24px;">
          Rooting for you. — Nicholas
        </p>
      </div>
    `,
  }),

  unlock_prompt_email: (firstName) => ({
    subject: `${firstName}, you've earned your next stage 🔓`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; background: #0a0a0a; padding: 32px; border-radius: 12px; color: #e5e5e5;">
        <p style="color: #ff9e19; font-size: 14px; margin-bottom: 8px;">IOS System Installer</p>
        <h2 style="color: white; margin: 0 0 16px 0; font-size: 22px;">${firstName}, you did it.</h2>
        <p style="line-height: 1.6; font-size: 15px; color: #a3a3a3;">
          Your consistency paid off. Your data shows you've met the unlock criteria — your adherence, your scores, and your reflections all indicate genuine readiness for the next stage.
        </p>
        <p style="line-height: 1.6; font-size: 15px; color: #a3a3a3;">
          This isn't a participation trophy. You earned this through actual neural rewiring. Your nervous system is demonstrably different than when you started.
        </p>
        <p style="line-height: 1.6; font-size: 15px; color: #a3a3a3;">
          Log in to unlock your next stage and see what's coming.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://unbecoming.app" style="display: inline-block; padding: 12px 32px; background: #ff9e19; color: black; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Unlock Next Stage</a>
        </div>
        <p style="font-size: 13px; color: #525252; margin-top: 24px;">
          Well done. — Nicholas
        </p>
      </div>
    `,
  }),

  personal_note: (firstName) => ({
    subject: `A personal note from Nicholas`,
    html: '', // Will be replaced with custom message
  }),
};

// ============================================
// RESEND EMAIL CLIENT
// Make sure RESEND_API_KEY is in your Vercel env vars
// ============================================
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'Nicholas <nicholas@unbecoming.app>';

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log(`✅ Email sent to ${to} (Resend ID: ${data?.id})`);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}

// ============================================
// API HANDLER
// ============================================
export async function POST(req: Request) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // ─────────────────────────────────────
    // GET INTERVENTION HISTORY
    // ─────────────────────────────────────
    if (action === 'getHistory') {
      const { userId } = body;
      
      const { data: history, error } = await supabaseAdmin
        .from('notification_log')
        .select('notification_type, sent_at, metadata')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return NextResponse.json({ history: history || [] });
    }

    // ─────────────────────────────────────
    // SEND INTERVENTION
    // ─────────────────────────────────────
    if (action === 'sendIntervention') {
      const { userId, interventionType, alertType, customMessage } = body;

      // Get user info from auth.users (service role can access this)
      let firstName = 'there';
      let email = '';

      const { data: { user: targetUser }, error: targetError } = await supabaseAdmin.auth.admin.getUserById(userId);

      if (targetError || !targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      email = targetUser.email || '';
      firstName = targetUser.user_metadata?.first_name || targetUser.user_metadata?.name || 'there';

      if (!email) {
        return NextResponse.json({ error: 'No email found for user' }, { status: 400 });
      }

      // Check if user has unsubscribed
      const { data: prefs } = await supabaseAdmin
        .from('notification_preferences')
        .select('unsubscribed')
        .eq('user_id', userId)
        .single();

      if (prefs?.unsubscribed) {
        return NextResponse.json({ error: 'User has unsubscribed from emails' }, { status: 400 });
      }

      // Build email content
      const template = EMAIL_TEMPLATES[interventionType];
      if (!template) {
        return NextResponse.json({ error: 'Unknown intervention type' }, { status: 400 });
      }

      let { subject, html } = template(firstName);

      // For personal notes, wrap custom message in template
      if (interventionType === 'personal_note' && customMessage) {
        const escapedMessage = customMessage.replace(/\n/g, '<br/>');
        html = `
          <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; background: #0a0a0a; padding: 32px; border-radius: 12px; color: #e5e5e5;">
            <p style="color: #ff9e19; font-size: 14px; margin-bottom: 8px;">IOS System Installer</p>
            <h2 style="color: white; margin: 0 0 16px 0; font-size: 22px;">Hey ${firstName},</h2>
            <p style="line-height: 1.6; font-size: 15px; color: #a3a3a3;">
              ${escapedMessage}
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="https://unbecoming.app" style="display: inline-block; padding: 12px 32px; background: #ff9e19; color: black; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Open IOS Installer</a>
            </div>
            <p style="font-size: 13px; color: #525252; margin-top: 24px;">
              — Nicholas
            </p>
          </div>
        `;
      }

      // Send the email
      const emailSent = await sendEmail(email, subject, html);

      // Log to notification_log regardless (so we track the attempt)
      const { error: logError } = await supabaseAdmin
        .from('notification_log')
        .insert({
          user_id: userId,
          notification_type: `admin_${interventionType}`,
          sent_at: new Date().toISOString(),
          metadata: {
            alert_type: alertType,
            sent_by: user.email,
            email_sent: emailSent,
            custom_message: interventionType === 'personal_note' ? customMessage : undefined,
          },
        });

      if (logError) {
        console.error('Failed to log intervention:', logError);
      }

      return NextResponse.json({ 
        success: true, 
        emailSent,
        message: emailSent 
          ? `Intervention sent to ${firstName} (${email})` 
          : `Logged but email delivery failed — check email provider config`
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Intervention error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
