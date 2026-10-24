import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LOADING_INTERVAL_MS,
  planLoadingMessages,
  startLoadingCycle,
} from "@/lib/loading-cycle";

describe("startLoadingCycle", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("rotates the plan messages every 4 seconds and then wraps", () => {
    vi.useFakeTimers();
    const heard: string[] = [];
    const stop = startLoadingCycle(planLoadingMessages, (message) => {
      heard.push(message);
    });

    expect(heard).toEqual(["Planning your budget..."]);
    vi.advanceTimersByTime(LOADING_INTERVAL_MS);
    expect(heard.at(-1)).toBe("Building your timeline...");
    vi.advanceTimersByTime(LOADING_INTERVAL_MS);
    expect(heard.at(-1)).toBe("Choosing vendors...");
    vi.advanceTimersByTime(LOADING_INTERVAL_MS);
    expect(heard.at(-1)).toBe("Planning your budget...");
    stop();
    vi.advanceTimersByTime(LOADING_INTERVAL_MS);
    expect(heard).toHaveLength(4);
  });
});
