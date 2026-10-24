import { z } from "zod";

const httpLink = z.httpUrl().max(2000);

export const EventInputSchema = z.object({
  eventType: z.enum([
    "wedding",
    "birthday",
    "community",
    "workshop",
    "corporate",
    "other",
  ]),
  date: z.string().trim().min(1).max(40),
  guestCount: z.number().int().min(1).max(5000),
  budget: z.number().positive().max(100_000_000),
  city: z.string().trim().min(1).max(80),
  preferences: z.string().trim().max(500).default(""),
  eventName: z.string().trim().max(80).default(""),
  decorStyle: z.string().trim().max(60).default(""),
  language: z.enum(["en", "hi"]).default("en"),
});

export const VenueSchema = z.object({
  name: z.string().trim().min(1).max(120),
  whyItFits: z.string().trim().min(1).max(300),
  priceRange: z.string().trim().min(1).max(80),
  address: z.string().trim().min(1).max(200),
  url: httpLink,
});

export const ShopItemSchema = z.object({
  item: z.string().trim().min(1).max(120),
  store: z.string().trim().min(1).max(120),
  approxPriceInr: z.number().positive().max(100_000_000),
  url: httpLink,
});

export const ImageResultSchema = z.object({
  mimeType: z.string().trim().min(1).max(80),
  dataBase64: z.string().min(1).max(8_000_000),
  prompt: z.string().trim().min(1).max(2000),
});

export const PlanSchema = z
  .object({
    summary: z.string().max(600),
    budget: z.object({
      total: z.number().positive(),
      categories: z
        .array(
          z.object({
            name: z.string().max(60),
            amount: z.number().nonnegative(),
            percent: z.number().min(0).max(100),
            notes: z.string().max(300).optional(),
          }),
        )
        .min(3),
    }),
    timeline: z
      .array(
        z.object({
          phase: z.string().max(80), // e.g. "12 weeks before"
          tasks: z.array(z.string().max(250)).min(1),
          daysBefore: z.number().int().min(0).max(730).optional(),
        }),
      )
      .min(3),
    vendors: z
      .array(
        z.object({
          type: z.string().max(60),
          checklist: z.array(z.string().max(250)).min(1),
          questionsToAsk: z.array(z.string().max(250)).min(1),
        }),
      )
      .min(3),
    ideas: z.object({
      themes: z.array(z.string().max(200)).min(1),
      menu: z.array(z.string().max(200)).min(1),
      activities: z.array(z.string().max(200)).min(1),
      decor: z.array(z.string().max(200)).min(1),
    }),
  })
  .refine(
    (p) => {
      const sum = p.budget.categories.reduce((s, c) => s + c.amount, 0);
      return Math.abs(sum - p.budget.total) <= p.budget.total * 0.02;
    },
    { message: "Budget categories must add up to the total (within 2%)" },
  );

export type EventInput = z.infer<typeof EventInputSchema>;
export type Plan = z.infer<typeof PlanSchema>;
