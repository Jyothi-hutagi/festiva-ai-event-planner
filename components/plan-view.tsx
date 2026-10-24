"use client";

import { useState } from "react";
import { DecorPreview } from "@/components/decor-preview";
import { PlanBody } from "@/components/plan-body";
import { ShopDecor } from "@/components/shop-decor";
import { VenuesList } from "@/components/venues-list";
import type { ShopState, VenueState } from "@/lib/load-recommendations";
import type { EventInput, Plan } from "@/lib/schema";
import type { TickMap } from "@/lib/ticks";

const tabs = [
  ["plan", "Plan"],
  ["decor", "Decor Preview"],
  ["shop", "Shop Decor"],
  ["venues", "Venues & Stay"],
] as const;

type TabKey = (typeof tabs)[number][0];

export function PlanView({
  plan,
  input,
  ticks,
  shopping,
  venues,
  imagePrompt,
  onToggleTick,
  onRetryShopping,
  onRetryVenues,
  onImagePrompt,
}: {
  plan: Plan;
  input: EventInput;
  ticks: TickMap;
  shopping: ShopState;
  venues: VenueState;
  imagePrompt: string;
  onToggleTick: (key: string) => void;
  onRetryShopping: () => void;
  onRetryVenues: () => void;
  onImagePrompt: (prompt: string) => void;
}) {
  const [tab, setTab] = useState<TabKey>("plan");

  function moveTab(direction: 1 | -1) {
    const index = tabs.findIndex(([key]) => key === tab);
    const next = tabs[(index + direction + tabs.length) % tabs.length][0];
    setTab(next);
    document.getElementById(`plan-tab-${next}`)?.focus();
  }

  return (
    <div className="print-sheet grid gap-4">
      <div
        role="tablist"
        aria-label="Plan sections"
        className="flex flex-wrap gap-2 print:hidden"
      >
        {tabs.map(([key, label]) => {
          const selected = tab === key;
          return (
            <button
              key={key}
              id={`plan-tab-${key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`plan-panel-${key}`}
              tabIndex={selected ? 0 : -1}
              className="min-h-11 border-b-[3px] border-transparent bg-transparent px-3 text-base font-medium text-foreground aria-selected:border-primary"
              onClick={() => setTab(key)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveTab(event.key === "ArrowRight" ? 1 : -1);
                }
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div
        id="plan-panel-plan"
        role="tabpanel"
        aria-labelledby="plan-tab-plan"
        hidden={tab !== "plan"}
        data-print-section=""
      >
        <PlanBody
          plan={plan}
          eventDate={input.date}
          guestCount={input.guestCount}
          ticks={ticks}
          onToggleTick={onToggleTick}
        />
      </div>
      <div
        id="plan-panel-decor"
        role="tabpanel"
        aria-labelledby="plan-tab-decor"
        hidden={tab !== "decor"}
        className="print:hidden"
      >
        <DecorPreview
          input={input}
          plan={plan}
          savedPrompt={imagePrompt}
          onPrompt={onImagePrompt}
        />
      </div>
      <div
        id="plan-panel-shop"
        role="tabpanel"
        aria-labelledby="plan-tab-shop"
        hidden={tab !== "shop"}
        data-print-section=""
      >
        <ShopDecor state={shopping} onRetry={onRetryShopping} />
      </div>
      <div
        id="plan-panel-venues"
        role="tabpanel"
        aria-labelledby="plan-tab-venues"
        hidden={tab !== "venues"}
        data-print-section=""
      >
        <VenuesList plan={plan} state={venues} onRetry={onRetryVenues} />
      </div>
    </div>
  );
}
