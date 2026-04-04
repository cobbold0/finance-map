import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  getCurrentUserProfile,
  getDashboardSnapshot,
  getReportsSnapshot,
} from "@/data/finance-repository";
import {
  aiSummarySchema,
  type AISummary,
  type AISummaryApiResponse,
} from "@/features/ai-summary/schema";
import { getServerEnv } from "@/lib/env";

type GeminiGenerateContentSuccess = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function jsonResponse(body: AISummaryApiResponse, status = 200) {
  return NextResponse.json(body, { status });
}

function extractOutputText(response: GeminiGenerateContentSuccess) {
  for (const candidate of response.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (typeof part.text === "string" && part.text.trim()) {
        return part.text;
      }
    }
  }

  return null;
}

function buildFallbackSummary(baseCurrency: string): AISummary {
  return {
    headline: "You have only a small amount of tracked activity so far.",
    summary:
      "Finance Map can already see your account setup, but it still needs more real activity before an AI summary can spot meaningful trends.",
    highlights: [
      "Your finance workspace is set up and ready to start learning from real transactions.",
      `Your totals will be summarized in ${baseCurrency} once more activity is tracked.`,
      "Budgets, goals, and transaction history become much more useful after your first few entries.",
    ],
    actions: [
      "Record your first income or expense so the app has real movement to summarize.",
      "Set a monthly budget to give the summary clearer spending context.",
    ],
    confidence_note:
      "This starter summary is based on limited app data, so it is intentionally conservative.",
  };
}

async function getAuthedContext() {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return { supabase, user };
}

async function readSavedSummary() {
  const ctx = await getAuthedContext();

  if (!ctx) {
    return null;
  }

  const { data, error } = await ctx.supabase
    .from("ai_summaries")
    .select("summary, source, generated_at")
    .eq("user_id", ctx.user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const parsed = aiSummarySchema.safeParse(data.summary);

  if (!parsed.success) {
    return null;
  }

  return {
    summary: parsed.data,
    source: data.source as "model" | "local_fallback",
    generatedAt: data.generated_at,
  };
}

async function saveSummary(summary: AISummary, source: "model" | "local_fallback") {
  const ctx = await getAuthedContext();

  if (!ctx) {
    return false;
  }

  const { error } = await ctx.supabase.from("ai_summaries").upsert({
    user_id: ctx.user.id,
    summary,
    source,
    generated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return !error;
}

async function generateSummary(): Promise<AISummaryApiResponse | NextResponse> {
  const [profile, dashboard, reports] = await Promise.all([
    getCurrentUserProfile(),
    getDashboardSnapshot(),
    getReportsSnapshot(),
  ]);

  if (!profile) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const generatedAt = new Date().toISOString();
  const hasMeaningfulData =
    dashboard.walletCount > 0 ||
    dashboard.recentTransactions.length > 0 ||
    dashboard.activeGoals.length > 0 ||
    Boolean(dashboard.budgetHealth) ||
    dashboard.totalInvestmentsBase > 0;

  if (!hasMeaningfulData) {
    const summary = buildFallbackSummary(profile.baseCurrency);
    await saveSummary(summary, "local_fallback");

    return {
      status: "success",
      summary,
      generatedAt,
      source: "local_fallback",
      cacheStatus: "generated",
    };
  }

  const env = getServerEnv();

  if (!env?.GEMINI_API_KEY) {
    return {
      status: "unavailable",
      message:
        "AI Summary is unavailable because the Gemini API key is not configured on this environment yet.",
      generatedAt,
      code: "missing_api_key",
    };
  }

  const financeContext = {
    profile: {
      baseCurrency: profile.baseCurrency,
    },
    dashboard: {
      totalBalanceBase: dashboard.totalBalanceBase,
      totalIncomeBase: dashboard.totalIncomeBase,
      totalExpenseBase: dashboard.totalExpenseBase,
      totalInvestmentsBase: dashboard.totalInvestmentsBase,
      savingsRate: dashboard.savingsRate,
      walletCount: dashboard.walletCount,
      budgetHealth: dashboard.budgetHealth,
      activeGoals: dashboard.activeGoals.map((goal) => ({
        name: goal.name,
        savedAmount: goal.savedAmount,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate,
        status: goal.status,
      })),
      alerts: dashboard.alerts.map((alert) => ({
        title: alert.title,
        scheduledFor: alert.scheduledFor,
        status: alert.status,
      })),
      recentTransactions: dashboard.recentTransactions.map((transaction) => ({
        type: transaction.displayType,
        amount: transaction.amount,
        currency: transaction.nativeCurrency,
        category: transaction.category,
        occurredAt: transaction.occurredAt,
        notes: transaction.notes,
      })),
    },
    reports: {
      trends: reports.trends,
      topExpenseCategories: [...reports.expenseDistribution]
        .sort((left, right) => right.value - left.value)
        .slice(0, 5),
    },
  };

  const jsonSchema = z.toJSONSchema(aiSummarySchema);
  delete (jsonSchema as { $schema?: string }).$schema;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  "You are a supportive financial product analyst inside Finance Map. Create a concise user-facing summary grounded only in the provided app data. Be calm, practical, and non-judgmental. Do not give regulated financial advice, do not invent missing facts, and do not mention internal implementation details.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Create an AI financial summary from this Finance Map snapshot:\n${JSON.stringify(
                    financeContext,
                  )}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: jsonSchema,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      return {
        status: "error",
        message:
          errorText.trim() ||
          "The AI summary service returned an unexpected error.",
        generatedAt,
        code: "generation_failed",
      };
    }

    const payload = (await response.json()) as GeminiGenerateContentSuccess;
    const outputText = extractOutputText(payload);

    if (!outputText) {
      return {
        status: "error",
        message:
          "The AI summary did not return readable content. Please try again.",
        generatedAt,
        code: "generation_failed",
      };
    }

    const parsed = aiSummarySchema.safeParse(JSON.parse(outputText));

    if (!parsed.success) {
      return {
        status: "error",
        message:
          "The AI summary response did not match the expected structure.",
        generatedAt,
        code: "generation_failed",
      };
    }

    await saveSummary(parsed.data, "model");

    return {
      status: "success",
      summary: parsed.data,
      generatedAt,
      source: "model",
      cacheStatus: "generated",
    };
  } catch {
    return {
      status: "error",
      message:
        "The AI summary could not be generated right now. Please try again shortly.",
      generatedAt,
      code: "generation_failed",
    };
  }
}

export async function GET() {
  const saved = await readSavedSummary();

  if (saved) {
    return jsonResponse(
      {
        status: "success",
        summary: saved.summary,
        generatedAt: saved.generatedAt,
        source: saved.source,
        cacheStatus: "saved",
      },
      200,
    );
  }

  const result = await generateSummary();

  if (result instanceof NextResponse) {
    return result;
  }

  return jsonResponse(result, result.status === "success" ? 200 : result.status === "unavailable" ? 503 : 502);
}

export async function POST() {
  const result = await generateSummary();

  if (result instanceof NextResponse) {
    return result;
  }

  return jsonResponse(result, result.status === "success" ? 200 : result.status === "unavailable" ? 503 : 502);
}
