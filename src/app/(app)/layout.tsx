import { AppShell } from "@/components/app/app-shell";
import { InstallPromptCard } from "@/components/app/install-prompt";
import { NotificationPermissionCard } from "@/components/app/notification-permission-card";
import { PageShell } from "@/components/app/page-shell";
import { requireUserProfile } from "@/data/auth";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUserProfile();

  return (
    <AppShell>
      <PageShell>
        <InstallPromptCard />
        <NotificationPermissionCard />
        {children}
      </PageShell>
    </AppShell>
  );
}
