"use client";

import { AddToCalendar } from "@/components/add-to-calendar";
import { checklistProgress } from "@/components/progress-bar";
import { PrintButton } from "@/components/print-button";
import { CopyTextButton, WhatsAppShare } from "@/components/share-plan";
import { Button } from "@/components/ui/button";
import { daysUntil } from "@/lib/countdown";
import { planToText } from "@/lib/share-text";
import type { EventInput, Plan } from "@/lib/schema";
import type { TickMap } from "@/lib/ticks";

function daysLabel(date: string) {
  const days = daysUntil(date);
  if (days === 0) return "Today";
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export function StickyBar({
  shown,
  input,
  plan,
  ticks,
  onEdit,
  onSave,
}: {
  shown: boolean;
  input: EventInput;
  plan: Plan;
  ticks: TickMap;
  onEdit: () => void;
  onSave: () => void;
}) {
  const { done, total } = checklistProgress(plan, ticks);
  const text = planToText(input, plan, ticks);

  return (
    <div
      hidden={!shown}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-4 py-3 print:hidden"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <p>
          {daysLabel(input.date)} · {done} of {total} done
        </p>
        <div className="flex flex-nowrap items-center gap-2 md:flex-wrap">
          <div className="hidden md:contents">
            <Button type="button" variant="outline" onClick={onEdit}>
              Edit details
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="px-3 whitespace-nowrap"
            onClick={onSave}
          >
            Save this plan
          </Button>
          <div className="hidden md:contents">
            <CopyTextButton text={text} />
            <WhatsAppShare text={text} />
            <AddToCalendar input={input} plan={plan} />
          </div>
          <PrintButton className="px-3 whitespace-nowrap" />
          <details className="md:hidden">
            <summary className="flex min-h-11 cursor-pointer items-center px-1 text-base font-semibold whitespace-nowrap">
              More
            </summary>
            <div className="mt-2 grid gap-2">
              <Button type="button" variant="outline" onClick={onEdit}>
                Edit details
              </Button>
              <CopyTextButton text={text} />
              <WhatsAppShare text={text} />
              <AddToCalendar input={input} plan={plan} />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
