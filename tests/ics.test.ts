import { describe, expect, it } from "vitest";
import { buildIcs } from "@/lib/ics";
import type { EventInput, Plan } from "@/lib/schema";

const input: EventInput = {
  eventType: "wedding",
  date: "2026-12-04",
  guestCount: 40,
  budget: 80000,
  city: "Pune",
  preferences: "",
  eventName: "Garden wedding",
  decorStyle: "",
  language: "en",
};

const plan: Plan = {
  summary: "A garden wedding, with lights; and music.",
  budget: {
    total: 80000,
    categories: [
      { name: "Venue", amount: 40000, percent: 50 },
      { name: "Food", amount: 24000, percent: 30 },
      { name: "Decor", amount: 16000, percent: 20 },
    ],
  },
  timeline: [
    { phase: "12 weeks before", tasks: ["Book the venue, hall"] },
    { phase: "3 days before", tasks: ["Confirm the menu"] },
    { phase: "2 months before", tasks: ["Order flowers"] },
    { phase: "Day of", tasks: ["Welcome guests"] },
    {
      phase: "1 week before",
      tasks: ["A".repeat(120)],
    },
  ],
  vendors: [
    {
      type: "Caterer",
      checklist: ["Schedule a tasting"],
      questionsToAsk: ["Vegetarian?"],
    },
    {
      type: "Photographer",
      checklist: ["Book a date"],
      questionsToAsk: ["Hours?"],
    },
    {
      type: "Decorator",
      checklist: ["Choose a palette"],
      questionsToAsk: ["Flowers?"],
    },
  ],
  ideas: {
    themes: ["Garden"],
    menu: ["Thali"],
    activities: ["Games"],
    decor: ["Marigolds"],
  },
};

describe("buildIcs", () => {
  const ics = buildIcs(input, plan, new Date("2026-10-24T07:00:00.000Z"));

  it("turns weeks, days, and months before into all-day events", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20260911");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261201");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261004");
  });

  it("skips a phase it cannot parse and still includes the event day", () => {
    expect(ics).not.toContain("SUMMARY:Day of");
    expect(ics).toContain("SUMMARY:Garden wedding");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261204");
    expect(ics).toContain("DTEND;VALUE=DATE:20261205");
  });

  it("escapes commas, semicolons, and newlines, and folds long lines", () => {
    expect(ics).toContain("Book the venue\\, hall");
    expect(ics).toContain("lights\\; and music.");
    expect(ics).toContain("\r\n ");
    expect(ics.endsWith("\r\n")).toBe(true);
  });

  it("uses daysBefore for Hindi text, parses English when it is missing, and skips a phase with neither", () => {
    const mixed = buildIcs(
      input,
      {
        ...plan,
        timeline: [
          {
            phase: "कार्यक्रम से 12 सप्ताह पहले",
            tasks: ["हॉल बुक करें"],
            daysBefore: 84,
          },
          { phase: "3 days before", tasks: ["Confirm the menu"] },
          { phase: "आयोजन का दिन", tasks: ["मेहमानों का स्वागत"] },
        ],
      },
      new Date("2026-10-24T07:00:00.000Z"),
    );
    const unfolded = mixed.replace(/\r\n /g, "");
    expect(unfolded).toContain("SUMMARY:कार्यक्रम से 12 सप्ताह पहले");
    expect(unfolded).toContain("DTSTART;VALUE=DATE:20260911");
    expect(unfolded).toContain("SUMMARY:3 days before");
    expect(unfolded).toContain("DTSTART;VALUE=DATE:20261201");
    expect(unfolded).not.toContain("आयोजन का दिन");
    expect(unfolded).toContain("SUMMARY:Garden wedding");
  });

  it("returns a calendar with no events when the date is not a calendar day", () => {
    const empty = buildIcs(
      { ...input, date: "2026-02-31" },
      plan,
      new Date("2026-10-24T07:00:00.000Z"),
    );
    expect(empty).toContain("BEGIN:VCALENDAR");
    expect(empty).not.toContain("BEGIN:VEVENT");
  });
});
