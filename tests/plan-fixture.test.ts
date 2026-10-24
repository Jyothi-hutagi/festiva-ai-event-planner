import { describe, expect, it } from "vitest";
import plan from "../e2e/fixtures/plan.json";
import { PlanSchema } from "@/lib/schema";

describe("plan fixture", () => {
  it("passes PlanSchema", () => {
    expect(PlanSchema.parse(plan).budget.total).toBe(80000);
  });
});
