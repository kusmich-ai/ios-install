// Sprint 5 A.1 Unit 3 — unified from-address and reply-to constants for all
// email senders (notifications cron, nurture cron, admin interventions).
// Centralized here so the four-line module is dependency-free and importable
// from any sender without pulling in the Resend SDK.

export const FROM_ADDRESS = 'Nicholas Kusmich <hello@unbecoming.app>';
export const REPLY_TO = 'hello@nicholaskusmich.com';
