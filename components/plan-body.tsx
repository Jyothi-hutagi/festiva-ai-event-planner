import { BudgetChart } from "@/components/budget-chart";
import { ProgressBar } from "@/components/progress-bar";
import { BudgetTable } from "@/components/budget-table";
import { Countdown } from "@/components/countdown";
import { IdeasPanel } from "@/components/ideas-panel";
import { Timeline } from "@/components/timeline";
import { VendorList } from "@/components/vendor-list";
import type { Plan } from "@/lib/schema";
import type { TickMap } from "@/lib/ticks";

export function PlanBody({
  plan,
  eventDate,
  guestCount,
  ticks,
  onToggleTick,
}: {
  plan: Plan;
  eventDate: string;
  guestCount: number;
  ticks: TickMap;
  onToggleTick: (key: string) => void;
}) {
  return (
    <article className="print-sheet grid gap-6 print:bg-white print:text-black">
      <ProgressBar plan={plan} ticks={ticks} />
      <header className="grid gap-2">
        <h2 className="text-xl font-semibold">Your plan</h2>
        <p>{plan.summary}</p>
      </header>
      <section className="grid gap-4">
        <h3 className="font-medium">Budget</h3>
        <BudgetChart budget={plan.budget} />
        <BudgetTable budget={plan.budget} guestCount={guestCount} />
      </section>
      <section className="grid gap-3">
        <h3 className="font-medium">Timeline</h3>
        <Countdown date={eventDate} />
        <Timeline timeline={plan.timeline} />
      </section>
      <section className="grid gap-3">
        <h3 className="font-medium">Vendors</h3>
        <VendorList
          vendors={plan.vendors}
          ticks={ticks}
          onToggle={onToggleTick}
        />
      </section>
      <section className="grid gap-3">
        <h3 className="font-medium">Ideas</h3>
        <IdeasPanel ideas={plan.ideas} />
      </section>
    </article>
  );
}
