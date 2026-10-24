"use client";

import { useEffect, useRef, useState } from "react";
import { Invitation } from "@/components/invitation";
import { InvitationArrival } from "@/components/invitation-arrival";
import { PlanView } from "@/components/plan-view";
import { StickyBar } from "@/components/sticky-bar";
import type { ShopState, VenueState } from "@/lib/load-recommendations";
import type { EventInput, Plan } from "@/lib/schema";
import type { TickMap } from "@/lib/ticks";

export function PlanColumn({
  plan,
  input,
  ticks,
  budgetChange,
  canUndo,
  viewKey,
  shopping,
  venues,
  imagePrompt,
  celebrate,
  onEdit,
  onToggleTick,
  onRefined,
  onUndo,
  onRetryShopping,
  onRetryVenues,
  onImagePrompt,
  onSave,
}: {
  plan: Plan;
  input: EventInput;
  ticks: TickMap;
  budgetChange: string | null;
  canUndo: boolean;
  viewKey: number;
  shopping: ShopState;
  venues: VenueState;
  imagePrompt: string;
  celebrate: boolean;
  onEdit: () => void;
  onToggleTick: (key: string) => void;
  onRefined: (plan: Plan) => void;
  onUndo: () => void;
  onRetryShopping: () => void;
  onRetryVenues: () => void;
  onImagePrompt: (prompt: string) => void;
  onSave: () => void;
}) {
  const inviteRef = useRef<HTMLDivElement>(null);
  const [barShown, setBarShown] = useState(false);

  useEffect(() => {
    const invite = inviteRef.current;
    if (!invite) return;
    function update() {
      const box = invite!.getBoundingClientRect();
      const docBottom = box.bottom + window.scrollY;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const scrolledAway = box.bottom <= 0;
      const canScrollAway = docBottom <= maxScroll + 1;
      setBarShown(scrolledAway || !canScrollAway);
    }
    update();
    const observer = new IntersectionObserver(update);
    observer.observe(invite);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section className="grid gap-6 pb-32">
      <div ref={inviteRef}>
        <InvitationArrival play={celebrate}>
          <Invitation
            name={input.eventName}
            eventType={input.eventType}
            city={input.city}
            date={input.date}
            guests={input.guestCount}
            budget={plan.budget.total}
            language={input.language}
          />
        </InvitationArrival>
      </div>
      {budgetChange ? <p>{budgetChange}</p> : null}
      <PlanView
        key={viewKey}
        plan={plan}
        input={input}
        ticks={ticks}
        shopping={shopping}
        venues={venues}
        imagePrompt={imagePrompt}
        canUndo={canUndo}
        onToggleTick={onToggleTick}
        onRefined={onRefined}
        onUndo={onUndo}
        onRetryShopping={onRetryShopping}
        onRetryVenues={onRetryVenues}
        onImagePrompt={onImagePrompt}
        onSave={onSave}
      />
      <StickyBar
        shown={barShown}
        input={input}
        plan={plan}
        ticks={ticks}
        onEdit={onEdit}
        onSave={onSave}
      />
    </section>
  );
}
