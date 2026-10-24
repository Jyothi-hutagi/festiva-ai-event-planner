"use client";

import * as React from "react";
import { cn } from "cn";
import { ResponsiveContainer } from "recharts";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

function chartStyle(config: ChartConfig): React.CSSProperties {
  const style: Record<string, string> = {};
  for (const [key, item] of Object.entries(config)) {
    if (item.color) {
      style[`--color-${key}`] = item.color;
    }
  }
  return style;
}

export function ChartContainer({
  className,
  children,
  config,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>["children"];
}) {
  return (
    <div
      data-slot="chart"
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
        className,
      )}
      style={{ ...chartStyle(config), ...style }}
      {...props}
    >
      <ResponsiveContainer initialDimension={{ width: 320, height: 200 }}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
