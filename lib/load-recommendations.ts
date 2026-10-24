import { z } from "zod";
import { readApiError } from "@/lib/read-api-error";
import {
  ShopItemSchema,
  VenueSchema,
  type EventInput,
  type Plan,
} from "@/lib/schema";

type ShopItem = z.infer<typeof ShopItemSchema>;
type Venue = z.infer<typeof VenueSchema>;

type ListStatus = "loading" | "error" | "empty" | "ready";

export type ShopState = {
  status: ListStatus;
  items: ShopItem[];
  message: string;
};

export type VenueState = {
  status: ListStatus;
  venues: Venue[];
  message: string;
};

const ItemsSchema = z.object({ items: z.array(ShopItemSchema).max(10) });
const VenuesSchema = z.object({ venues: z.array(VenueSchema).max(8) });

async function postJson(path: string, body: unknown, signal: AbortSignal) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(readApiError(payload));
  }
  return payload;
}

export async function loadShops(
  input: EventInput,
  plan: Plan,
  signal: AbortSignal,
) {
  const payload = await postJson("/api/shopping", { input, plan }, signal);
  const parsed = ItemsSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Could not generate a plan. Please try again.");
  }
  return parsed.data.items;
}

export async function loadVenues(
  input: EventInput,
  plan: Plan,
  signal: AbortSignal,
) {
  const payload = await postJson("/api/venues", { input, plan }, signal);
  const parsed = VenuesSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Could not generate a plan. Please try again.");
  }
  return parsed.data.venues;
}
