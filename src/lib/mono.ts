import { getServerEnv } from "@/lib/env";

const MONO_API_BASE_URL = "https://api.withmono.com";

export interface MonoConnectionRecord {
  monoAccountId: string;
  institutionName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  accountType: string | null;
  status: string;
  rawAccount: Record<string, unknown> | null;
}

function getMonoSecretKey() {
  return getServerEnv()?.MONO_SECRET_KEY ?? null;
}

async function monoFetch(path: string, init?: RequestInit) {
  const secretKey = getMonoSecretKey();

  if (!secretKey) {
    throw new Error("Mono secret key is not configured.");
  }

  const response = await fetch(`${MONO_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "mono-sec-key": secretKey,
      ...init?.headers,
    },
    cache: "no-store",
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      extractMonoErrorMessage(data) ??
      `Mono request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return data;
}

function extractMonoErrorMessage(data: unknown) {
  const record = asObject(data);

  if (!record) {
    return null;
  }

  const candidateKeys = ["message", "error", "msg"] as const;

  for (const key of candidateKeys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function asObject(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function pickFirstString(record: Record<string, unknown> | null, keys: string[]) {
  if (!record) {
    return null;
  }

  for (const key of keys) {
    const value = asString(record[key]);

    if (value) {
      return value;
    }
  }

  return null;
}

function parseExchangeAccountId(data: unknown) {
  const record = asObject(data);
  const directId = pickFirstString(record, ["id", "account_id", "accountId"]);

  if (directId) {
    return directId;
  }

  const account = asObject(record?.account);
  return pickFirstString(account, ["id", "_id", "account_id"]);
}

function normalizeAccountDetails(accountId: string, data: unknown): MonoConnectionRecord {
  const record = asObject(data);
  const institution = asObject(record?.institution);

  return {
    monoAccountId: accountId,
    institutionName: pickFirstString(institution, ["name"]) ?? pickFirstString(record, ["institution", "bank_name"]),
    accountName: pickFirstString(record, ["name", "account_name"]),
    accountNumber: pickFirstString(record, ["account_number", "number", "masked_account_number"]),
    accountType: pickFirstString(record, ["type", "account_type"]),
    status: pickFirstString(record, ["status"]) ?? "linked",
    rawAccount: record,
  };
}

export async function exchangeMonoCodeForConnection(code: string) {
  const exchangeResponse = await monoFetch("/v2/accounts/auth", {
    method: "POST",
    body: JSON.stringify({ code }),
  });

  const monoAccountId = parseExchangeAccountId(exchangeResponse);

  if (!monoAccountId) {
    throw new Error("Mono did not return an account ID after linking.");
  }

  const detailsResponse = await monoFetch(`/v2/accounts/${monoAccountId}`, {
    method: "GET",
  });

  return normalizeAccountDetails(monoAccountId, detailsResponse);
}

function normalizeTransaction(record: Record<string, unknown>) {
  const amountValue = record.amount;
  const amount =
    typeof amountValue === "number"
      ? amountValue
      : typeof amountValue === "string"
        ? Number(amountValue)
        : null;

  return {
    id: pickFirstString(record, ["id", "_id"]) ?? crypto.randomUUID(),
    date:
      pickFirstString(record, ["date", "created_at", "posted_date"]) ??
      new Date().toISOString(),
    narration:
      pickFirstString(record, ["narration", "description", "name"]) ?? "Transaction",
    amount: Number.isFinite(amount) ? amount : 0,
    currency:
      pickFirstString(record, ["currency", "currency_code"]) ??
      pickFirstString(asObject(record.balance), ["currency"]) ??
      "GHS",
    type: pickFirstString(record, ["type", "category"]) ?? "transaction",
    raw: record,
  };
}

export async function getMonoTransactions(accountId: string) {
  const response = await monoFetch(
    `/v2/accounts/${accountId}/transactions?paginate=false`,
    {
      method: "GET",
    },
  );

  const root = asObject(response);
  const records =
    (Array.isArray(root?.data) ? root?.data : null) ??
    (Array.isArray(root?.transactions) ? root?.transactions : null) ??
    (Array.isArray(response) ? response : []);

  return records
    .map((item) => asObject(item))
    .filter((item): item is Record<string, unknown> => item !== null)
    .map(normalizeTransaction);
}
