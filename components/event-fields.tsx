import type { FieldError, UseFormRegister } from "react-hook-form";
import type { z } from "zod";
import type { EventInputSchema } from "@/lib/schema";

type EventFormInput = z.input<typeof EventInputSchema>;

export const fieldClass = "w-full bg-card";

export function FieldMessage({
  id,
  error,
}: {
  id: string;
  error?: FieldError;
}) {
  if (!error?.message) {
    return null;
  }
  const message =
    error.message.includes("NaN") || error.message.includes("expected number")
      ? "Enter a number."
      : error.message.includes(">=1 characters")
        ? "Enter a value."
        : error.message;
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function WhatFields({
  register,
  errors,
  minDate,
  showEventName,
}: {
  register: UseFormRegister<EventFormInput>;
  errors: {
    eventType?: FieldError;
    eventName?: FieldError;
    date?: FieldError;
  };
  minDate: string;
  showEventName: boolean;
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <label htmlFor="event-type">Event type</label>
        <select
          id="event-type"
          className={fieldClass}
          aria-invalid={Boolean(errors.eventType)}
          aria-describedby={errors.eventType ? "event-type-error" : undefined}
          {...register("eventType")}
        >
          <option value="wedding">Wedding</option>
          <option value="birthday">Birthday</option>
          <option value="community">Community event</option>
          <option value="workshop">Workshop</option>
          <option value="corporate">Corporate</option>
          <option value="other">Other</option>
        </select>
        <FieldMessage id="event-type-error" error={errors.eventType} />
      </div>
      {showEventName ? (
        <div className="grid gap-1">
          <label htmlFor="event-name">Event name</label>
          <input
            id="event-name"
            type="text"
            maxLength={80}
            placeholder="Trinket tray painting workshop"
            className={fieldClass}
            aria-invalid={Boolean(errors.eventName)}
            aria-describedby={errors.eventName ? "event-name-error" : undefined}
            {...register("eventName", { shouldUnregister: true })}
          />
          <FieldMessage id="event-name-error" error={errors.eventName} />
        </div>
      ) : null}
      <div className="grid gap-1">
        <label htmlFor="event-date">Date</label>
        <input
          id="event-date"
          type="date"
          min={minDate || undefined}
          className={fieldClass}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? "event-date-error" : undefined}
          {...register("date")}
        />
        <FieldMessage id="event-date-error" error={errors.date} />
      </div>
    </div>
  );
}
