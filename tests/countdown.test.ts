import { describe, expect, it } from "vitest";
import { daysUntil } from "@/lib/countdown";

describe("daysUntil", () => {
  it("counts whole local days until a future date", () => {
    expect(daysUntil("2026-12-04", new Date(2026, 9, 23, 22, 30))).toBe(42);
  });

  it("returns 0 when the event is today", () => {
    expect(daysUntil("2026-10-23", new Date(2026, 9, 23, 0, 30))).toBe(0);
  });

  it("clamps a past date to 0", () => {
    expect(daysUntil("2026-10-01", new Date(2026, 9, 23, 8, 0))).toBe(0);
  });

  it("counts one day across a month boundary", () => {
    expect(daysUntil("2026-02-01", new Date(2026, 0, 31, 23, 30))).toBe(1);
  });
});
