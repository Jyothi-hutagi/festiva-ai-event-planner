import { afterEach, describe, expect, it } from "vitest";
import {
  MISSING_GEMINI_KEY_MESSAGE,
  geminiUnavailableResponse,
} from "@/lib/gemini-key";
import { readApiError } from "@/lib/read-api-error";

const original = process.env.GEMINI_API_KEY;

afterEach(() => {
  if (original === undefined) {
    delete process.env.GEMINI_API_KEY;
  } else {
    process.env.GEMINI_API_KEY = original;
  }
});

describe("missing Gemini key", () => {
  it("answers 503 with the README sentence", async () => {
    delete process.env.GEMINI_API_KEY;
    const response = geminiUnavailableResponse();
    expect(response?.status).toBe(503);
    const body: unknown = await response?.json();
    expect(body).toEqual({ error: MISSING_GEMINI_KEY_MESSAGE });
    expect(readApiError(body)).toBe(
      "Server is missing GEMINI_API_KEY. See README.",
    );
  });

  it("lets the route continue when a key is set", () => {
    process.env.GEMINI_API_KEY = "test-key";
    expect(geminiUnavailableResponse()).toBeNull();
  });
});
