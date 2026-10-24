import { afterEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows 10 calls and blocks the 11th", () => {
    const key = "burst";
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(key)).toBe(true);
    }
    expect(rateLimit(key)).toBe(false);
  });

  it("allows a call again once the previous hit is outside the window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-23T12:00:00.000Z"));

    const key = "window";
    expect(rateLimit(key, 1, 60_000)).toBe(true);
    expect(rateLimit(key, 1, 60_000)).toBe(false);

    vi.setSystemTime(new Date("2026-10-23T12:01:00.000Z"));
    expect(rateLimit(key, 1, 60_000)).toBe(true);
  });
});
