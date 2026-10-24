import { formatINR } from "@/lib/budget";
import { daysUntil } from "@/lib/countdown";
import { type EventInput, type EventInputSchema } from "@/lib/schema";
import type { z } from "zod";

type EventFormInput = z.input<typeof EventInputSchema>;

export type InvitationValues = {
  name: string;
  type: EventInput["eventType"] | "";
  date: string;
  city: string;
  guests: number | null;
  budget: number | null;
  language: "en" | "hi";
};

const typeLabels: Record<EventInput["eventType"], string> = {
  wedding: "Wedding",
  birthday: "Birthday",
  community: "Community event",
  workshop: "Workshop",
  corporate: "Corporate",
  other: "Other",
};

export function eventTypeLabel(type: EventInput["eventType"]) {
  return typeLabels[type];
}

export type InvitationLine = {
  text: string;
  placeholder: boolean;
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function invitationName(values: InvitationValues): InvitationLine {
  const name = values.name.trim();
  if (name) {
    return { text: name, placeholder: false };
  }
  const city = values.city.trim();
  if (values.type && city) {
    return {
      text: `${typeLabels[values.type]} in ${city}`,
      placeholder: false,
    };
  }
  return { text: "Your event name", placeholder: true };
}

export function invitationDate(date: string): InvitationLine {
  if (!datePattern.test(date)) {
    return { text: "Pick a date", placeholder: true };
  }
  const [year, month, day] = date.split("-").map(Number);
  return {
    text: new Date(year, month - 1, day).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    placeholder: false,
  };
}

export function invitationCity(city: string): InvitationLine {
  const trimmed = city.trim();
  if (!trimmed) {
    return { text: "Your city", placeholder: true };
  }
  return { text: trimmed, placeholder: false };
}

export function invitationGuests(guests: number | null) {
  if (guests === null || !Number.isInteger(guests) || guests < 1) {
    return null;
  }
  return guests === 1 ? "1 guest" : `${guests} guests`;
}

export function invitationCountdown(date: string, now?: Date) {
  if (!datePattern.test(date)) {
    return null;
  }
  const days = daysUntil(date, now ?? new Date());
  if (days === 0) {
    return "Today";
  }
  return days === 1 ? "1 day" : `${days} days`;
}

export function invitationBudget(budget: number | null) {
  if (budget === null || !Number.isFinite(budget) || budget <= 0) {
    return null;
  }
  return formatINR(budget);
}

export function invitationLanguage(language: InvitationValues["language"]) {
  return language === "hi" ? "हिन्दी" : "English";
}

export function watchedInvitation(
  values: Partial<EventFormInput>,
): InvitationValues {
  const guests = values.guestCount;
  const budget = values.budget;
  return {
    name: values.eventName ?? "",
    type: values.eventType ?? "",
    date: values.date ?? "",
    city: values.city ?? "",
    guests:
      typeof guests === "number" && Number.isInteger(guests) && guests >= 1
        ? guests
        : null,
    budget:
      typeof budget === "number" && Number.isFinite(budget) && budget > 0
        ? budget
        : null,
    language: values.language === "hi" ? "hi" : "en",
  };
}
