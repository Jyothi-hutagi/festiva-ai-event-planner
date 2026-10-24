import type { FieldError, UseFormRegister } from "react-hook-form";
import type { z } from "zod";
import { FieldMessage, fieldClass } from "@/components/event-fields";
import type { EventInputSchema } from "@/lib/schema";

type EventFormInput = z.input<typeof EventInputSchema>;

export function WhoFields({
  register,
  errors,
}: {
  register: UseFormRegister<EventFormInput>;
  errors: {
    guestCount?: FieldError;
    budget?: FieldError;
    city?: FieldError;
  };
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <label htmlFor="guest-count">Guest count</label>
        <input
          id="guest-count"
          type="number"
          min={1}
          max={5000}
          inputMode="numeric"
          className={fieldClass}
          aria-invalid={Boolean(errors.guestCount)}
          aria-describedby={errors.guestCount ? "guest-count-error" : undefined}
          {...register("guestCount", { valueAsNumber: true })}
        />
        <FieldMessage id="guest-count-error" error={errors.guestCount} />
      </div>
      <div className="grid gap-1">
        <label htmlFor="budget">Budget (INR)</label>
        <input
          id="budget"
          type="number"
          min={1}
          inputMode="numeric"
          className={fieldClass}
          aria-invalid={Boolean(errors.budget)}
          aria-describedby={errors.budget ? "budget-error" : undefined}
          {...register("budget", { valueAsNumber: true })}
        />
        <FieldMessage id="budget-error" error={errors.budget} />
      </div>
      <div className="grid gap-1">
        <label htmlFor="city">City</label>
        <input
          id="city"
          type="text"
          maxLength={80}
          className={fieldClass}
          aria-invalid={Boolean(errors.city)}
          aria-describedby={errors.city ? "city-error" : undefined}
          {...register("city")}
        />
        <FieldMessage id="city-error" error={errors.city} />
      </div>
    </div>
  );
}

export function VibeFields({
  register,
  errors,
  preferencesLength,
}: {
  register: UseFormRegister<EventFormInput>;
  errors: {
    decorStyle?: FieldError;
    preferences?: FieldError;
    language?: FieldError;
  };
  preferencesLength: number;
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <label htmlFor="decor-style">Decor style</label>
        <input
          id="decor-style"
          type="text"
          maxLength={60}
          placeholder="pastel boho"
          className={fieldClass}
          aria-invalid={Boolean(errors.decorStyle)}
          aria-describedby={errors.decorStyle ? "decor-style-error" : undefined}
          {...register("decorStyle")}
        />
        <FieldMessage id="decor-style-error" error={errors.decorStyle} />
      </div>
      <div className="grid gap-1">
        <label htmlFor="preferences">Preferences</label>
        <textarea
          id="preferences"
          maxLength={500}
          rows={4}
          className={fieldClass}
          aria-invalid={Boolean(errors.preferences)}
          aria-describedby={
            errors.preferences
              ? "preferences-count preferences-error"
              : "preferences-count"
          }
          {...register("preferences")}
        />
        <p id="preferences-count" className="text-sm text-muted-foreground">
          {preferencesLength}/500
        </p>
        <FieldMessage id="preferences-error" error={errors.preferences} />
      </div>
      <div className="grid gap-1">
        <label htmlFor="language">Language</label>
        <select
          id="language"
          className={fieldClass}
          aria-invalid={Boolean(errors.language)}
          aria-describedby={errors.language ? "language-error" : undefined}
          {...register("language")}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </select>
        <FieldMessage id="language-error" error={errors.language} />
      </div>
    </div>
  );
}
