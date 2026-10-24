import { describe, expect, it } from "vitest";
import {
  categoryShares,
  formatINR,
  perGuest,
  venueBudgetShare,
} from "@/lib/budget";

describe("formatINR", () => {
  it("groups rupees in the Indian system", () => {
    expect(formatINR(150000)).toBe("₹1,50,000");
    expect(formatINR(500000)).toBe("₹5,00,000");
  });
});

describe("perGuest", () => {
  it("returns 0 when the guest count is 0 or less", () => {
    expect(perGuest(40000, 0)).toBe(0);
    expect(perGuest(40000, -2)).toBe(0);
  });

  it("keeps a non-round division", () => {
    expect(perGuest(10000, 3)).toBeCloseTo(3333.333333, 5);
  });
});

describe("categoryShares", () => {
  it("returns each category's share of the total", () => {
    const shares = categoryShares(
      [
        { name: "Venue", amount: 200000 },
        { name: "Food", amount: 150000 },
        { name: "Decor", amount: 150000 },
      ],
      500000,
    );

    expect(shares.map((category) => category.share)).toEqual([40, 30, 30]);
    expect(shares.reduce((sum, category) => sum + category.amount, 0)).toBe(
      500000,
    );
  });

  it("returns a zero share when the total is zero", () => {
    expect(categoryShares([{ name: "Venue", amount: 0 }], 0)).toEqual([
      { name: "Venue", amount: 0, share: 0 },
    ]);
  });
});

describe("venueBudgetShare", () => {
  it("uses the venue category when one exists", () => {
    expect(
      venueBudgetShare(
        [
          { name: "Venue", amount: 40000 },
          { name: "Food", amount: 24000 },
        ],
        80000,
      ),
    ).toEqual({ name: "Venue", amount: 40000, share: 50 });
  });

  it("returns null when no category is a venue", () => {
    expect(
      venueBudgetShare(
        [
          { name: "Food", amount: 24000 },
          { name: "Decor", amount: 16000 },
        ],
        40000,
      ),
    ).toBeNull();
  });
});
