import { createClient } from "@/lib/supabase/server";
import { isMonoEnabled } from "@/lib/env";
import { exchangeMonoCodeForConnection } from "@/lib/mono";

export async function POST(request: Request) {
  if (!isMonoEnabled()) {
    return Response.json({ error: "Mono is disabled." }, { status: 404 });
  }

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

  const body = (await request.json().catch(() => null)) as
    | { code?: unknown }
    | null;
  const code = typeof body?.code === "string" ? body.code : null;

  if (!code) {
    return Response.json({ error: "Mono auth code is required." }, { status: 400 });
  }

  try {
    const connection = await exchangeMonoCodeForConnection(code);

    const { data, error } = await supabase
      .from("mono_connected_accounts")
      .upsert(
        {
          user_id: user.id,
          mono_account_id: connection.monoAccountId,
          institution_name: connection.institutionName,
          account_name: connection.accountName,
          account_number: connection.accountNumber,
          account_type: connection.accountType,
          status: connection.status,
          raw_account: connection.rawAccount,
        },
        { onConflict: "user_id,mono_account_id" },
      )
      .select("id, mono_account_id, institution_name, account_name, account_number, account_type, status, last_synced_at, created_at")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ connection: data });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to link Mono account.",
      },
      { status: 400 },
    );
  }
}
