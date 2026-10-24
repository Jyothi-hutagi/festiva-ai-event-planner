import type { ShopState, VenueState } from "@/lib/load-recommendations";

export type RecommendationLists = {
  shopping: ShopState;
  venues: VenueState;
};

function loadingShopping(): ShopState {
  return { status: "loading", items: [], message: "" };
}

export function settleShopping(items: ShopState["items"]): ShopState {
  return items.length === 0
    ? { status: "empty", items: [], message: "" }
    : { status: "ready", items, message: "" };
}

function failShopping(message: string): ShopState {
  return { status: "error", items: [], message };
}

function loadingVenues(): VenueState {
  return { status: "loading", venues: [], message: "" };
}

export function settleVenues(venues: VenueState["venues"]): VenueState {
  return venues.length === 0
    ? { status: "empty", venues: [], message: "" }
    : { status: "ready", venues, message: "" };
}

function failVenues(message: string): VenueState {
  return { status: "error", venues: [], message };
}

/** Start one list again and leave the other list untouched. */
export function retryList(
  lists: RecommendationLists,
  target: "shopping" | "venues",
): RecommendationLists {
  if (target === "shopping") {
    return { shopping: loadingShopping(), venues: lists.venues };
  }
  return { shopping: lists.shopping, venues: loadingVenues() };
}

/** Record a failure on one list and leave the other list untouched. */
export function failList(
  lists: RecommendationLists,
  target: "shopping" | "venues",
  message: string,
): RecommendationLists {
  if (target === "shopping") {
    return { shopping: failShopping(message), venues: lists.venues };
  }
  return { shopping: lists.shopping, venues: failVenues(message) };
}
