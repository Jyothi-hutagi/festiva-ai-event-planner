"use client";

import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { categoryShares } from "@/lib/budget";
import type { Plan } from "@/lib/schema";

const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const chartConfig = {
  amount: { label: "Amount", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function BudgetChart({ budget }: { budget: Plan["budget"] }) {
  const rows = categoryShares(budget.categories, budget.total).map(
    (category) => ({
      name: category.name,
      amount: category.amount,
    }),
  );

  return (
    <ChartContainer
      config={chartConfig}
      aria-label="Budget breakdown by category"
      className="aspect-auto h-64 w-full print:hidden"
    >
      <BarChart
        accessibilityLayer
        data={rows}
        layout="vertical"
        margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={128}
          tickLine={false}
          axisLine={false}
        />
        <Bar dataKey="amount" radius={4}>
          {rows.map((row, index) => (
            <Cell
              key={`${row.name}-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
