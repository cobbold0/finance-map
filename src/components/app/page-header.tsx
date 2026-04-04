import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeaderClient } from "@/components/app/page-header-client";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <PageHeaderClient
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}

export function HeaderActionLink({
  href,
  icon: Icon,
  children,
  variant,
  className,
}: {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  className?: string;
}) {
  return (
    <Button asChild variant={variant} className={cn("page-header-action", className)}>
      <Link href={href}>
        <span className="page-header-action-icon" aria-hidden="true">
          <Icon className="h-4 w-4" />
        </span>
        <span className="page-header-action-label">{children}</span>
      </Link>
    </Button>
  );
}
