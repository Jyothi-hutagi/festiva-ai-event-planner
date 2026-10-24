import { BudgetChart } from "@/components/budget-chart";
import { BudgetTable } from "@/components/budget-table";
import { Timeline } from "@/components/timeline";
import { VendorList } from "@/components/vendor-list";
import type { Plan } from "@/lib/schema";
import type { TickMap } from "@/lib/ticks";

export function PlanSummary({ plan }: { plan: Plan }) {
  return (
    <header className="grid gap-2">
      <h2 className="font-heading text-2xl font-semibold">Your plan</h2>
      {plan.summary ? (
        <p>{plan.summary}</p>
      ) : (
        <p>No summary yet. Ask for a change, or create the plan again.</p>
      )}
    </header>
  );
}

export function BudgetSection({
  plan,
  guestCount,
}: {
  plan: Plan;
  guestCount: number;
}) {
  return (
    <section className="paper-sheet grid min-w-0 gap-4 p-4 md:p-6">
      <h3 className="font-heading text-2xl font-semibold">Budget</h3>
      {plan.budget.categories.length === 0 ? (
        <p>No budget categories yet. Create the plan again to fill this in.</p>
      ) : (
        <>
          <BudgetChart budget={plan.budget} />
          <BudgetTable budget={plan.budget} guestCount={guestCount} />
        </>
      )}
    </section>
  );
}

export function TimelineSection({
  plan,
  eventDate,
}: {
  plan: Plan;
  eventDate: string;
}) {
  return (
    <section className="grid gap-4">
      <h3 className="font-heading text-2xl font-semibold">Timeline</h3>
      {plan.timeline.length === 0 ? (
        <p>No timeline yet. Create the plan again to fill this in.</p>
      ) : (
        <Timeline timeline={plan.timeline} eventDate={eventDate} />
      )}
    </section>
  );
}

export function VendorsSection({
  plan,
  ticks,
  onToggleTick,
}: {
  plan: Plan;
  ticks: TickMap;
  onToggleTick: (key: string) => void;
}) {
  return (
    <section className="grid gap-3">
      <h3 className="font-heading text-2xl font-semibold">Vendors</h3>
      {plan.vendors.length === 0 ? (
        <p>No vendors yet. Create the plan again to fill this in.</p>
      ) : (
        <VendorList
          vendors={plan.vendors}
          ticks={ticks}
          onToggle={onToggleTick}
        />
      )}
    </section>
  );
}
