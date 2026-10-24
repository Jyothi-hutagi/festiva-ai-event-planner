import { z } from "zod";
import {
  EventInputSchema,
  PlanSchema,
  ShopItemSchema,
  VenueSchema,
  type EventInput,
  type Plan,
} from "@/lib/schema";
import type { TickMap } from "@/lib/ticks";

export const SAVED_PLANS_KEY = "festiva-saved-plans";

const RecommendationsSchema = z.object({
  shopping: z.array(ShopItemSchema).max(10),
  venues: z.array(VenueSchema).max(8),
});

const SavedPlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(160),
  savedAt: z.string().min(1),
  input: EventInputSchema,
  plan: PlanSchema,
  ticks: z.record(z.string(), z.boolean()),
  imagePrompt: z.string().trim().max(2000).optional(),
  recommendations: RecommendationsSchema.optional(),
});

export type SavedPlan = z.infer<typeof SavedPlanSchema>;

export type StoredRecommendations = z.infer<typeof RecommendationsSchema>;

type SavePlanInput = {
  id?: string;
  name: string;
  input: EventInput;
  plan: Plan;
  ticks: TickMap;
  imagePrompt?: string;
  recommendations?: StoredRecommendations;
};

function storage(): Storage | null {
  try {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage;
  } catch {
    return null;
  }
}

function readAll(): SavedPlan[] {
  const store = storage();
  if (!store) {
    return [];
  }
  try {
    const raw = store.getItem(SAVED_PLANS_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.flatMap((entry) => {
      const result = SavedPlanSchema.safeParse(entry);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

function writeAll(entries: SavedPlan[]): boolean {
  const store = storage();
  if (!store) {
    return false;
  }
  try {
    store.setItem(SAVED_PLANS_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export function listPlans(): SavedPlan[] {
  return readAll().sort((left, right) =>
    left.savedAt < right.savedAt ? 1 : -1,
  );
}

export function getPlan(id: string): SavedPlan | null {
  return readAll().find((entry) => entry.id === id) ?? null;
}

export function deletePlan(id: string): void {
  try {
    writeAll(readAll().filter((entry) => entry.id !== id));
  } catch {
    return;
  }
}

export function savePlan(draft: SavePlanInput): SavedPlan | null {
  try {
    const imagePrompt = draft.imagePrompt?.trim() ?? "";
    const candidate = {
      id: draft.id && draft.id.length > 0 ? draft.id : crypto.randomUUID(),
      name: draft.name,
      savedAt: new Date().toISOString(),
      input: draft.input,
      plan: draft.plan,
      ticks: draft.ticks,
      ...(imagePrompt.length > 0 ? { imagePrompt } : {}),
      ...(draft.recommendations
        ? { recommendations: draft.recommendations }
        : {}),
    };
    const parsed = SavedPlanSchema.safeParse(candidate);
    if (!parsed.success) {
      return null;
    }
    const entries = readAll();
    const exists = entries.some((entry) => entry.id === parsed.data.id);
    const next = exists
      ? entries.map((entry) =>
          entry.id === parsed.data.id ? parsed.data : entry,
        )
      : [parsed.data, ...entries];
    return writeAll(next) ? parsed.data : null;
  } catch {
    return null;
  }
}
