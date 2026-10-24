"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type Ref,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { EventFormView } from "@/components/event-form-view";
import type { QuickPreset } from "@/components/quick-start";
import { firstIncompleteStep } from "@/lib/form-step";
import {
  watchedInvitation,
  type InvitationValues,
} from "@/lib/invitation-copy";
import { EventInputSchema, type EventInput } from "@/lib/schema";

type EventFormInput = z.input<typeof EventInputSchema>;

const emptyDefaults = {
  eventType: "wedding" as const,
  date: "",
  city: "",
  preferences: "",
  eventName: "",
  decorStyle: "",
  language: "en" as const,
};

function localToday() {
  return new Date().toLocaleDateString("en-CA");
}

export type EventFormHandle = {
  applyPreset: (preset: QuickPreset) => void;
};

export function EventForm({
  ref,
  busy,
  onCreate,
  initialValues,
  children,
}: {
  ref?: Ref<EventFormHandle>;
  busy: boolean;
  onCreate: (input: EventInput) => Promise<void>;
  initialValues?: EventInput | null;
  children: (form: ReactNode, values: InvitationValues) => ReactNode;
}) {
  const minDate = useSyncExternalStore(
    () => () => {},
    localToday,
    () => "",
  );
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const skipFocus = useRef(true);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<EventFormInput, unknown, EventInput>({
    resolver: zodResolver(EventInputSchema),
    defaultValues: initialValues ?? emptyDefaults,
  });
  const watched = useWatch({ control });
  const preferences = watched.preferences ?? "";
  const eventType = watched.eventType;
  const showEventName = eventType === "workshop" || eventType === "other";
  const disabled = busy || isSubmitting;

  useEffect(() => {
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  useImperativeHandle(
    ref,
    () => ({
      applyPreset(preset) {
        setValue("eventType", preset.eventType);
        setValue("guestCount", preset.guestCount);
        setValue("budget", preset.budget);
        if (preset.eventName !== undefined) {
          setValue("eventName", preset.eventName);
        }
        if (preset.decorStyle !== undefined) {
          setValue("decorStyle", preset.decorStyle);
        }
        const values = getValues();
        setStep(
          firstIncompleteStep({
            ...values,
            eventType: preset.eventType,
            guestCount: preset.guestCount,
            budget: preset.budget,
            eventName: preset.eventName ?? values.eventName,
            decorStyle: preset.decorStyle ?? values.decorStyle,
          }),
        );
      },
    }),
    [getValues, setValue],
  );

  async function goNext() {
    const names =
      step === 0
        ? showEventName
          ? (["eventType", "date", "eventName"] as const)
          : (["eventType", "date"] as const)
        : (["guestCount", "budget", "city"] as const);
    if (await trigger(names)) {
      setStep(step === 0 ? 1 : 2);
    }
  }

  return children(
    <EventFormView
      step={step}
      headingRef={headingRef}
      register={register}
      errors={errors}
      minDate={minDate}
      showEventName={showEventName}
      preferencesLength={preferences.length}
      disabled={disabled}
      onBack={() => setStep(step === 2 ? 1 : 0)}
      onNext={() => void goNext()}
      onSubmit={(event) => {
        if (step !== 2) {
          event.preventDefault();
          void goNext();
          return;
        }
        void handleSubmit(onCreate)(event);
      }}
    />,
    watchedInvitation(watched),
  );
}
