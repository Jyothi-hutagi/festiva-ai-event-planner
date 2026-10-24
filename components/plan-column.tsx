import { AddToCalendar } from "@/components/add-to-calendar";
import { Button } from "@/components/ui/button";
import { PlanView } from "@/components/plan-view";
import { PrintButton } from "@/components/print-button";
import { RefineChat } from "@/components/refine-chat";
import { SharePlan } from "@/components/share-plan";
import { StatusMessage } from "@/components/status-message";
import { formatINR } from "@/lib/budget";
import type { ShopState, VenueState } from "@/lib/load-recommendations";
import type { EventInput, Plan } from "@/lib/schema";
import type { TickMap } from "@/lib/ticks";

const eventLabels: Record<EventInput["eventType"], string> = {
  wedding: "Wedding",
  birthday: "Birthday",
  community: "Community event",
  workshop: "Workshop",
  corporate: "Corporate",
  other: "Other",
};

export function PlanColumn({
  status,
  message,
  plan,
  input,
  ticks,
  budgetChange,
  canUndo,
  chatKey,
  viewKey,
  shopping,
  venues,
  imagePrompt,
  onRetry,
  onToggleTick,
  onRefined,
  onUndo,
  onRetryShopping,
  onRetryVenues,
  onImagePrompt,
  onSave,
}: {
  status: "empty" | "loading" | "error" | "ready";
  message: string;
  plan: Plan | null;
  input: EventInput | null;
  ticks: TickMap;
  budgetChange: string | null;
  canUndo: boolean;
  chatKey: number;
  viewKey: number;
  shopping: ShopState;
  venues: VenueState;
  imagePrompt: string;
  onRetry: () => void;
  onToggleTick: (key: string) => void;
  onRefined: (plan: Plan) => void;
  onUndo: () => void;
  onRetryShopping: () => void;
  onRetryVenues: () => void;
  onImagePrompt: (prompt: string) => void;
  onSave: () => void;
}) {
  return (
    <section className="grid gap-4">
      {status === "ready" && plan ? (
        <div className="grid gap-4 print:hidden">
          <PrintButton />
          <RefineChat
            key={chatKey}
            plan={plan}
            language={input?.language ?? "en"}
            canUndo={canUndo}
            onRefined={onRefined}
            onUndo={onUndo}
          />
        </div>
      ) : null}
      <div aria-live="polite" className="grid gap-4">
        {status === "loading" ? (
          <StatusMessage status="loading" message="Creating your plan..." />
        ) : null}
        {status === "error" ? (
          <StatusMessage status="error" message={message} onRetry={onRetry} />
        ) : null}
        {budgetChange ? <p>{budgetChange}</p> : null}
        {status === "ready" && plan && input ? (
          <>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <Button type="button" variant="outline" onClick={onSave}>
                Save
              </Button>
              <AddToCalendar input={input} plan={plan} />
              <SharePlan input={input} plan={plan} ticks={ticks} />
            </div>
            <p className="text-sm text-muted-foreground">
              {eventLabels[input.eventType]} in {input.city} for{" "}
              {input.guestCount} guests, budget {formatINR(input.budget)}
            </p>
            <PlanView
              key={viewKey}
              plan={plan}
              input={input}
              ticks={ticks}
              shopping={shopping}
              venues={venues}
              imagePrompt={imagePrompt}
              onToggleTick={onToggleTick}
              onRetryShopping={onRetryShopping}
              onRetryVenues={onRetryVenues}
              onImagePrompt={onImagePrompt}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
