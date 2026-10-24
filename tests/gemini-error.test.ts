import { describe, expect, it } from "vitest";
import {
  QUOTA_DAILY_MESSAGE,
  QUOTA_IMAGE_MESSAGE,
  geminiQuotaMessage,
} from "@/lib/gemini-error";

describe("geminiQuotaMessage", () => {
  it("explains a free image model with a zero limit", () => {
    const err = Object.assign(new Error("limit: 0, model: gemini-2.5-flash-preview-image"), {
      status: 429,
    });
    expect(geminiQuotaMessage(err)).toBe(QUOTA_IMAGE_MESSAGE);
  });

  it("explains a used daily text quota", () => {
    const err = Object.assign(
      new Error("quota exceeded, limit: 20, model: gemini-2.5-flash"),
      { status: 429 },
    );
    expect(geminiQuotaMessage(err)).toBe(QUOTA_DAILY_MESSAGE);
  });

  it("leaves other failures alone", () => {
    expect(geminiQuotaMessage(new Error("decor image missing"))).toBeNull();
  });
});
