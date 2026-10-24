import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/gemini", () => ({
  generateDecorImages: vi.fn(),
  MAX_DECOR_IMAGE_CHARS: 4_000_000,
}));

import { POST, maxDuration } from "@/app/api/decor-image/route";
import { generateDecorImages } from "@/lib/gemini";

const generateDecorImagesMock = vi.mocked(generateDecorImages);

const body = {
  input: {
    eventType: "wedding",
    date: "2026-12-04",
    guestCount: 40,
    budget: 80000,
    city: "Pune",
    preferences: "",
    eventName: "Meera",
    decorStyle: "marigold",
    language: "en",
  },
  plan: {
    summary: "A Pune wedding.",
    budget: {
      total: 80000,
      categories: [
        { name: "Venue", amount: 40000, percent: 50 },
        { name: "Food", amount: 24000, percent: 30 },
        { name: "Decor", amount: 16000, percent: 20 },
      ],
    },
    timeline: [
      { phase: "Planning", tasks: ["Book the venue"], daysBefore: 30 },
      { phase: "Week before", tasks: ["Confirm the menu"], daysBefore: 7 },
      { phase: "Event day", tasks: ["Welcome guests"], daysBefore: 0 },
    ],
    vendors: [
      {
        type: "Caterer",
        checklist: ["Schedule a tasting"],
        questionsToAsk: ["Do you cook vegetarian food?"],
      },
      {
        type: "Photographer",
        checklist: ["Book a date"],
        questionsToAsk: ["How many hours are included?"],
      },
      {
        type: "Decorator",
        checklist: ["Choose a palette"],
        questionsToAsk: ["Which flowers are in season?"],
      },
    ],
    ideas: {
      themes: ["Garden evening"],
      menu: ["Thali"],
      activities: ["Lawn games"],
      decor: ["Marigold garland"],
    },
  },
};

const image = {
  prompt: "A square marigold wedding.",
  images: [{ mimeType: "image/png", data: "aaaa" }],
};

function post(payload: unknown, ip: string) {
  return new Request("http://localhost/api/decor-image", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(payload),
  });
}

describe("POST /api/decor-image", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
    generateDecorImagesMock.mockReset();
    generateDecorImagesMock.mockResolvedValue(image);
  });

  it("allows 60 seconds", () => {
    expect(maxDuration).toBe(60);
  });

  it("returns 503 when GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await POST(post(body, "198.51.100.30"));
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({
      error: "Server is missing GEMINI_API_KEY. See README.",
    });
    expect(generateDecorImagesMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid body", async () => {
    const res = await POST(
      post({ input: { eventType: "wedding" } }, "198.51.100.31"),
    );
    expect(res.status).toBe(400);
    const payload: { error: string } = await res.json();
    expect(payload.error).toBe("Invalid input");
    expect(generateDecorImagesMock).not.toHaveBeenCalled();
  });

  it("returns 429 after 3 requests from the same IP", async () => {
    const ip = "198.51.100.32";
    for (let i = 0; i < 3; i++) {
      const res = await POST(post(body, ip));
      expect(res.status).toBe(200);
    }
    const blocked = await POST(post(body, ip));
    expect(blocked.status).toBe(429);
    await expect(blocked.json()).resolves.toEqual({
      error: "Too many requests. Please wait a minute.",
    });
  });

  it("returns the prompt and image", async () => {
    const res = await POST(post(body, "198.51.100.33"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(image);
    expect(generateDecorImagesMock).toHaveBeenCalledWith(body.input, body.plan);
  });

  it("says when the free image quota is unavailable", async () => {
    generateDecorImagesMock.mockRejectedValue(
      Object.assign(new Error("limit: 0, model: gemini-2.5-flash-preview-image"), {
        status: 429,
      }),
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(post(body, "198.51.100.35"));
    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toEqual({
      error: "This Gemini key cannot generate images on the free tier.",
    });
    errorSpy.mockRestore();
  });

  it("returns 502 when the image is too large to send", async () => {
    generateDecorImagesMock.mockResolvedValue({
      prompt: "A square marigold wedding.",
      images: [{ mimeType: "image/png", data: "a".repeat(4_000_001) }],
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(post(body, "198.51.100.34"));
    expect(res.status).toBe(502);
    errorSpy.mockRestore();
  });
});
