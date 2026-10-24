import { afterEach, describe, expect, it, vi } from "vitest";
import { PlanSchema, type EventInput, type Plan } from "@/lib/schema";
import {
  SAVED_PLANS_KEY,
  deletePlan,
  getPlan,
  listPlans,
  savePlan,
} from "@/lib/saved-plans";

const input: EventInput = {
  eventType: "wedding",
  date: "2026-12-01",
  guestCount: 40,
  budget: 80000,
  city: "Pune",
  preferences: "garden party",
  eventName: "",
  decorStyle: "",
  language: "en",
};

const plan: Plan = PlanSchema.parse({
  summary: "A Pune wedding.",
  budget: {
    total: 80000,
    categories: [
      { name: "Venue", amount: 40000, percent: 50, notes: "Hall" },
      { name: "Food", amount: 24000, percent: 30, notes: "Meals" },
      { name: "Decor", amount: 16000, percent: 20, notes: "Flowers" },
    ],
  },
  timeline: [
    { phase: "Planning", tasks: ["Book the venue"] },
    { phase: "Week before", tasks: ["Confirm the menu"] },
    { phase: "Event day", tasks: ["Welcome guests"] },
  ],
  vendors: [
    {
      type: "Caterer",
      checklist: ["Schedule a tasting"],
      questionsToAsk: ["Vegetarian options?"],
    },
    {
      type: "Photographer",
      checklist: ["Book a date"],
      questionsToAsk: ["How many hours?"],
    },
    {
      type: "Decorator",
      checklist: ["Choose a palette"],
      questionsToAsk: ["Seasonal flowers?"],
    },
  ],
  ideas: {
    themes: ["Garden"],
    menu: ["Thali"],
    activities: ["Games"],
    decor: ["Marigolds"],
  },
});

function installStorage() {
  const data = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
  vi.stubGlobal("window", { localStorage });
  return localStorage;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("saved plans", () => {
  it("round-trips a plan and updates the same id", () => {
    installStorage();
    const saved = savePlan({
      name: "Wedding in Pune",
      input,
      plan,
      ticks: { tasting: true },
    });
    expect(saved).not.toBeNull();
    expect(listPlans()).toHaveLength(1);
    expect(getPlan(saved!.id)?.plan.summary).toBe("A Pune wedding.");
    expect(getPlan(saved!.id)?.ticks).toEqual({ tasting: true });
    expect(getPlan(saved!.id)?.imagePrompt).toBeUndefined();
    expect(getPlan(saved!.id)?.recommendations).toBeUndefined();

    const updated = savePlan({
      id: saved!.id,
      name: "Wedding in Pune",
      input,
      plan: { ...plan, summary: "A smaller Pune wedding." },
      ticks: { tasting: true, rain: false },
    });
    expect(updated?.id).toBe(saved!.id);
    expect(listPlans()).toHaveLength(1);
    expect(listPlans()[0]?.plan.summary).toBe("A smaller Pune wedding.");
    expect(listPlans()[0]?.ticks).toEqual({ tasting: true, rain: false });
  });

  it("deletes one saved plan", () => {
    installStorage();
    const first = savePlan({ name: "Wedding in Pune", input, plan, ticks: {} });
    const second = savePlan({
      name: "Birthday in Pune",
      input: { ...input, eventType: "birthday" },
      plan,
      ticks: {},
    });
    deletePlan(first!.id);
    expect(listPlans().map((entry) => entry.id)).toEqual([second!.id]);
    expect(getPlan(first!.id)).toBeNull();
  });

  it("returns an empty list for corrupt JSON and drops corrupt entries", () => {
    const localStorage = installStorage();
    localStorage.setItem(SAVED_PLANS_KEY, "{");
    expect(listPlans()).toEqual([]);

    const saved = savePlan({ name: "Wedding in Pune", input, plan, ticks: {} });
    const raw = JSON.parse(
      localStorage.getItem(SAVED_PLANS_KEY) ?? "[]",
    ) as unknown[];
    localStorage.setItem(
      SAVED_PLANS_KEY,
      JSON.stringify([{ id: "bad" }, ...raw]),
    );
    expect(listPlans().map((entry) => entry.id)).toEqual([saved!.id]);

    localStorage.setItem(SAVED_PLANS_KEY, "null");
    expect(listPlans()).toEqual([]);
  });

  it("returns an empty list when storage is unavailable", () => {
    expect(listPlans()).toEqual([]);
    expect(
      savePlan({ name: "Wedding in Pune", input, plan, ticks: {} }),
    ).toBeNull();

    vi.stubGlobal("window", {
      get localStorage() {
        throw new Error("blocked");
      },
    });
    expect(listPlans()).toEqual([]);
    expect(
      savePlan({ name: "Wedding in Pune", input, plan, ticks: {} }),
    ).toBeNull();
  });

  it("stores recommendations and the image prompt, never image bytes", () => {
    const localStorage = installStorage();
    const recommendations = {
      shopping: [
        {
          item: "Marigold garland",
          store: "Pune Flower Market",
          approxPriceInr: 450,
          url: "https://flowers.example/garland",
        },
      ],
      venues: [
        {
          name: "Garden Hall",
          whyItFits: "Seats 40.",
          priceRange: "₹40,000–₹80,000",
          address: "Koregaon Park, Pune",
          url: "https://hall.example/book",
        },
      ],
    };
    const saved = savePlan({
      name: "Wedding in Pune",
      input,
      plan,
      ticks: {},
      imagePrompt: "A pastel marigold canopy.",
      recommendations,
    });
    expect(saved?.imagePrompt).toBe("A pastel marigold canopy.");
    expect(getPlan(saved!.id)?.recommendations).toEqual(recommendations);
    expect(localStorage.getItem(SAVED_PLANS_KEY)).not.toContain("dataBase64");

    const raw = JSON.parse(
      localStorage.getItem(SAVED_PLANS_KEY) ?? "[]",
    ) as unknown[];
    const first = raw[0] as Record<string, unknown>;
    localStorage.setItem(
      SAVED_PLANS_KEY,
      JSON.stringify([{ ...first, image: { dataBase64: "aaaa" } }]),
    );
    const loaded = listPlans()[0];
    expect(loaded?.imagePrompt).toBe("A pastel marigold canopy.");
    expect(loaded).not.toHaveProperty("image");
    expect(JSON.stringify(loaded)).not.toContain("dataBase64");
  });

  it("rejects an unsafe recommendation link and an oversized prompt", () => {
    installStorage();
    expect(
      savePlan({
        name: "Wedding in Pune",
        input,
        plan,
        ticks: {},
        recommendations: {
          shopping: [
            {
              item: "Paint",
              store: "Shop",
              approxPriceInr: 10,
              url: "javascript:alert(1)",
            },
          ],
          venues: [],
        },
      }),
    ).toBeNull();
    expect(listPlans()).toEqual([]);
    expect(
      savePlan({
        name: "Wedding in Pune",
        input,
        plan,
        ticks: {},
        imagePrompt: "x".repeat(2001),
      }),
    ).toBeNull();
    expect(listPlans()).toEqual([]);
  });
});
