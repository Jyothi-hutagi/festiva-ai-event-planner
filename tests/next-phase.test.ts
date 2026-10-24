import { describe, expect, it } from "vitest";
import { nextPhaseIndex } from "@/lib/next-phase";

const now = new Date(2026, 9, 24);

describe("nextPhaseIndex", () => {
  it("picks the soonest phase that starts today or later", () => {
    const index = nextPhaseIndex(
      [
        { daysBefore: 60 },
        { daysBefore: null },
        { daysBefore: 7 },
        { daysBefore: 0 },
      ],
      "2026-12-04",
      now,
    );
    expect(index).toBe(2);
  });

  it("never highlights a phase that omits daysBefore", () => {
    expect(
      nextPhaseIndex([{ daysBefore: undefined }, {}], "2026-12-04", now),
    ).toBeNull();
  });

  it("marks nothing when the event date is in the past", () => {
    expect(
      nextPhaseIndex([{ daysBefore: 0 }, { daysBefore: 1 }], "2026-10-01", now),
    ).toBeNull();
  });

  it("includes a phase that starts today", () => {
    expect(nextPhaseIndex([{ daysBefore: 0 }], "2026-10-24", now)).toBe(0);
  });
});
