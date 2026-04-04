"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type AISummaryApiResponse } from "@/features/ai-summary/schema";

async function fetchAISummary() {
  const response = await fetch("/api/ai-summary", {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as AISummaryApiResponse;

  if (payload.status === "error") {
    throw new Error(payload.message);
  }

  return payload;
}

async function refreshAISummary() {
  const response = await fetch("/api/ai-summary", {
    method: "POST",
    cache: "no-store",
  });

  const payload = (await response.json()) as AISummaryApiResponse;

  if (payload.status === "error") {
    throw new Error(payload.message);
  }

  return payload;
}

export function AISummaryPanel() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["ai-summary"],
    queryFn: fetchAISummary,
    staleTime: Infinity,
  });
  const refreshMutation = useMutation({
    mutationFn: refreshAISummary,
    onSuccess(data) {
      queryClient.setQueryData(["ai-summary"], data);
    },
  });
  const isBusy = query.isLoading || query.isFetching || refreshMutation.isPending;
  const currentError =
    refreshMutation.error instanceof Error
      ? refreshMutation.error.message
      : query.error instanceof Error
        ? query.error.message
        : null;

  return (
    <Card className="border-primary/20 bg-card">
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Fresh analysis
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              AI financial summary
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              This summary uses your current Finance Map data only: balances,
              recent transactions, budgets, goals, and reminders.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshMutation.mutateAsync()}
            disabled={isBusy}
          >
            <RefreshCw className={isBusy ? "animate-spin" : undefined} />
            Refresh
          </Button>
        </div>

        {query.isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Loading your saved AI summary...
            </div>
          </div>
        ) : null}

        {!query.isLoading && currentError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-destructive-foreground" />
              <div className="space-y-1">
                <p className="font-medium">AI summary unavailable</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {currentError}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {!query.isLoading &&
        !currentError &&
        query.data?.status === "unavailable" ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-100" />
              <div className="space-y-1">
                <p className="font-medium text-amber-100">AI summary not configured yet</p>
                <p className="text-sm leading-6 text-amber-50/80">
                  {query.data.message}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {!query.isLoading &&
        !currentError &&
        query.data?.status === "success" ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold">
                    {query.data.summary.headline}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {query.data.summary.summary}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <p>
                      Generated {new Date(query.data.generatedAt).toLocaleString()}
                    </p>
                    <p>
                      {query.data.cacheStatus === "saved"
                        ? "Showing your last saved summary."
                        : "Saved just now."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm font-semibold">Highlights</p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                  {query.data.summary.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm font-semibold">Suggested next actions</p>
                <ol className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                  {query.data.summary.actions.map((action, index) => (
                    <li key={action} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                        {index + 1}
                      </span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-secondary/50 p-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {query.data.summary.confidence_note}
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
