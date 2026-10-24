import { LoadingSkeleton } from "@/components/loading-skeleton";

export function LoadingBlock({ message }: { message: string }) {
  return (
    <div className="grid gap-4">
      <LoadingSkeleton />
      <p aria-live="polite" aria-atomic="true">
        {message}
      </p>
    </div>
  );
}
