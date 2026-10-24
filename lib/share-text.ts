import { formatINR } from "@/lib/budget";
import type { EventInput, Plan } from "@/lib/schema";
import { tickKey, type TickMap } from "@/lib/ticks";

const eventLabels: Record<EventInput["eventType"], string> = {
  wedding: "Wedding",
  birthday: "Birthday",
  community: "Community event",
  workshop: "Workshop",
  corporate: "Corporate",
  other: "Other",
};

export function planToText(input: EventInput, plan: Plan, ticks: TickMap) {
  const title =
    input.eventName.trim() ||
    `${eventLabels[input.eventType]} in ${input.city}`;
  const categories = plan.budget.categories.map(
    (category) => `${category.name}: ${formatINR(category.amount)}`,
  );
  const todos: string[] = [];
  for (const vendor of plan.vendors) {
    for (const item of vendor.checklist) {
      if (todos.length === 5) {
        break;
      }
      const mark = ticks[tickKey(vendor.type, item)] ? "[x]" : "[ ]";
      todos.push(`${mark} ${vendor.type}: ${item}`);
    }
  }
  return [
    title,
    input.date,
    `Budget: ${formatINR(plan.budget.total)}`,
    ...categories,
    "To-dos:",
    ...todos,
  ].join("\n");
}
