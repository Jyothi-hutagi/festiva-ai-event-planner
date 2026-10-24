import { describe, expect, it } from "vitest";
import { reapplyTicks, tickKey } from "@/lib/ticks";

describe("reapplyTicks", () => {
  it("keeps a tick only when the vendor type and checklist text still match", () => {
    const kept = tickKey("Caterer", "Schedule a tasting");
    const rewritten = tickKey("Caterer", "Book a tasting");
    const ticks = { [kept]: true, [rewritten]: true };

    expect(
      reapplyTicks(ticks, [
        {
          type: "Caterer",
          checklist: ["Schedule a tasting", "Confirm a vegetarian menu"],
          questionsToAsk: ["What is the price?"],
        },
      ]),
    ).toEqual({ [kept]: true });
  });
});
