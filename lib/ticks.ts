import type { Plan } from "./schema";

export type TickMap = Record<string, boolean>;

export function tickKey(vendorType: string, item: string) {
  return JSON.stringify([vendorType, item]);
}

export function reapplyTicks(
  ticks: TickMap,
  vendors: Plan["vendors"],
): TickMap {
  const next: TickMap = {};
  for (const vendor of vendors) {
    for (const item of vendor.checklist) {
      const key = tickKey(vendor.type, item);
      if (ticks[key]) {
        next[key] = true;
      }
    }
  }
  return next;
}
