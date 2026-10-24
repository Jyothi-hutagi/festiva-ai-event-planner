import { describe, expect, it } from "vitest";
import {
  EventInputSchema,
  ImageResultSchema,
  PlanSchema,
  ShopItemSchema,
  VenueSchema,
  type Plan,
} from "@/lib/schema";

const validInput = {
  eventType: "wedding" as const,
  date: "2026-12-01",
  guestCount: 120,
  budget: 500000,
  city: "Jaipur",
  preferences: "outdoor ceremony",
};

function planWithAmounts(
  total: number,
  amounts: [number, number, number],
): Plan {
  return {
    summary: "A Jaipur wedding with a marigold palette.",
    budget: {
      total,
      categories: [
        {
          name: "Venue",
          amount: amounts[0],
          percent: 40,
          notes: "Heritage courtyard",
        },
        { name: "Food", amount: amounts[1], percent: 30 },
        { name: "Decor", amount: amounts[2], percent: 30 },
      ],
    },
    timeline: [
      { phase: "12 weeks before", tasks: ["Book the venue"] },
      { phase: "4 weeks before", tasks: ["Confirm the menu"] },
      { phase: "Day of", tasks: ["Set up the mandap"] },
    ],
    vendors: [
      {
        type: "Venue",
        checklist: ["Visit the site"],
        questionsToAsk: ["What is the capacity?"],
      },
      {
        type: "Caterer",
        checklist: ["Schedule a tasting"],
        questionsToAsk: ["Is there a vegetarian menu?"],
      },
      {
        type: "Decorator",
        checklist: ["Review the moodboard"],
        questionsToAsk: ["Which flowers are local?"],
      },
    ],
    ideas: {
      themes: ["Marigold courtyard"],
      menu: ["Rajasthani thali"],
      activities: ["Sangeet"],
      decor: ["String lights"],
    },
  };
}

describe("EventInputSchema", () => {
  it("accepts a valid wedding", () => {
    expect(EventInputSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects a guest count of 0", () => {
    expect(
      EventInputSchema.safeParse({ ...validInput, guestCount: 0 }).success,
    ).toBe(false);
  });

  it("rejects a budget of 0", () => {
    expect(
      EventInputSchema.safeParse({ ...validInput, budget: 0 }).success,
    ).toBe(false);
  });

  it("rejects an empty city", () => {
    expect(
      EventInputSchema.safeParse({ ...validInput, city: "" }).success,
    ).toBe(false);
  });

  it("rejects a preference longer than 500 characters", () => {
    expect(
      EventInputSchema.safeParse({
        ...validInput,
        preferences: "a".repeat(501),
      }).success,
    ).toBe(false);
  });

  it("accepts workshop, corporate, and other without the optional names", () => {
    for (const eventType of ["workshop", "corporate", "other"] as const) {
      const parsed = EventInputSchema.safeParse({ ...validInput, eventType });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.eventName).toBe("");
        expect(parsed.data.decorStyle).toBe("");
        expect(parsed.data.language).toBe("en");
      }
    }
  });

  it("rejects an event name longer than 80 characters", () => {
    expect(
      EventInputSchema.safeParse({
        ...validInput,
        eventName: "a".repeat(81),
      }).success,
    ).toBe(false);
  });

  it("defaults language to English and accepts Hindi", () => {
    const parsed = EventInputSchema.safeParse(validInput);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.language).toBe("en");
    }
    expect(
      EventInputSchema.safeParse({ ...validInput, language: "hi" }).success,
    ).toBe(true);
    expect(
      EventInputSchema.safeParse({ ...validInput, language: "fr" }).success,
    ).toBe(false);
  });

  it("rejects a decor style longer than 60 characters", () => {
    expect(
      EventInputSchema.safeParse({
        ...validInput,
        decorStyle: "a".repeat(61),
      }).success,
    ).toBe(false);
  });
});

describe("recommendation schemas", () => {
  const venue = {
    name: "Studio Hall",
    whyItFits: "Fits 40 guests for a painting workshop.",
    priceRange: "₹20,000–₹40,000",
    address: "Koregaon Park, Pune",
    url: "https://example.com/studio",
  };

  it("accepts a venue and a shop item with http or https links", () => {
    expect(VenueSchema.safeParse(venue).success).toBe(true);
    expect(
      ShopItemSchema.safeParse({
        item: "Acrylic paint set",
        store: "Local art shop",
        approxPriceInr: 850,
        url: "http://example.com/paint",
      }).success,
    ).toBe(true);
  });

  it("rejects a link that is not http or https", () => {
    expect(
      VenueSchema.safeParse({ ...venue, url: "javascript:alert(1)" }).success,
    ).toBe(false);
    expect(
      ShopItemSchema.safeParse({
        item: "Paint",
        store: "Shop",
        approxPriceInr: 100,
        url: "ftp://example.com/paint",
      }).success,
    ).toBe(false);
  });

  it("rejects recommendation strings past their max length", () => {
    expect(
      VenueSchema.safeParse({ ...venue, name: "a".repeat(121) }).success,
    ).toBe(false);
    expect(
      ImageResultSchema.safeParse({
        mimeType: "image/png",
        dataBase64: "a".repeat(8_000_001),
        prompt: "A pastel workshop table.",
      }).success,
    ).toBe(false);
  });

  it("accepts an image result", () => {
    expect(
      ImageResultSchema.safeParse({
        mimeType: "image/png",
        dataBase64: "abc",
        prompt: "A pastel boho workshop table.",
      }).success,
    ).toBe(true);
  });
});

describe("PlanSchema", () => {
  it("rejects a budget that misses the total by more than 2%", () => {
    expect(
      PlanSchema.safeParse(planWithAmounts(10000, [5000, 3000, 1700])).success,
    ).toBe(false);
  });

  it("accepts a budget within 2% of the total", () => {
    expect(
      PlanSchema.safeParse(planWithAmounts(10000, [4000, 3000, 2900])).success,
    ).toBe(true);
  });

  it("rejects a plan with no vendors", () => {
    const { vendors: _vendors, ...withoutVendors } = planWithAmounts(
      10000,
      [4000, 3000, 3000],
    );
    expect(_vendors).toHaveLength(3);
    expect(PlanSchema.safeParse(withoutVendors).success).toBe(false);
  });

  it("accepts a 150-character menu item", () => {
    const plan = planWithAmounts(10000, [4000, 3000, 3000]);
    plan.ideas.menu = ["a".repeat(150)];
    expect(PlanSchema.safeParse(plan).success).toBe(true);
  });

  it("accepts daysBefore from 0 to 730 and rejects a value outside that range", () => {
    const plan = planWithAmounts(10000, [4000, 3000, 3000]);
    plan.timeline[0] = { ...plan.timeline[0], daysBefore: 84 };
    expect(PlanSchema.safeParse(plan).success).toBe(true);
    plan.timeline[0] = { ...plan.timeline[0], daysBefore: 731 };
    expect(PlanSchema.safeParse(plan).success).toBe(false);
  });

  it("rejects an empty ideas list", () => {
    const plan = planWithAmounts(10000, [4000, 3000, 3000]);
    plan.ideas.themes = [];
    expect(PlanSchema.safeParse(plan).success).toBe(false);
  });
});
