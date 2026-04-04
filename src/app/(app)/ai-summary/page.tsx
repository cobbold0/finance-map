import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AISummaryPanel } from "@/features/ai-summary/ai-summary-panel";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("AI Summary", "Get a quick summary.");

export default function AISummaryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Summary"
        description="Get a quick summary of your finances."
      />

      <Card>
        <CardContent className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold">What this summary uses</p>
            <p className="text-sm leading-6 text-muted-foreground">
              The summary is grounded in your Finance Map data only: wallet
              balances, recent transactions, budget posture, active goals,
              reminders, and report trends. It is saved after generation and
              shown again on your next visit until you choose to refresh it. It
              does not change your data and it is not a chat experience in this
              first version.
            </p>
          </div>
        </CardContent>
      </Card>

      <AISummaryPanel />
    </div>
  );
}
