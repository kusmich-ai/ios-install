-- Sprint 5 A.2.1 — email_events table for Resend webhook event tracking
--
-- Records every email event Resend reports (delivered, opened, clicked,
-- bounced, complained, etc.) via the Resend webhook receiver at
-- /api/webhooks/resend. Used for measurement, auto-unsubscribe on bounce/
-- complaint (A.2.2), and analytics.
--
-- Idempotent: uses CREATE TABLE IF NOT EXISTS, CREATE INDEX IF NOT EXISTS,
-- conditional UNIQUE constraint, DROP POLICY IF EXISTS + CREATE POLICY.

CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_email_id text NOT NULL,
  user_id uuid,
  recipient_email text NOT NULL,
  event_type text NOT NULL,
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Dedupe: Resend retries failed webhook deliveries up to 16 times.
-- UNIQUE prevents duplicate event rows on retry.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'email_events_resend_id_type_key'
  ) THEN
    ALTER TABLE public.email_events
      ADD CONSTRAINT email_events_resend_id_type_key
      UNIQUE (resend_email_id, event_type);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_events_user_id
  ON public.email_events (user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type
  ON public.email_events (event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_occurred_at
  ON public.email_events (occurred_at DESC);

-- RLS
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on email_events"
  ON public.email_events;
CREATE POLICY "Service role full access on email_events"
  ON public.email_events FOR ALL
  USING (auth.role() = 'service_role'::text);

DROP POLICY IF EXISTS "Admins can read email_events"
  ON public.email_events;
CREATE POLICY "Admins can read email_events"
  ON public.email_events FOR SELECT
  USING (
    auth.uid() IN (
      SELECT users.id FROM auth.users
      WHERE (users.email)::text = ANY (ARRAY[
        'nkusmich@nicholaskusmich.com'::text,
        'kayla@nicholaskusmich.com'::text,
        'rachel@nicholaskusmich.com'::text
      ])
    )
  );
