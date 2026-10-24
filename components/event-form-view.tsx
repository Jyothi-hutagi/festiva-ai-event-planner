import type { FormEvent, RefObject } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { z } from "zod";
import { WhatFields } from "@/components/event-fields";
import { StepThread } from "@/components/step-thread";
import { Button } from "@/components/ui/button";
import { VibeFields, WhoFields } from "@/components/who-vibe-fields";
import type { EventInputSchema } from "@/lib/schema";

type EventFormInput = z.input<typeof EventInputSchema>;
const stepTitles = ["What", "Who and where", "Vibe"] as const;

export function EventFormView({
  step,
  headingRef,
  register,
  errors,
  minDate,
  showEventName,
  preferencesLength,
  disabled,
  onBack,
  onNext,
  onSubmit,
}: {
  step: 0 | 1 | 2;
  headingRef: RefObject<HTMLHeadingElement | null>;
  register: UseFormRegister<EventFormInput>;
  errors: FieldErrors<EventFormInput>;
  minDate: string;
  showEventName: boolean;
  preferencesLength: number;
  disabled: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="grid gap-6" noValidate onSubmit={onSubmit}>
      <StepThread step={step} />
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-[22px] leading-[1.3] outline-none focus:outline-none focus-visible:outline-none"
      >
        <span className="sr-only">{`Step ${step + 1} of 3: `}</span>
        {stepTitles[step]}
      </h2>
      <div hidden={step !== 0}>
        <WhatFields
          register={register}
          errors={errors}
          minDate={minDate}
          showEventName={showEventName}
        />
      </div>
      <div hidden={step !== 1}>
        <WhoFields register={register} errors={errors} />
      </div>
      <div hidden={step !== 2}>
        <VibeFields
          register={register}
          errors={errors}
          preferencesLength={preferencesLength}
        />
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        {step > 0 ? (
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={onBack}
          >
            Back
          </Button>
        ) : null}
        {step < 2 ? (
          <Button key="next" type="button" disabled={disabled} onClick={onNext}>
            Next
          </Button>
        ) : (
          <Button key="create" type="submit" disabled={disabled}>
            {disabled ? "Creating your plan..." : "Create my plan"}
          </Button>
        )}
      </div>
    </form>
  );
}
