import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-56 flex-col items-center justify-center text-center">
        <div className="max-w-sm space-y-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          {action ? <div className="pt-2">{action}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
