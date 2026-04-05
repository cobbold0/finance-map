"use client";

import { useState, useTransition } from "react";
import { RefreshCcw, Landmark } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MonoConnection {
  id: string;
  institutionName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  accountType: string | null;
  status: string;
  lastSyncedAt: string | null;
}

interface MonoTransactionPreview {
  id: string;
  date: string;
  narration: string;
  amount: number;
  currency: string;
  type: string;
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not synced yet";
  }

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function MonoConnectionsPanel({
  connections,
}: {
  connections: MonoConnection[];
}) {
  const [pending, startTransition] = useTransition();
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [transactionsByConnection, setTransactionsByConnection] = useState<
    Record<string, MonoTransactionPreview[]>
  >({});

  function syncConnection(connectionId: string) {
    setActiveConnectionId(connectionId);
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/mono/connections/${connectionId}/transactions`,
        );
        const payload = (await response.json().catch(() => null)) as
          | { error?: string; transactions?: MonoTransactionPreview[] }
          | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? "Unable to fetch transactions.");
        }

        setTransactionsByConnection((current) => ({
          ...current,
          [connectionId]: payload?.transactions?.slice(0, 8) ?? [],
        }));
        toast.success("Latest Mono transactions loaded.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to fetch transactions.",
        );
      } finally {
        setActiveConnectionId((current) =>
          current === connectionId ? null : current,
        );
      }
    });
  }

  if (!connections.length) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Landmark className="h-5 w-5 text-primary" />
            Mono connections
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Link a supported Ghana bank account with Mono, then pull a live
            transaction preview here before you decide how to import or map it.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {connections.map((connection) => {
        const preview = transactionsByConnection[connection.id] ?? [];

        return (
          <Card key={connection.id}>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {connection.institutionName ?? "Connected bank"}
                    </h3>
                    <Badge>{connection.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {connection.accountName ?? "Account"}
                    {connection.accountNumber
                      ? ` • ${connection.accountNumber}`
                      : ""}
                    {connection.accountType ? ` • ${connection.accountType}` : ""}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Last sync: {formatDate(connection.lastSyncedAt)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => syncConnection(connection.id)}
                  disabled={pending}
                >
                  <RefreshCcw className="h-4 w-4" />
                  {activeConnectionId === connection.id && pending
                    ? "Syncing..."
                    : "Fetch transactions"}
                </Button>
              </div>

              {preview.length ? (
                <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  {preview.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-start justify-between gap-4 border-b border-white/10 py-2 last:border-b-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{transaction.narration}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)} • {transaction.type}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
