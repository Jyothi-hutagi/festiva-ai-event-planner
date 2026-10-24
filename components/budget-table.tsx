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
  const perGuestText = `${formatINR(perGuest(budget.total, guestCount))} per guest`;

  return (
    <table className="w-full table-fixed border-collapse text-[17px]">
      <caption className="sr-only">Budget by category</caption>
      <thead>
        <tr className="border-b border-border text-left">
          <th scope="col" className="w-[28%] py-2 pr-2 font-medium break-words">
            Category
          </th>
          <th scope="col" className="w-[24%] py-2 pr-2 font-medium break-words">
            Amount
          </th>
          <th scope="col" className="w-[16%] py-2 pr-2 font-medium break-words">
            Percent
          </th>
          <th scope="col" className="py-2 font-medium break-words">
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
            <th scope="row" className="py-2 pr-2 font-normal break-words">
              {budget.categories[index]?.name}
            </th>
            <td className="py-2 pr-2 break-words">
              {formatINR(category.amount)}
            </td>
            <td className="py-2 pr-2 break-words">
              {formatShare(category.share)}
            </td>
            <td className="py-2 break-words">
              {budget.categories[index]?.notes ?? ""}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" className="py-2 pr-2 font-medium">
            Total
          </th>
          <td className="py-2 pr-2 font-medium">{formatINR(budget.total)}</td>
          <td className="py-2 pr-2 font-medium">100%</td>
          <td />
        </tr>
        <tr>
          <th scope="row" className="py-2 pr-2 font-medium">
            Per guest
          </th>
          <td className="py-2 pr-2 font-medium" colSpan={3}>
            {perGuestText}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
