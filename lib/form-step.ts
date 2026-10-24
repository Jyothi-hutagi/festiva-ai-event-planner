import { EventInputSchema } from "@/lib/schema";

const whatSchema = EventInputSchema.pick({
  eventType: true,
  date: true,
  eventName: true,
});

const whoSchema = EventInputSchema.pick({
  guestCount: true,
  budget: true,
  city: true,
});

const vibeSchema = EventInputSchema.pick({
  decorStyle: true,
  preferences: true,
  language: true,
});

type StepValues = {
  eventType?: string;
  date?: string;
  eventName?: string;
  guestCount?: number;
  budget?: number;
  city?: string;
  decorStyle?: string;
  preferences?: string;
  language?: string;
};

export function firstIncompleteStep(values: StepValues): 0 | 1 | 2 {
  if (!whatSchema.safeParse(values).success) {
    return 0;
  }
  if (!whoSchema.safeParse(values).success) {
    return 1;
  }
  if (!vibeSchema.safeParse(values).success) {
    return 2;
  }
  return 2;
}
