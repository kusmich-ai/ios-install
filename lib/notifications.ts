// lib/notifications.ts
// Notification system for critical safety events

// ============================================
// TYPES
// ============================================

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface SafetyNotification {
  type: string;
  priority: NotificationPriority;
  coachId: string;
  userId: string;
  matchedPhrases: string[];
  timestamp: Date;
  conversationId?: string;
}

// ============================================
// SLACK WEBHOOK CONFIGURATION
// ============================================

const SLACK_WEBHOOK_URL = process.env.SLACK_SAFETY_WEBHOOK_URL;

// Events that trigger immediate Slack notifications
const CRITICAL_EVENTS = [
  'CRISIS_DETECTED',
  'CHILD_SAFETY_DETECTED',
  'ABUSE_SITUATION_DETECTED',
  'PSYCHOTIC_SYMPTOMS_DETECTED',
];

const HIGH_PRIORITY_EVENTS = [
  'EATING_DISORDER_DETECTED',
  'SUBSTANCE_ABUSE_DETECTED',
  'DEEP_TRAUMA_DETECTED',
];

// ============================================
// EMOJI MAPPING
// ============================================

const EVENT_EMOJI: Record<string, string> = {
  'CRISIS_DETECTED': '🚨',
  'CHILD_SAFETY_DETECTED': '⚠️',
  'ABUSE_SITUATION_DETECTED': '🆘',
  'PSYCHOTIC_SYMPTOMS_DETECTED': '🧠',
  'EATING_DISORDER_DETECTED': '💜',
  'SUBSTANCE_ABUSE_DETECTED': '💙',
  'DEEP_TRAUMA_DETECTED': '💛',
  'CONCERN_DETECTED': '👀',
};

const EVENT_TITLES: Record<string, string> = {
  'CRISIS_DETECTED': 'CRISIS DETECTED',
  'CHILD_SAFETY_DETECTED': 'CHILD SAFETY CONCERN',
  'ABUSE_SITUATION_DETECTED': 'ABUSE SITUATION DETECTED',
  'PSYCHOTIC_SYMPTOMS_DETECTED': 'PSYCHOTIC SYMPTOMS DETECTED',
  'EATING_DISORDER_DETECTED': 'EATING DISORDER CONCERN',
  'SUBSTANCE_ABUSE_DETECTED': 'SUBSTANCE ABUSE CONCERN',
  'DEEP_TRAUMA_DETECTED': 'DEEP TRAUMA CONTENT',
  'CONCERN_DETECTED': 'DISTRESS DETECTED',
};

// ============================================
// MAIN NOTIFICATION FUNCTION
// ============================================

export async function sendSafetyNotification(
  eventType: string,
  details: {
    coachId: string;
    userId: string;
    matchedPhrases?: string[];
    category?: string;
    level?: string;
    conversationId?: string;
  }
): Promise<boolean> {
  // Only send for critical and high priority events
  const isCritical = CRITICAL_EVENTS.includes(eventType);
  const isHighPriority = HIGH_PRIORITY_EVENTS.includes(eventType);
  
  if (!isCritical && !isHighPriority) {
    // Log but don't send Slack notification for lower priority
    console.log(`[Notifications] ${eventType} logged (not sent to Slack):`, details.userId);
    return true;
  }

  // Check if webhook is configured
  if (!SLACK_WEBHOOK_URL) {
    console.warn('[Notifications] SLACK_SAFETY_WEBHOOK_URL not configured. Skipping notification.');
    return false;
  }

  try {
    const emoji = EVENT_EMOJI[eventType] || '⚡';
    const title = EVENT_TITLES[eventType] || eventType;
    const priority = isCritical ? 'CRITICAL' : 'HIGH';
    const priorityColor = isCritical ? '#FF0000' : '#FFA500';
    
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Build the Slack message
    const slackMessage = {
      attachments: [
        {
          color: priorityColor,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `${emoji} ${title}`,
                emoji: true,
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Priority:*\n${priority}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Coach:*\n${details.coachId === 'nic' ? '⚡ Nic' : '💙 Fehren'}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*User ID:*\n\`${details.userId.slice(0, 8)}...\``,
                },
                {
                  type: 'mrkdwn',
                  text: `*Time:*\n${timestamp}`,
                },
              ],
            },
            ...(details.matchedPhrases && details.matchedPhrases.length > 0
              ? [
                  {
                    type: 'section',
                    text: {
                      type: 'mrkdwn',
                      text: `*Matched Phrases:*\n${details.matchedPhrases.map(p => `• "${p}"`).join('\n')}`,
                    },
                  },
                ]
              : []),
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `User was shown appropriate safety resources. | ${details.conversationId ? `Conv: \`${details.conversationId.slice(0, 8)}...\`` : 'New conversation'}`,
                },
              ],
            },
          ],
        },
      ],
    };

    // Send to Slack
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      console.error('[Notifications] Slack webhook failed:', response.status, await response.text());
      return false;
    }

    console.log(`[Notifications] Slack alert sent for ${eventType}:`, details.userId);
    return true;

  } catch (error) {
    console.error('[Notifications] Error sending Slack notification:', error);
    return false;
  }
}

// ============================================
// BATCH NOTIFICATION (for daily digests)
// ============================================

export interface DailyDigestData {
  totalEvents: number;
  criticalCount: number;
  highPriorityCount: number;
  eventBreakdown: Record<string, number>;
  uniqueUsers: number;
}

export async function sendDailyDigest(data: DailyDigestData): Promise<boolean> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('[Notifications] SLACK_SAFETY_WEBHOOK_URL not configured.');
    return false;
  }

  try {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Build breakdown text
    const breakdownLines = Object.entries(data.eventBreakdown)
      .filter(([_, count]) => count > 0)
      .map(([event, count]) => {
        const emoji = EVENT_EMOJI[event] || '•';
        const title = EVENT_TITLES[event] || event;
        return `${emoji} ${title}: ${count}`;
      })
      .join('\n');

    const slackMessage = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Daily Safety Report',
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${today}*`,
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total Events:*\n${data.totalEvents}`,
            },
            {
              type: 'mrkdwn',
              text: `*Unique Users:*\n${data.uniqueUsers}`,
            },
            {
              type: 'mrkdwn',
              text: `*🚨 Critical:*\n${data.criticalCount}`,
            },
            {
              type: 'mrkdwn',
              text: `*⚠️ High Priority:*\n${data.highPriorityCount}`,
            },
          ],
        },
        ...(breakdownLines
          ? [
              {
                type: 'divider',
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Event Breakdown:*\n${breakdownLines}`,
                },
              },
            ]
          : []),
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: 'IOS Coach Safety Monitoring • All users received appropriate resources',
            },
          ],
        },
      ],
    };

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      console.error('[Notifications] Daily digest failed:', response.status);
      return false;
    }

    console.log('[Notifications] Daily digest sent successfully');
    return true;

  } catch (error) {
    console.error('[Notifications] Error sending daily digest:', error);
    return false;
  }
}

// ============================================
// TEST FUNCTION
// ============================================

export async function testSlackConnection(): Promise<boolean> {
  if (!SLACK_WEBHOOK_URL) {
    console.error('[Notifications] SLACK_SAFETY_WEBHOOK_URL not configured');
    return false;
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: '✅ IOS Safety Notification System Connected Successfully',
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Notifications] Test failed:', error);
    return false;
  }
}
