// lib/emails/send.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = 'UNbecoming App <unbecoming@unbecoming.app>';

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
      replyTo: 'hello@nicholaskusmich.com',
      headers: {
        'List-Unsubscribe': `<https://unbecoming.app/api/notifications/unsubscribe?email=${encodeURIComponent(to)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
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

// ============================================
// BATCH SEND — up to 100 emails per request
// ============================================

export interface BatchEmail {
  to: string;
  subject: string;
  html: string;
  /** Opaque tag so the caller can match results back to users/types */
  tag?: string;
}

export interface BatchResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}

export async function sendBatch(emails: BatchEmail[]): Promise<BatchResult> {
  if (emails.length === 0) {
    return { success: true, sent: 0, failed: 0, errors: [] };
  }

  const allErrors: string[] = [];
  let totalSent = 0;
  let totalFailed = 0;

  // Resend batch API accepts max 100 per request — chunk if needed
  const CHUNK_SIZE = 100;

  for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
    const chunk = emails.slice(i, i + CHUNK_SIZE);

    try {
   const { data, error } = await resend.batch.send(
        chunk.map((e) => ({
          from: FROM_ADDRESS,
          to: e.to,
          subject: e.subject,
          html: e.html,
          replyTo: 'hello@nicholaskusmich.com',
          headers: {
            'List-Unsubscribe': `<https://unbecoming.app/api/notifications/unsubscribe?email=${encodeURIComponent(e.to)}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }))
      );

      if (error) {
        console.error(`[Email Batch] Chunk ${Math.floor(i / CHUNK_SIZE) + 1} error:`, error);
        allErrors.push(error.message);
        totalFailed += chunk.length;
      } else {
        const ids = (data as any)?.data || [];
        totalSent += ids.length || chunk.length;
        console.log(`[Email Batch] Chunk ${Math.floor(i / CHUNK_SIZE) + 1}: ${chunk.length} emails sent`);
      }
    } catch (err) {
      console.error(`[Email Batch] Chunk ${Math.floor(i / CHUNK_SIZE) + 1} exception:`, err);
      allErrors.push(err instanceof Error ? err.message : 'Unknown error');
      totalFailed += chunk.length;
    }

    // Small delay between chunks (only matters if 100+ emails)
    if (i + CHUNK_SIZE < emails.length) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  return {
    success: totalFailed === 0,
    sent: totalSent,
    failed: totalFailed,
    errors: allErrors,
  };
}
