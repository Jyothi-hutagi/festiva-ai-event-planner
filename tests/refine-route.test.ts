import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/gemini", () => ({
  refinePlan: vi.fn(),
}));

import { POST } from "@/app/api/refine/route";
import { refinePlan } from "@/lib/gemini";
import type { Plan } from "@/lib/schema";

const refinePlanMock = vi.mocked(refinePlan);

const validPlan: Plan = {
  summary: "A Jaipur wedding with a marigold palette.",
  budget: {
    total: 10000,
    categories: [
      { name: "Venue", amount: 4000, percent: 40, notes: "Heritage courtyard" },
      { name: "Food", amount: 3000, percent: 30 },
      { name: "Decor", amount: 3000, percent: 30 },
    ],
  },
  timeline: [
    { phase: "12 weeks before", tasks: ["Book the venue"] },
    { phase: "4 weeks before", tasks: ["Confirm the menu"] },
    { phase: "Day of", tasks: ["Set up the mandap"] },
  ],
  vendors: [
    {
      type: "Venue",
      checklist: ["Visit the site"],
      questionsToAsk: ["What is the capacity?"],
    },
    {
      type: "Caterer",
      checklist: ["Schedule a tasting"],
      questionsToAsk: ["Is there a vegetarian menu?"],
    },
    {
      type: "Decorator",
      checklist: ["Review the moodboard"],
      questionsToAsk: ["Which flowers are local?"],
    },
  ],
  ideas: {
    themes: ["Marigold courtyard"],
    menu: ["Rajasthani thali"],
    activities: ["Sangeet"],
    decor: ["String lights"],
  },
};

const updatedPlan = { ...validPlan, summary: "A cheaper Jaipur wedding." };

function post(body: unknown, ip: string) {
  return new Request("http://localhost/api/refine", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/refine validation", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
    refinePlanMock.mockReset();
    refinePlanMock.mockResolvedValue(updatedPlan);
  });

  it("trims a valid instruction and refines that plan", async () => {
    const res = await POST(
      post(
        { plan: validPlan, instruction: "  make it cheaper  " },
        "198.51.100.20",
      ),
    );

    expect(res.status).toBe(200);
    expect(refinePlanMock).toHaveBeenCalledWith(
      validPlan,
      "make it cheaper",
      "en",
    );
    await expect(res.json()).resolves.toEqual(updatedPlan);
  });

  it("accepts an instruction of 300 characters", async () => {
    const instruction = "a".repeat(300);
    const res = await POST(
      post({ plan: validPlan, instruction }, "198.51.100.21"),
    );

    expect(res.status).toBe(200);
    expect(refinePlanMock).toHaveBeenCalledWith(validPlan, instruction, "en");
  });

  it("passes Hindi through to the refine prompt", async () => {
    const res = await POST(
      post(
        { plan: validPlan, instruction: "make it cheaper", language: "hi" },
        "198.51.100.24",
      ),
    );

    expect(res.status).toBe(200);
    expect(refinePlanMock).toHaveBeenCalledWith(
      validPlan,
      "make it cheaper",
      "hi",
    );
  });

  it.each([
    ["empty", ""],
    ["whitespace", "   "],
    ["too long", "a".repeat(301)],
  ])("returns 400 for a %s instruction", async (_label, instruction) => {
    const res = await POST(
      post({ plan: validPlan, instruction }, "198.51.100.22"),
    );

    expect(res.status).toBe(400);
    const body: { error: string; details: unknown } = await res.json();
    expect(body.error).toBe("Invalid input");
    expect(body.details).toBeTruthy();
    expect(refinePlanMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the plan does not match PlanSchema", async () => {
    const res = await POST(
      post(
        { plan: { summary: "incomplete" }, instruction: "make it cheaper" },
        "198.51.100.23",
      ),
    );

    expect(res.status).toBe(400);
    const body: { error: string; details: unknown } = await res.json();
    expect(body.error).toBe("Invalid input");
    expect(body.details).toBeTruthy();
    expect(refinePlanMock).not.toHaveBeenCalled();
  });
});
