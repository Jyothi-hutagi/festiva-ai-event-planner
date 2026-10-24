"use client";

import { BRAND_NAME } from "@/lib/brand";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto grid w-full max-w-lg gap-4 p-8">
      <h1 className="font-heading text-2xl font-semibold">
        {BRAND_NAME} hit a problem
      </h1>
      <p>
        {BRAND_NAME} could not open this page. Try again, or come back to the
        planner.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-11 w-fit items-center rounded-[4px] border border-border px-4 text-base font-semibold"
      >
        Try again
      </button>
    </main>
  );
}
