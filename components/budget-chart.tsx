"use client";

import { createElement } from "react";
import { Bar, BarChart, XAxis, YAxis, type BarShapeProps } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatINR } from "@/lib/budget";
import type { Plan } from "@/lib/schema";

const fills = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

const chartConfig = {
  amount: { label: "Amount", color: "var(--chart-1)" },
} satisfies ChartConfig;

const rowHeight = 160;

function num(value: number | null | undefined) {
  return typeof value === "number" ? value : 0;
}

function readRow(payload: unknown) {
  const record =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : {};
  return {
    name: typeof record.name === "string" ? record.name : "",
    amount: typeof record.amount === "number" ? record.amount : 0,
    fill: typeof record.fill === "string" ? record.fill : "var(--chart-1)",
  };
}

function plotLabel(name: string, amount: string) {
  return createElement(
    "div",
    {
      xmlns: "http://www.w3.org/1999/xhtml",
      className: "flex items-start justify-between gap-3 text-foreground",
      style: { fontSize: 17, lineHeight: 1.45 },
    } as React.HTMLAttributes<HTMLDivElement>,
    createElement("span", { className: "min-w-0 break-words" }, name),
    createElement("span", { className: "shrink-0" }, amount),
  );
}

function CategoryRow(props: BarShapeProps) {
  const x = num(props.background?.x ?? props.x);
  const y = num(props.background?.y ?? props.y);
  const plotWidth = num(props.background?.width);
  const band = num(props.background?.height ?? props.height);
  const barHeight = 10;
  const barWidth = Math.max(0, Math.min(num(props.width), plotWidth) - 1);
  const row = readRow(props.payload);

  return (
    <g>
      <foreignObject
        x={x}
        y={y}
        width={plotWidth}
        height={Math.max(0, band - barHeight - 6)}
      >
        {plotLabel(row.name, formatINR(row.amount))}
      </foreignObject>
      <rect
        x={x + 0.5}
        y={y + band - barHeight}
        width={barWidth}
        height={barHeight}
        fill={row.fill}
        stroke="var(--chart-outline)"
        strokeWidth={1}
      />
    </g>
  );
}

export function BudgetChart({ budget }: { budget: Plan["budget"] }) {
  const rows = budget.categories.map((category, index) => ({
    name: category.name,
    amount: category.amount,
    fill: fills[index % fills.length],
  }));

  return (
    <ChartContainer
      config={chartConfig}
      aria-hidden="true"
      className="aspect-auto w-full min-w-0 print:hidden"
      style={{ height: Math.max(rows.length, 1) * rowHeight }}
    >
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        barCategoryGap={12}
      >
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" hide width={0} />
        <Bar
          dataKey="amount"
          isAnimationActive={false}
          radius={0}
          shape={(props) => <CategoryRow {...props} />}
        />
      </BarChart>
    </ChartContainer>
  );
}
