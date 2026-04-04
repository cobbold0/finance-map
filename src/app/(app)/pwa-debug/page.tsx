import { PageHeader } from "@/components/app/page-header";
import { PwaDebugPanel } from "@/features/pwa/pwa-debug-panel";
import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata("PWA Debug", "Inspect PWA status.");

export default function PwaDebugPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="PWA Debug"
        description="Inspect service worker and cache status."
      />
      <PwaDebugPanel />
    </div>
  );
}
