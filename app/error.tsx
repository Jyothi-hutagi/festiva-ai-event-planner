"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto grid w-full max-w-lg gap-4 p-8">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p>
        Festiva could not open this page. Try again, or come back to the
        planner.
      </p>
      <button
        type="button"
        onClick={reset}
        className="w-fit rounded-md border border-border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Try again
      </button>
    </main>
  );
}
