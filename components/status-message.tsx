import { ErrorNote } from "@/components/error-note";

export function StatusMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return <ErrorNote message={message} onRetry={onRetry} />;
}
