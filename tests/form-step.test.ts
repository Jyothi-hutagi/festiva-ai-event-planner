import { describe, expect, it } from "vitest";
import { firstIncompleteStep } from "@/lib/form-step";

const ready = {
  eventType: "workshop",
  date: "2026-12-04",
  eventName: "Trinket tray painting workshop",
  guestCount: 12,
  budget: 15000,
  city: "Pune",
  decorStyle: "pastel boho",
  preferences: "",
  language: "hi" as const,
};

describe("firstIncompleteStep", () => {
  it("stops on the first step when the date is missing", () => {
    expect(firstIncompleteStep({ ...ready, date: "" })).toBe(0);
  });

  it("stops on who and where when the city is missing", () => {
    expect(firstIncompleteStep({ ...ready, city: "" })).toBe(1);
  });

  it("stops on who and where when the guest count is empty", () => {
    expect(firstIncompleteStep({ ...ready, guestCount: Number.NaN })).toBe(1);
  });

  it("opens Vibe when every required field is valid", () => {
    expect(firstIncompleteStep(ready)).toBe(2);
  });
});
