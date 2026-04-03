ALTER TABLE IF EXISTS public.reminders
ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE IF EXISTS public.reminders
ADD COLUMN IF NOT EXISTS last_delivery_status TEXT
CHECK (last_delivery_status IN ('pending', 'sent', 'failed'));

CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_enabled
ON public.reminders(is_enabled, scheduled_date);
