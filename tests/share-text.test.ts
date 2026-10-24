import { describe, expect, it } from "vitest";
import { checklistProgress } from "@/components/progress-bar";
import { planToText } from "@/lib/share-text";
import type { EventInput, Plan } from "@/lib/schema";
import { tickKey } from "@/lib/ticks";

const input: EventInput = {
  eventType: "workshop",
  date: "2026-12-04",
  guestCount: 12,
  budget: 15000,
  city: "Pune",
  preferences: "",
  eventName: "Trinket tray painting workshop",
  decorStyle: "pastel boho",
  language: "en",
};

const plan: Plan = {
  summary: "A painting workshop.",
  budget: {
    total: 15000,
    categories: [
      { name: "Venue", amount: 6000, percent: 40 },
      { name: "Materials", amount: 4500, percent: 30 },
      { name: "Snacks", amount: 4500, percent: 30 },
    ],
  },
  timeline: [
    { phase: "1 week before", tasks: ["Buy brushes"] },
    { phase: "Day of", tasks: ["Set up tables"] },
    { phase: "Event day", tasks: ["Welcome guests"] },
  ],
  vendors: [
    {
      type: "Host",
      checklist: ["One", "Two", "Three", "Four", "Five", "Six"],
      questionsToAsk: ["Start time?"],
    },
    {
      type: "Caterer",
      checklist: ["Snacks"],
      questionsToAsk: ["Allergies?"],
    },
    {
      type: "Decorator",
      checklist: ["Cloth"],
      questionsToAsk: ["Colour?"],
    },
  ],
  ideas: {
    themes: ["Pastel"],
    menu: ["Tea"],
    activities: ["Painting"],
    decor: ["Flowers"],
  },
};

describe("planToText", () => {
  it("includes the title, budget lines, and only the first five to-dos", () => {
    const text = planToText(input, plan, {
      [tickKey("Host", "One")]: true,
    });
    expect(text).toContain("Trinket tray painting workshop");
    expect(text).toContain("2026-12-04");
    expect(text).toContain("Budget: ₹15,000");
    expect(text).toContain("Venue: ₹6,000");
    expect(text).toContain("[x] Host: One");
    expect(text).toContain("[ ] Host: Five");
    expect(text).not.toContain("Host: Six");
  });
});

describe("checklistProgress", () => {
  it("counts ticked checklist items", () => {
    expect(
      checklistProgress(plan, {
        [tickKey("Host", "One")]: true,
        [tickKey("Host", "Two")]: true,
      }),
    ).toEqual({ done: 2, total: 8 });
  });
});
