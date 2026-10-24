import { categoryShares, formatINR, perGuest } from "@/lib/budget";
import type { Plan } from "@/lib/schema";

function formatShare(share: number) {
  const rounded = Math.round(share * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

export function BudgetTable({
  budget,
  guestCount,
}: {
  budget: Plan["budget"];
  guestCount: number;
}) {
  const rows = categoryShares(budget.categories, budget.total);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">Budget by category</caption>
        <thead>
          <tr className="border-b border-border text-left">
            <th scope="col" className="py-2 pr-3 font-medium">
              Category
            </th>
            <th scope="col" className="py-2 pr-3 font-medium">
              Amount
            </th>
            <th scope="col" className="py-2 pr-3 font-medium">
              Percent
            </th>
            <th scope="col" className="py-2 font-medium">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((category, index) => (
            <tr
              key={`${category.name}-${index}`}
              className="border-b border-border"
            >
              <th scope="row" className="py-2 pr-3 font-normal">
                {budget.categories[index]?.name}
              </th>
              <td className="py-2 pr-3">{formatINR(category.amount)}</td>
              <td className="py-2 pr-3">{formatShare(category.share)}</td>
              <td className="py-2">{budget.categories[index]?.notes ?? ""}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="py-2 pr-3 font-medium">
              Total
            </th>
            <td className="py-2 pr-3 font-medium">{formatINR(budget.total)}</td>
            <td className="py-2 pr-3 font-medium">100%</td>
            <td />
          </tr>
          <tr>
            <th scope="row" className="py-2 pr-3 font-medium">
              Per guest
            </th>
            <td className="py-2 pr-3 font-medium">
              {`${formatINR(perGuest(budget.total, guestCount))} per guest`}
            </td>
            <td />
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
