"use client";

import { Button } from "@/components/ui/button";
import { formatINR, venueBudgetShare } from "@/lib/budget";
import type { VenueState } from "@/lib/load-recommendations";
import { sanitizeUrl, urlKey } from "@/lib/sanitize-url";
import type { Plan } from "@/lib/schema";

function formatShare(share: number) {
  const rounded = Math.round(share * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

export function VenuesList({
  plan,
  state,
  onRetry,
}: {
  plan: Plan;
  state: VenueState;
  onRetry: () => void;
}) {
  const venueShare = venueBudgetShare(
    plan.budget.categories,
    plan.budget.total,
  );

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Venues & Stay</h2>
        <Button
          type="button"
          variant="outline"
          disabled={state.status === "loading"}
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
      {venueShare ? (
        <p>
          {`Venue budget share: ${formatINR(venueShare.amount)} (${formatShare(venueShare.share)})`}
        </p>
      ) : null}
      <div aria-live="polite" className="grid gap-3">
        {state.status === "loading" ? <p>Looking up venues...</p> : null}
        {state.status === "error" ? <p>{state.message}</p> : null}
        {state.status === "empty" ? <p>No venues matched this event.</p> : null}
        {state.status === "ready" ? (
          <>
            <p>Check availability and prices directly with the venue</p>
            {state.venues.map((venue) => {
              const href = urlKey(venue.url);
              const hostname = sanitizeUrl(venue.url);
              if (!href || !hostname) {
                return null;
              }
              return (
                <article
                  key={`${venue.name}-${href}`}
                  className="print-card grid gap-1 rounded-lg border border-border p-4"
                >
                  <h3 className="font-medium">{venue.name}</h3>
                  <p>{venue.whyItFits}</p>
                  <p>{venue.priceRange}</p>
                  <p>{venue.address}</p>
                  <p>{hostname}</p>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    Open website
                  </a>
                </article>
              );
            })}
          </>
        ) : null}
      </div>
    </section>
  );
}
