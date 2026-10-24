import { describe, expect, it } from "vitest";
import { queueRefine, type RefineMessage } from "@/lib/refine-messages";

const prior: RefineMessage[] = [
  { role: "user", text: "Make it cheaper" },
  { role: "user", text: "Add more activities for kids" },
  { role: "error", text: "Could not generate a plan. Please try again." },
];

describe("queueRefine", () => {
  it("adds a new instruction and drops the previous error", () => {
    expect(queueRefine(prior, "Add a vegetarian menu", false)).toEqual([
      { role: "user", text: "Make it cheaper" },
      { role: "user", text: "Add more activities for kids" },
      { role: "user", text: "Add a vegetarian menu" },
    ]);
  });

  it("keeps the same instruction when the person tries again", () => {
    expect(queueRefine(prior, "Add more activities for kids", true)).toEqual([
      { role: "user", text: "Make it cheaper" },
      { role: "user", text: "Add more activities for kids" },
    ]);
  });
});
