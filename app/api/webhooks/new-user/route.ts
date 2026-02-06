import { NextRequest, NextResponse } from 'next/server'

// Supabase sends webhook payloads with this structure
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    id: string
    first_name: string | null
    last_name: string | null
    full_name: string | null
    referral_source: string | null
    created_at: string
  }
  schema: string
  old_record: null | Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    // Verify the webhook secret (optional but recommended)
    const webhookSecret = request.headers.get('x-webhook-secret')
    if (process.env.SUPABASE_WEBHOOK_SECRET && webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
      console.error('Invalid webhook secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload: WebhookPayload = await request.json()

    // Only process INSERT events on profiles table
   if (payload.type !== 'INSERT' || payload.table !== 'user_profiles') {
      return NextResponse.json({ message: 'Ignored' }, { status: 200 })
    }

    const { record } = payload
    const name = record.full_name || [record.first_name, record.last_name].filter(Boolean).join(' ') || 'Unknown'
    const source = record.referral_source || 'Organic'
    const createdAt = new Date(record.created_at).toLocaleString('en-US', {
      timeZone: 'America/Edmonton', // Calgary timezone
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })

    // Determine emoji and label based on source
    const isAwaken5 = source.toLowerCase().includes('awaken5')
    const sourceEmoji = isAwaken5 ? '🔮' : '🌐'
    const sourceLabel = isAwaken5 ? 'Awaken with 5' : source.charAt(0).toUpperCase() + source.slice(1)

    // Build Slack message
    const slackMessage = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎉 New Enrollment!',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Name:*\n${name}`,
            },
            {
              type: 'mrkdwn',
              text: `*Source:*\n${sourceEmoji} ${sourceLabel}`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Signed Up:*\n${createdAt}`,
            },
          ],
        },
        {
          type: 'divider',
        },
      ],
    }

    // Send to Slack
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
    if (!slackWebhookUrl) {
      console.error('SLACK_WEBHOOK_URL not configured')
      return NextResponse.json({ error: 'Slack not configured' }, { status: 500 })
    }

    const slackResponse = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    })

    if (!slackResponse.ok) {
      console.error('Slack notification failed:', await slackResponse.text())
      return NextResponse.json({ error: 'Slack notification failed' }, { status: 500 })
    }

    console.log(`✅ Slack notification sent for new user: ${name} (source: ${sourceLabel})`)
    return NextResponse.json({ message: 'Notification sent' }, { status: 200 })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
