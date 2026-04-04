import { z } from "zod";

export const aiSummarySchema = z.object({
  headline: z.string().min(1),
  summary: z.string().min(1),
  highlights: z.array(z.string().min(1)).min(3).max(5),
  actions: z.array(z.string().min(1)).min(2).max(4),
  confidence_note: z.string().min(1),
});

export type AISummary = z.infer<typeof aiSummarySchema>;

export type AISummaryApiResponse =
  | {
      status: "success";
      summary: AISummary;
      generatedAt: string;
      source: "model" | "local_fallback";
      cacheStatus: "saved" | "generated";
    }
  | {
      status: "unavailable";
      message: string;
      generatedAt: string;
      code: "missing_api_key";
    }
  | {
      status: "error";
      message: string;
      generatedAt: string;
      code: "generation_failed";
    };
