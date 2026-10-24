import { describe, expect, it } from "vitest";
import { shopQuantity, shoppingListText } from "@/lib/shopping-list";

describe("shop quantities", () => {
  it("derives a quantity from the guest count and caps it at 40", () => {
    expect(shopQuantity(8)).toBe(8);
    expect(shopQuantity(80)).toBe(40);
    expect(shopQuantity(0)).toBe(1);
  });

  it("keeps a model quantity inside 1 to 40", () => {
    expect(shopQuantity(80, 3)).toBe(3);
    expect(shopQuantity(8, 41)).toBe(8);
  });

  it("copies item, quantity, and store", () => {
    expect(
      shoppingListText([
        { item: "Marigold garland", quantity: 8, store: "Pune Flower Market" },
        { item: "Tea lights", quantity: 40, store: "City store" },
      ]),
    ).toBe(
      "Marigold garland, 8, Pune Flower Market\nTea lights, 40, City store",
    );
  });
});
