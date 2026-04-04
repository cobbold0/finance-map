import { AppShell } from "@/components/app/app-shell";
import { InstallPromptCard } from "@/components/app/install-prompt";
import { PageShell } from "@/components/app/page-shell";
import { requireOnboardedUserProfile } from "@/data/auth";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboardedUserProfile();

  return (
    <AppShell>
      <PageShell>
        <InstallPromptCard />
        {children}
      </PageShell>
    </AppShell>
  );
}
