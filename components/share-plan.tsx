"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { planToText } from "@/lib/share-text";
import type { EventInput, Plan } from "@/lib/schema";
import type { TickMap } from "@/lib/ticks";

function copyWithFallback(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
}

export function SharePlan({
  input,
  plan,
  ticks,
}: {
  input: EventInput;
  plan: Plan;
  ticks: TickMap;
}) {
  const [message, setMessage] = useState("");
  const text = planToText(input, plan, ticks);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setMessage("Copied");
        return;
      }
    } catch {
      // The clipboard API can reject without a fallback write.
    }
    setMessage(copyWithFallback(text) ? "Copied" : "Could not copy the plan.");
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Button type="button" variant="outline" onClick={() => void copy()}>
        Copy text
      </Button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none print:hidden"
      >
        Share on WhatsApp
      </a>
      <p aria-live="polite" className="text-sm">
        {message}
      </p>
    </div>
  );
}
