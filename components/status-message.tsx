import { Button } from "@/components/ui/button";

export function StatusMessage({
  status,
  message,
  onRetry,
}: {
  status: "loading" | "error" | "empty";
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
      <p>{message}</p>
      {status === "error" && onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
