import { isMonoEnabled } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getMonoTransactions } from "@/lib/mono";

export async function GET(
  _request: Request,
  context: { params: Promise<{ connectionId: string }> },
) {
  if (!isMonoEnabled()) {
    return Response.json({ error: "Mono is disabled." }, { status: 404 });
  }

  const { connectionId } = await context.params;
  const supabase = await createClient();

  if (!supabase) {
    return Response.json(
      { error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  }

  const { data: connection, error } = await supabase
    .from("mono_connected_accounts")
    .select("id, mono_account_id")
    .eq("id", connectionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  if (!connection) {
    return Response.json({ error: "Connected account not found." }, { status: 404 });
  }

  try {
    const transactions = await getMonoTransactions(connection.mono_account_id);

    await supabase
      .from("mono_connected_accounts")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", connectionId)
      .eq("user_id", user.id);

    return Response.json({ transactions });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to fetch transactions.",
      },
      { status: 400 },
    );
  }
}
