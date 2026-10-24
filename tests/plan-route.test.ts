import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/gemini", () => ({
  generatePlan: vi.fn(),
}));

import { POST } from "@/app/api/plan/route";
import { generatePlan } from "@/lib/gemini";
import type { Plan } from "@/lib/schema";

const generatePlanMock = vi.mocked(generatePlan);

const validInput = {
  eventType: "wedding",
  date: "2026-12-01",
  guestCount: 80,
  budget: 250000,
  city: "Jaipur",
  preferences: "",
};

const stubPlan = {
  summary: "A short wedding plan.",
} as Plan;

function post(body: unknown, ip: string) {
  return new Request("http://localhost/api/plan", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/plan", () => {
  beforeEach(() => {
    generatePlanMock.mockReset();
    generatePlanMock.mockResolvedValue(stubPlan);
  });

  it("returns 400 for invalid input", async () => {
    const res = await POST(post({ eventType: "wedding" }, "198.51.100.10"));
    expect(res.status).toBe(400);
    const body: { error: string; details: unknown } = await res.json();
    expect(body.error).toBe("Invalid input");
    expect(body.details).toBeTruthy();
    expect(generatePlanMock).not.toHaveBeenCalled();
  });

  it("returns 429 after 10 requests from the same IP", async () => {
    const ip = "198.51.100.11";
    for (let i = 0; i < 10; i++) {
      const res = await POST(post(validInput, ip));
      expect(res.status).toBe(200);
    }

    const blocked = await POST(post(validInput, ip));
    expect(blocked.status).toBe(429);
    await expect(blocked.json()).resolves.toEqual({
      error: "Too many requests. Please wait a minute.",
    });
  });

  it("returns 502 when plan generation throws", async () => {
    generatePlanMock.mockRejectedValue(new Error("gemini down"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await POST(post(validInput, "198.51.100.12"));
    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({
      error: "Could not generate a plan. Please try again.",
    });

    errorSpy.mockRestore();
  });
});
