import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

// ============================================
// SUPABASE: Fetch email from auth.users by ID
// ============================================
async function getUserEmail(userId: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[Integrations] Supabase admin credentials missing')
    return null
  }

  try {
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data, error } = await adminClient.auth.admin.getUserById(userId)

    if (error) {
      console.error('[Integrations] Failed to fetch user from auth.users:', error.message)
      return null
    }
    return data?.user?.email ?? null
  } catch (err) {
    console.error('[Integrations] Exception fetching user email:', err)
    return null
  }
}

// ============================================
// GHL: Upsert contact with tag
// ============================================
async function addToGHL(params: {
  email: string
  firstName: string | null
  lastName: string | null
  source: string
}): Promise<{ success: boolean; detail: string }> {
  const apiKey = process.env.GHL_API_KEY
  const locationId = process.env.GHL_LOCATION_ID

  if (!apiKey || !locationId) {
    return { success: false, detail: 'GHL credentials not configured' }
  }

  const tags = ['unbecoming app']
  if (params.source.toLowerCase().includes('awaken5')) {
    tags.push('awaken with 5')
  }

  try {
    const response = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        firstName: params.firstName || '',
        lastName: params.lastName || '',
        tags,
        locationId,
        source: 'Unbecoming App',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { success: false, detail: `${response.status}: ${errorText}` }
    }

    console.log(`✅ GHL contact upserted: ${params.email} (tags: ${tags.join(', ')})`)
    return { success: true, detail: 'upserted' }
  } catch (err) {
    return { success: false, detail: err instanceof Error ? err.message : 'unknown error' }
  }
}

// ============================================
// SUBSTACK: Add subscriber (unofficial endpoint)
// ============================================
async function addToSubstack(email: string): Promise<{ success: boolean; detail: string }> {
  const publication = process.env.SUBSTACK_PUBLICATION

  if (!publication) {
    return { success: false, detail: 'SUBSTACK_PUBLICATION not configured' }
  }

  try {
    const response = await fetch(
      `https://${publication}.substack.com/api/v1/free?nojs=true`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          // Substack sometimes rejects requests without a common user-agent
          'User-Agent': 'Mozilla/5.0 (compatible; UnbecomingApp/1.0)',
        },
        body: JSON.stringify({
          email,
          first_url: 'https://unbecoming.app',
          first_referrer: '',
          current_url: 'https://unbecoming.app',
          current_referrer: '',
          referral_code: '',
          source: 'subscribe_page',
        }),
      }
    )

    const responseText = await response.text()

    if (!response.ok) {
      return { success: false, detail: `${response.status}: ${responseText.slice(0, 300)}` }
    }

    console.log(`✅ Substack subscriber added: ${email} | response: ${responseText.slice(0, 200)}`)
    return { success: true, detail: 'subscribed' }
  } catch (err) {
    return { success: false, detail: err instanceof Error ? err.message : 'unknown error' }
  }
}

// ============================================
// SLACK: Send enrollment notification
// ============================================
async function sendSlackNotification(params: {
  name: string
  sourceEmoji: string
  sourceLabel: string
  createdAt: string
}): Promise<{ success: boolean; detail: string }> {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!slackWebhookUrl) {
    return { success: false, detail: 'SLACK_WEBHOOK_URL not configured' }
  }

  const slackMessage = {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '🎉 New Enrollment!', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${params.name}` },
          { type: 'mrkdwn', text: `*Source:*\n${params.sourceEmoji} ${params.sourceLabel}` },
        ],
      },
      {
        type: 'section',
        fields: [{ type: 'mrkdwn', text: `*Signed Up:*\n${params.createdAt}` }],
      },
      { type: 'divider' },
    ],
  }

  try {
    const slackResponse = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    })

    if (!slackResponse.ok) {
      const errorText = await slackResponse.text()
      return { success: false, detail: `${slackResponse.status}: ${errorText}` }
    }

    console.log(`✅ Slack notification sent for: ${params.name}`)
    return { success: true, detail: 'sent' }
  } catch (err) {
    return { success: false, detail: err instanceof Error ? err.message : 'unknown error' }
  }
}

// ============================================
// MAIN HANDLER
// ============================================
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const webhookSecret = request.headers.get('x-webhook-secret')
    if (
      process.env.SUPABASE_WEBHOOK_SECRET &&
      webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET
    ) {
      console.error('Invalid webhook secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload: WebhookPayload = await request.json()

    if (payload.table !== 'user_profiles') {
      return NextResponse.json({ message: 'Ignored' }, { status: 200 })
    }

    const { record, old_record } = payload

    // Skip if no name yet (trigger-created empty row)
    if (!record.full_name && !record.first_name) {
      console.log('Skipping - no name data yet')
      return NextResponse.json({ message: 'Skipped - awaiting data' }, { status: 200 })
    }

    // For UPDATE events, only notify if this is the first time name is being set
    if (payload.type === 'UPDATE') {
      const hadNameBefore = old_record?.full_name || old_record?.first_name
      if (hadNameBefore) {
        console.log('Skipping - name already existed, not a new signup')
        return NextResponse.json({ message: 'Skipped - not new signup' }, { status: 200 })
      }
    }

    // Build display fields
    const name =
      record.full_name ||
      [record.first_name, record.last_name].filter(Boolean).join(' ') ||
      'Unknown'
    const source = record.referral_source || 'Organic'
    const createdAt = new Date(record.created_at).toLocaleString('en-US', {
      timeZone: 'America/Edmonton',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })

    const isAwaken5 = source.toLowerCase().includes('awaken5')
    const sourceEmoji = isAwaken5 ? '🔮' : '🌐'
    const sourceLabel = isAwaken5
      ? 'Awaken with 5'
      : source.charAt(0).toUpperCase() + source.slice(1)

    // Fetch email once, share across GHL + Substack calls
    const emailPromise = getUserEmail(record.id)

    // Fire Slack + GHL + Substack in parallel (none blocks the others)
    const [slackResult, ghlResult, substackResult] = await Promise.allSettled([
      sendSlackNotification({ name, sourceEmoji, sourceLabel, createdAt }),
      (async () => {
        const email = await emailPromise
        if (!email) {
          return { success: false, detail: 'Could not fetch email from auth.users' }
        }
        return addToGHL({
          email,
          firstName: record.first_name,
          lastName: record.last_name,
          source,
        })
      })(),
      (async () => {
        const email = await emailPromise
        if (!email) {
          return { success: false, detail: 'Could not fetch email from auth.users' }
        }
        return addToSubstack(email)
      })(),
    ])

    // Unwrap outcomes
    const slackStatus =
      slackResult.status === 'fulfilled'
        ? slackResult.value
        : { success: false, detail: String(slackResult.reason) }
    const ghlStatus =
      ghlResult.status === 'fulfilled'
        ? ghlResult.value
        : { success: false, detail: String(ghlResult.reason) }
    const substackStatus =
      substackResult.status === 'fulfilled'
        ? substackResult.value
        : { success: false, detail: String(substackResult.reason) }

    if (!slackStatus.success) console.error('[Slack] Failed:', slackStatus.detail)
    if (!ghlStatus.success) console.error('[GHL] Failed:', ghlStatus.detail)
    if (!substackStatus.success) console.error('[Substack] Failed:', substackStatus.detail)

    // Always return 200 so Supabase doesn't retry and cause duplicates
    return NextResponse.json(
      {
        message: 'Processed',
        slack: slackStatus,
        ghl: ghlStatus,
        substack: substackStatus,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal error', detail: error instanceof Error ? error.message : 'unknown' },
      { status: 200 }
    )
  }
}
