"use client";

import { Button } from "@/components/ui/button";
import { buildIcs } from "@/lib/ics";
import type { EventInput, Plan } from "@/lib/schema";

export function AddToCalendar({
  input,
  plan,
}: {
  input: EventInput;
  plan: Plan;
}) {
  function download() {
    const blob = new Blob([buildIcs(input, plan)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plan.ics";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="outline" onClick={download}>
      Add to calendar
    </Button>
  );
}
