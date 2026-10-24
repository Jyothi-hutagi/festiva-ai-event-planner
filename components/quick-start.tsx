"use client";

import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/budget";
import type { EventInput } from "@/lib/schema";

export type QuickPreset = {
  label: string;
  eventType: EventInput["eventType"];
  guestCount: number;
  budget: number;
  eventName?: string;
  decorStyle?: string;
};

const presets: QuickPreset[] = [
  {
    label: "Trinket tray painting workshop",
    eventType: "workshop",
    guestCount: 12,
    budget: 15000,
    eventName: "Trinket tray painting workshop",
    decorStyle: "pastel boho",
  },
  {
    label: "Birthday party",
    eventType: "birthday",
    guestCount: 30,
    budget: 40000,
  },
  {
    label: "Small wedding",
    eventType: "wedding",
    guestCount: 100,
    budget: 300000,
  },
  {
    label: "Community diwali meetup",
    eventType: "community",
    guestCount: 80,
    budget: 50000,
  },
];

export function QuickStart({
  onSelect,
}: {
  onSelect: (preset: QuickPreset) => void;
}) {
  return (
    <div className="grid gap-3">
      <p id="quick-start-label">Start from an example</p>
      <div
        role="group"
        aria-labelledby="quick-start-label"
        className="flex flex-wrap gap-3"
      >
        {presets.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="outline"
            className="h-auto flex-col items-start gap-0.5 bg-card py-2 text-left whitespace-normal"
            onClick={() => onSelect(preset)}
          >
            <span>{preset.label}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {preset.guestCount} guests, {formatINR(preset.budget)}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
