"use client";

import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/budget";
import type { ShopState } from "@/lib/load-recommendations";
import { sanitizeUrl, urlKey } from "@/lib/sanitize-url";

export function ShopDecor({
  state,
  onRetry,
}: {
  state: ShopState;
  onRetry: () => void;
}) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Shop decor</h2>
        <Button
          type="button"
          variant="outline"
          disabled={state.status === "loading"}
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
      <div aria-live="polite" className="grid gap-3">
        {state.status === "loading" ? <p>Looking up stores...</p> : null}
        {state.status === "error" ? <p>{state.message}</p> : null}
        {state.status === "empty" ? (
          <p>No stores matched these decor items.</p>
        ) : null}
        {state.status === "ready"
          ? state.items.map((item) => {
              const href = urlKey(item.url);
              const hostname = sanitizeUrl(item.url);
              if (!href || !hostname) {
                return null;
              }
              return (
                <article
                  key={`${item.item}-${href}`}
                  className="print-card grid gap-1 rounded-lg border border-border p-4"
                >
                  <h3 className="font-medium">{item.item}</h3>
                  <p>{item.store}</p>
                  <p>{formatINR(item.approxPriceInr)} approx., check on site</p>
                  <p>{hostname}</p>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    Open store
                  </a>
                </article>
              );
            })
          : null}
      </div>
    </section>
  );
}
