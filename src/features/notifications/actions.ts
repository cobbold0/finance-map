"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pushSubscriptionSchema } from "@/features/notifications/schemas";

export async function savePushSubscriptionAction(values: unknown) {
  const payload = pushSubscriptionSchema.safeParse(values);

  if (!payload.success) {
    return { error: payload.error.issues[0]?.message ?? "Invalid push subscription." };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in again." };
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint: payload.data.endpoint,
        p256dh: payload.data.keys.p256dh,
        auth: payload.data.keys.auth,
        content_encoding: "aes128gcm",
        user_agent: null,
        device_label: "Primary browser",
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,endpoint",
      },
    );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notifications");
  revalidatePath("/settings/preferences");
  return { success: true };
}

export async function deletePushSubscriptionAction(endpoint: string) {
  const supabase = await createClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in again." };
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notifications");
  revalidatePath("/settings/preferences");
  return { success: true };
}
