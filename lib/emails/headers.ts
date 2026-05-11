// Sprint 5 A.1 Unit 4 — centralized List-Unsubscribe headers + canonical
// unsubscribe URL builder. Both header and email-body link must resolve to
// the same URL so users see consistent behavior whether they click Gmail's
// header button or the in-body unsubscribe link.

export function buildUnsubscribeUrl(userId: string): string {
  return `https://unbecoming.app/api/notifications/unsubscribe?uid=${encodeURIComponent(userId)}`;
}

export function buildListUnsubscribeHeaders(userId: string): Record<string, string> {
  const url = buildUnsubscribeUrl(userId);
  return {
    'List-Unsubscribe': `<${url}>, <mailto:unsubscribe@unbecoming.app?subject=unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}
