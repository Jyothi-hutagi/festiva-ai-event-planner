"use client";

import { useState } from "react";
import { ErrorNote } from "@/components/error-note";
import { ExternalLink } from "@/components/external-link";
import { LoadingBlock } from "@/components/loading-block";
import { copyPlainText } from "@/components/share-plan";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/budget";
import { shopLoadingMessage } from "@/lib/loading-cycle";
import type { ShopState } from "@/lib/load-recommendations";
import { sanitizeUrl, urlKey } from "@/lib/sanitize-url";
import { shopQuantity, shoppingListText } from "@/lib/shopping-list";

export function ShopDecor({
  state,
  guestCount,
  onRetry,
}: {
  state: ShopState;
  guestCount: number;
  onRetry: () => void;
}) {
  const [copied, setCopied] = useState("");
  const rows =
    state.status === "ready"
      ? state.items.flatMap((item) => {
          const href = urlKey(item.url);
          const hostname = sanitizeUrl(item.url);
          if (!href || !hostname) {
            return [];
          }
          return [
            {
              item,
              href,
              quantity: shopQuantity(guestCount, item.quantity),
            },
          ];
        })
      : [];
  const listText = shoppingListText(
    rows.map((row) => ({
      item: row.item.item,
      quantity: row.quantity,
      store: row.item.store,
    })),
  );

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl font-semibold">Shop decor</h2>
        {rows.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void copyPlainText(listText).then((ok) => {
                setCopied(ok ? "Copied" : "Could not copy the shopping list.");
              });
            }}
          >
            Copy shopping list
          </Button>
        ) : null}
      </div>
      <p aria-live="polite" className="sr-only">
        {copied}
      </p>
      {state.status === "loading" ? (
        <LoadingBlock message={shopLoadingMessage} />
      ) : null}
      {state.status === "error" ? (
        <ErrorNote message={state.message} onRetry={onRetry} />
      ) : null}
      {state.status === "empty" ||
      (state.status === "ready" && rows.length === 0) ? (
        <p>
          No stores matched these decor items. Change the decor ideas, then
          create the plan again.
        </p>
      ) : null}
      {rows.map(({ item, href, quantity }) => (
        <article
          key={`${item.item}-${href}`}
          className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border py-3 print:break-inside-avoid"
        >
          <h3 className="min-w-0 flex-1 basis-36 font-medium break-words">
            {item.item}
          </h3>
          <p className="break-words">Qty {quantity}</p>
          <p className="min-w-0 break-words">{item.store}</p>
          <p className="break-words">{formatINR(item.approxPriceInr)}</p>
          <ExternalLink
            href={href}
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            Open store
          </ExternalLink>
          <p className="basis-full">approx., check on site</p>
        </article>
      ))}
    </section>
  );
}
