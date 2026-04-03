import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type ReminderRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string | null;
  scheduled_date: string | null;
  frequency: string | null;
  day_of_month: number | null;
  notification_time: string | null;
  is_enabled: boolean;
};

type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

type NotificationPreferenceRow = {
  user_id: string;
  salary_reminder: boolean | null;
  bonus_reminder: boolean | null;
  milestone_reminder: boolean | null;
  monthly_review_reminder: boolean | null;
  budget_warning: boolean | null;
  reconciliation_reminder: boolean | null;
  push_enabled: boolean | null;
};

type PushPayload = {
  title: string;
  body: string;
  tag: string;
  url: string;
  requireInteraction?: boolean;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function isReminderEnabled(
  reminderType: string,
  preference: NotificationPreferenceRow | undefined,
) {

  if (!preference?.push_enabled) {
    return false;
  }

  switch (reminderType) {
    case "salary":
      return Boolean(preference.salary_reminder);
    case "bonus":
      return Boolean(preference.bonus_reminder);
    case "milestone":
      return Boolean(preference.milestone_reminder);
    case "monthly_review":
      return Boolean(preference.monthly_review_reminder);
    case "budget_warning":
      return Boolean(preference.budget_warning);
    case "reconciliation":
      return Boolean(preference.reconciliation_reminder);
    default:
      return true;
  }
}

function buildPayload(reminder: ReminderRow): PushPayload {
  return {
    title: reminder.title,
    body: reminder.description ?? "A finance reminder is ready for review.",
    tag: `reminder-${reminder.id}`,
    url: "/notifications",
    requireInteraction: reminder.type === "budget_warning",
  };
}

function setUtcTime(date: Date, timeValue: string | null) {
  const [hours = "9", minutes = "0", seconds = "0"] = (timeValue ?? "09:00:00")
    .split(":")
    .map((part) => part.trim());
  date.setUTCHours(Number(hours), Number(minutes), Number(seconds), 0);
  return date;
}

function getNextScheduledDate(reminder: ReminderRow) {
  if (!reminder.frequency || !reminder.scheduled_date) {
    return null;
  }

  const baseDate = new Date(reminder.scheduled_date);
  const nextDate = new Date(baseDate);

  switch (reminder.frequency) {
    case "daily":
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      return nextDate.toISOString();
    case "weekly":
      nextDate.setUTCDate(nextDate.getUTCDate() + 7);
      return nextDate.toISOString();
    case "monthly": {
      const targetDay = reminder.day_of_month ?? baseDate.getUTCDate();
      const monthCursor = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + 1, 1));
      const lastDay = new Date(Date.UTC(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth() + 1, 0)).getUTCDate();
      monthCursor.setUTCDate(Math.min(targetDay, lastDay));
      return setUtcTime(monthCursor, reminder.notification_time).toISOString();
    }
    case "quarterly": {
      const targetDay = reminder.day_of_month ?? baseDate.getUTCDate();
      const monthCursor = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + 3, 1));
      const lastDay = new Date(Date.UTC(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth() + 1, 0)).getUTCDate();
      monthCursor.setUTCDate(Math.min(targetDay, lastDay));
      return setUtcTime(monthCursor, reminder.notification_time).toISOString();
    }
    case "yearly": {
      const yearCursor = new Date(
        Date.UTC(
          baseDate.getUTCFullYear() + 1,
          baseDate.getUTCMonth(),
          baseDate.getUTCDate(),
        ),
      );
      return setUtcTime(yearCursor, reminder.notification_time).toISOString();
    }
    case "once":
    default:
      return null;
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getEnv("SUPABASE_URL");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const vapidSubject = getEnv("VAPID_SUBJECT");
    const vapidPublicKey = getEnv("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = getEnv("VAPID_PRIVATE_KEY");

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const nowIso = new Date().toISOString();
    const { data: reminders, error } = await supabase
      .from("reminders")
      .select(
        "id, user_id, type, title, description, scheduled_date, frequency, day_of_month, notification_time, is_enabled",
      )
      .eq("is_enabled", true)
      .lte("scheduled_date", nowIso);

    if (error) {
      throw error;
    }

    const dueReminders = (reminders ?? []) as ReminderRow[];
    const userIds = [...new Set(dueReminders.map((reminder) => reminder.user_id))];
    const { data: subscriptions } = userIds.length
      ? await supabase
          .from("push_subscriptions")
          .select("id, user_id, endpoint, p256dh, auth")
          .in("user_id", userIds)
      : { data: [] as PushSubscriptionRow[] };
    const { data: preferences } = userIds.length
      ? await supabase
          .from("notification_preferences")
          .select(
            "user_id, salary_reminder, bonus_reminder, milestone_reminder, monthly_review_reminder, budget_warning, reconciliation_reminder, push_enabled",
          )
          .in("user_id", userIds)
      : { data: [] as NotificationPreferenceRow[] };
    const subscriptionsByUser = new Map<string, PushSubscriptionRow[]>();
    const preferencesByUser = new Map<string, NotificationPreferenceRow>();

    for (const subscription of subscriptions ?? []) {
      const entries = subscriptionsByUser.get(subscription.user_id) ?? [];
      entries.push(subscription);
      subscriptionsByUser.set(subscription.user_id, entries);
    }

    for (const preference of preferences ?? []) {
      preferencesByUser.set(preference.user_id, preference);
    }

    let sentCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const reminder of dueReminders) {
      const reminderPreference = preferencesByUser.get(reminder.user_id);
      let reminderSent = false;
      let reminderFailed = false;

      if (!isReminderEnabled(reminder.type, reminderPreference)) {
        skippedCount += 1;
        continue;
      }

      const subscriptions = subscriptionsByUser.get(reminder.user_id) ?? [];

      if (!subscriptions.length) {
        skippedCount += 1;
        continue;
      }

      for (const subscription of subscriptions) {
        const scheduledFor = reminder.scheduled_date ?? nowIso;

        const { data: existingDelivery } = await supabase
          .from("notification_deliveries")
          .select("id, status")
          .eq("reminder_id", reminder.id)
          .eq("push_subscription_id", subscription.id)
          .eq("channel", "browser_push")
          .eq("scheduled_for", scheduledFor)
          .maybeSingle();

        if (existingDelivery?.status === "sent") {
          skippedCount += 1;
          continue;
        }

        const payload = buildPayload(reminder);

        const { data: deliveryRow, error: insertError } = await supabase
          .from("notification_deliveries")
          .upsert(
            {
              user_id: reminder.user_id,
              reminder_id: reminder.id,
              push_subscription_id: subscription.id,
              channel: "browser_push",
              status: "pending",
              scheduled_for: scheduledFor,
              payload,
            },
            {
              onConflict:
                "reminder_id,push_subscription_id,channel,scheduled_for",
            },
          )
          .select("id")
          .single();

        if (insertError) {
          failedCount += 1;
          continue;
        }

        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            JSON.stringify(payload),
          );

          await supabase
            .from("notification_deliveries")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              error_message: null,
            })
            .eq("id", deliveryRow.id);

          reminderSent = true;
          sentCount += 1;
        } catch (sendError) {
          const errorMessage =
            sendError instanceof Error
              ? sendError.message
              : "Unknown push delivery error";

          await supabase
            .from("notification_deliveries")
            .update({
              status: "failed",
              error_message: errorMessage,
            })
            .eq("id", deliveryRow.id);

          reminderFailed = true;
          failedCount += 1;
        }
      }

      if (reminderSent) {
        const nextScheduledDate = getNextScheduledDate(reminder);

        await supabase
          .from("reminders")
          .update({
            scheduled_date: nextScheduledDate,
            is_enabled: reminder.frequency === "once" ? false : reminder.is_enabled,
            last_triggered_at: nowIso,
            last_delivery_status: "sent",
            updated_at: nowIso,
          })
          .eq("id", reminder.id);
      } else if (reminderFailed) {
        await supabase
          .from("reminders")
          .update({
            last_delivery_status: "failed",
            updated_at: nowIso,
          })
          .eq("id", reminder.id);
      }
    }

    return Response.json(
      {
        sentCount,
        skippedCount,
        failedCount,
      },
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
