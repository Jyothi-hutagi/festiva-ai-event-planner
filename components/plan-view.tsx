"use client";

import { useState, type ReactNode } from "react";
import { DecorPreview } from "@/components/decor-preview";
import { IdeasPanel } from "@/components/ideas-panel";
import {
  BudgetSection,
  PlanSummary,
  TimelineSection,
  VendorsSection,
} from "@/components/plan-body";
import { PlanRail } from "@/components/plan-rail";
import { Button } from "@/components/ui/button";
import { RefineChat } from "@/components/refine-chat";
import { ShopDecor } from "@/components/shop-decor";
import { VenuesList } from "@/components/venues-list";
import { BRAND_NAME } from "@/lib/brand";
import type { ShopState, VenueState } from "@/lib/load-recommendations";
import type { EventInput, Plan } from "@/lib/schema";
import type { TickMap } from "@/lib/ticks";

const tabs = [
  ["plan", "Plan"],
  ["budget", "Budget"],
  ["timeline", "Timeline"],
  ["vendors", "Vendors"],
  ["ideas", "Ideas"],
  ["decor", "Decor Preview"],
  ["shop", "Shop Decor"],
  ["venues", "Venues & Stay"],
] as const;

type TabKey = (typeof tabs)[number][0];

function Panel({
  id,
  hidden,
  print = true,
  children,
}: {
  id: string;
  hidden: boolean;
  print?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      id={`plan-panel-${id}`}
      role="tabpanel"
      aria-labelledby={`plan-tab-${id}`}
      inert={hidden ? true : undefined}
      data-print-section={print ? "" : undefined}
      className={
        hidden
          ? print
            ? "hidden"
            : "hidden print:hidden"
          : print
            ? undefined
            : "print:hidden"
      }
    >
      {children}
    </div>
  );
}

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
  onRefined,
  onUndo,
  canUndo,
  onSave,
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
  onRefined: (plan: Plan) => void;
  onUndo: () => void;
  canUndo: boolean;
  onSave: () => void;
}) {
  const [tab, setTab] = useState<TabKey>("plan");

  return (
    <div className="print-sheet grid min-w-0 gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
      <p className="hidden font-heading text-2xl font-semibold print:block md:col-span-2">
        {BRAND_NAME}
      </p>
      <PlanRail tabs={tabs} tab={tab} onTab={(key) => setTab(key as TabKey)} />
      <div className="grid min-w-0 gap-4">
        <Panel id="plan" hidden={tab !== "plan"}>
          <div className="grid gap-4">
            <PlanSummary plan={plan} />
            <div className="print:hidden">
              <RefineChat
                plan={plan}
                language={input.language}
                canUndo={canUndo}
                onRefined={onRefined}
                onUndo={onUndo}
              />
            </div>
            <Button type="button" variant="outline" onClick={onSave}>
              Save this plan
            </Button>
          </div>
        </Panel>
        <Panel id="budget" hidden={tab !== "budget"}>
          <BudgetSection plan={plan} guestCount={input.guestCount} />
        </Panel>
        <Panel id="timeline" hidden={tab !== "timeline"}>
          <TimelineSection plan={plan} eventDate={input.date} />
        </Panel>
        <Panel id="vendors" hidden={tab !== "vendors"}>
          <VendorsSection
            plan={plan}
            ticks={ticks}
            onToggleTick={onToggleTick}
          />
        </Panel>
        <Panel id="ideas" hidden={tab !== "ideas"}>
          <IdeasPanel ideas={plan.ideas} onOpenDecor={() => setTab("decor")} />
        </Panel>
        <Panel id="decor" hidden={tab !== "decor"} print={false}>
          <DecorPreview
            input={input}
            plan={plan}
            savedPrompt={imagePrompt}
            onPrompt={onImagePrompt}
          />
        </Panel>
        <Panel id="shop" hidden={tab !== "shop"}>
          <ShopDecor
            state={shopping}
            guestCount={input.guestCount}
            onRetry={onRetryShopping}
          />
        </Panel>
        <Panel id="venues" hidden={tab !== "venues"}>
          <VenuesList
            plan={plan}
            city={input.city}
            state={venues}
            onRetry={onRetryVenues}
          />
        </Panel>
      </div>
    </div>
  );
}
