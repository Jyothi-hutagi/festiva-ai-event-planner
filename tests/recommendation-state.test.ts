import { describe, expect, it } from "vitest";
import {
  failList,
  retryList,
  settleShopping,
  settleVenues,
  type RecommendationLists,
} from "@/lib/recommendation-state";

const ready: RecommendationLists = {
  shopping: settleShopping([
    {
      item: "Garland",
      store: "City store",
      approxPriceInr: 500,
      url: "https://example.com/store",
    },
  ]),
  venues: settleVenues([
    {
      name: "Garden Hall",
      whyItFits: "A lawn for the evening.",
      priceRange: "₹40,000–₹80,000",
      address: "Pune",
      url: "https://example.com/venue",
    },
  ]),
};

const failure = "Could not generate a plan. Please try again.";

describe("recommendation lists", () => {
  it("keeps the shopping list when the venue request fails", () => {
    const next = failList(ready, "venues", failure);
    expect(next.venues).toEqual({
      status: "error",
      venues: [],
      message: failure,
    });
    expect(next.shopping).toEqual(ready.shopping);
  });

  it("retries only the failed request", () => {
    const failed = failList(ready, "venues", failure);
    const retried = retryList(failed, "venues");
    expect(retried.venues.status).toBe("loading");
    expect(retried.shopping).toEqual(ready.shopping);
    expect(retryList(failed, "shopping").venues).toEqual(failed.venues);
  });
});
