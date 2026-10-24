"use client";

import { ErrorNote } from "@/components/error-note";
import { ExternalLink } from "@/components/external-link";
import { LoadingBlock } from "@/components/loading-block";
import { formatINR, venueBudgetShare } from "@/lib/budget";
import { venueLoadingMessage } from "@/lib/loading-cycle";
import type { VenueState } from "@/lib/load-recommendations";
import { sanitizeUrl, urlKey } from "@/lib/sanitize-url";
import type { Plan } from "@/lib/schema";

function formatShare(share: number) {
  const rounded = Math.round(share * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

export function VenuesList({
  plan,
  city,
  state,
  onRetry,
}: {
  plan: Plan;
  city: string;
  state: VenueState;
  onRetry: () => void;
}) {
  const venueShare = venueBudgetShare(
    plan.budget.categories,
    plan.budget.total,
  );

  return (
    <section className="grid gap-3">
      <h2 className="font-heading text-2xl font-semibold">Venues & Stay</h2>
      {venueShare ? (
        <p>
          {`Venue budget share: ${formatINR(venueShare.amount)} (${formatShare(venueShare.share)})`}
        </p>
      ) : null}
      {state.status === "loading" ? (
        <LoadingBlock message={venueLoadingMessage(city)} />
      ) : null}
      {state.status === "error" ? (
        <ErrorNote message={state.message} onRetry={onRetry} />
      ) : null}
      {state.status === "empty" ? (
        <p>
          No venues matched this event. Edit the city, then create the plan
          again.
        </p>
      ) : null}
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
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border py-3 print:break-inside-avoid"
              >
                <h3 className="min-w-0 flex-1 basis-36 font-medium break-words">
                  {venue.name}
                </h3>
                <p className="min-w-0 break-words">{venue.address}</p>
                <p className="break-words">{venue.priceRange}</p>
                <ExternalLink
                  href={href}
                  className="inline-flex min-h-11 items-center underline underline-offset-4"
                >
                  Open website
                </ExternalLink>
                <p className="basis-full break-words">{venue.whyItFits}</p>
              </article>
            );
          })}
        </>
      ) : null}
    </section>
  );
}
