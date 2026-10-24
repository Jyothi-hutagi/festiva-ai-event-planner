import { describe, expect, it } from "vitest";
import { formatINR } from "@/lib/budget";
import {
  invitationBudget,
  invitationCity,
  invitationCountdown,
  invitationDate,
  invitationGuests,
  invitationName,
  watchedInvitation,
  type InvitationValues,
} from "@/lib/invitation-copy";

const blank: InvitationValues = {
  name: "",
  type: "wedding",
  date: "",
  city: "",
  guests: null,
  budget: null,
  language: "en",
};

describe("invitation copy", () => {
  it("shows placeholders until a name or a city is typed", () => {
    expect(invitationName(blank)).toEqual({
      text: "Your event name",
      placeholder: true,
    });
    expect(invitationDate("")).toEqual({
      text: "Pick a date",
      placeholder: true,
    });
    expect(invitationCity("")).toEqual({
      text: "Your city",
      placeholder: true,
    });
  });

  it("prefers the event name, then type in city", () => {
    expect(
      invitationName({
        ...blank,
        name: "Trinket tray painting workshop",
        type: "workshop",
        city: "Pune",
      }).text,
    ).toBe("Trinket tray painting workshop");
    expect(
      invitationName({ ...blank, name: "  ", type: "wedding", city: "Pune" })
        .text,
    ).toBe("Wedding in Pune");
  });

  it("formats the date, guests, countdown, and budget", () => {
    expect(invitationDate("2026-12-04").text).toBe("4 Dec 2026");
    expect(invitationGuests(12)).toBe("12 guests");
    expect(invitationGuests(1)).toBe("1 guest");
    expect(invitationGuests(Number.NaN)).toBeNull();
    expect(invitationCountdown("2026-12-04", new Date(2026, 9, 23))).toBe(
      "42 days",
    );
    expect(invitationCountdown("2026-10-23", new Date(2026, 9, 23))).toBe(
      "Today",
    );
    expect(invitationBudget(15000)).toBe(formatINR(15000));
    expect(invitationBudget(null)).toBeNull();
  });

  it("maps a partial form without inventing guests or a budget", () => {
    expect(
      watchedInvitation({
        eventType: "birthday",
        city: "Pune",
        guestCount: Number.NaN,
        budget: 40000,
        language: "hi",
      }),
    ).toMatchObject({
      type: "birthday",
      city: "Pune",
      guests: null,
      budget: 40000,
      language: "hi",
    });
  });
});
