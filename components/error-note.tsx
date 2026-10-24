import { Button } from "@/components/ui/button";

export function ErrorNote({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="grid gap-3">
      <p aria-live="assertive" aria-atomic="true" className="text-destructive">
        {message}
      </p>
      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}
