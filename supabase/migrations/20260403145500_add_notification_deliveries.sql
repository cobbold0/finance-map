CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_id UUID REFERENCES public.reminders(id) ON DELETE CASCADE,
  push_subscription_id UUID REFERENCES public.push_subscriptions(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('browser_push', 'in_app')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reminder_id, push_subscription_id, channel, scheduled_for)
);

ALTER TABLE IF EXISTS public.notification_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notification deliveries" ON public.notification_deliveries;
DROP POLICY IF EXISTS "Users can insert their own notification deliveries" ON public.notification_deliveries;

CREATE POLICY "Users can view their own notification deliveries"
ON public.notification_deliveries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification deliveries"
ON public.notification_deliveries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_user_id
ON public.notification_deliveries(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_reminder_id
ON public.notification_deliveries(reminder_id);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status_scheduled_for
ON public.notification_deliveries(status, scheduled_for);
