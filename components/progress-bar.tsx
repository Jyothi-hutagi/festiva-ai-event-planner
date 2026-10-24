"use client";

import type { Plan } from "@/lib/schema";
import { tickKey, type TickMap } from "@/lib/ticks";

export function checklistProgress(plan: Plan, ticks: TickMap) {
  let total = 0;
  let done = 0;
  for (const vendor of plan.vendors) {
    for (const item of vendor.checklist) {
      total += 1;
      if (ticks[tickKey(vendor.type, item)]) {
        done += 1;
      }
    }
  }
  return { done, total };
}

export function ProgressBar({ plan, ticks }: { plan: Plan; ticks: TickMap }) {
  const { done, total } = checklistProgress(plan, ticks);
  const width = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label={`${done} of ${total} done`}
      className="grid gap-1"
    >
      <p className="text-sm">
        {done} of {total} done
      </p>
      <div className="h-2 overflow-hidden rounded bg-muted">
        <div className="h-2 bg-primary" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
