import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 -mx-4 mb-10 border-b border-white/6 bg-black/75 px-4 py-4 backdrop-blur-xl md:static md:m-0 md:mb-4 md:border-none md:bg-transparent md:px-0 md:py-0",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight md:text-xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {action ? <div className="hidden md:block">{action}</div> : null}
      </div>
      {action ? <div className="mt-4 md:hidden">{action}</div> : null}
    </div>
  );
}

export function HeaderActionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Button asChild>
      <a href={href}>{children}</a>
    </Button>
  );
}
