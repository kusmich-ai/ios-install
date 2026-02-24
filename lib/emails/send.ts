// lib/emails/send.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = 'IOS System Installer <ios@unbecoming.app>';

export async function sendEmail(
  to: string, 
  subject: string, 
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
   const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      reply_to: 'hello@nicholaskusmich.com',
    });

    if (error) {
      console.error('[Email] Send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[Email] Exception:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
