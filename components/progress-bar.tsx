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
