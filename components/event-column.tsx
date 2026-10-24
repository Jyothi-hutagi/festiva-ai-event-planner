"use client";

import { useRef } from "react";
import { EventForm, type EventFormHandle } from "@/components/event-form";
import { Invitation } from "@/components/invitation";
import { QuickStart } from "@/components/quick-start";
import type { EventInput } from "@/lib/schema";

export function EventColumn({
  busy,
  formVersion,
  formSeed,
  onCreate,
}: {
  busy: boolean;
  formVersion: number;
  formSeed: EventInput | null;
  onCreate: (input: EventInput) => Promise<void>;
}) {
  const formRef = useRef<EventFormHandle>(null);

  return (
    <EventForm
      ref={formRef}
      key={formVersion}
      busy={busy}
      initialValues={formSeed}
      onCreate={onCreate}
    >
      {(form, values) => (
        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          <div className="paper-sheet relative order-2 grid gap-6 p-6 md:order-1 md:p-8">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-0.5 rounded-t-[12px] bg-accent"
            />
            <QuickStart
              onSelect={(preset) => formRef.current?.applyPreset(preset)}
            />
            {form}
          </div>
          <div className="order-1 md:order-2">
            <Invitation
              showCaption
              name={values.name}
              eventType={values.type}
              city={values.city}
              date={values.date}
              guests={values.guests ?? undefined}
              budget={values.budget ?? undefined}
              language={values.language}
            />
          </div>
        </div>
      )}
    </EventForm>
  );
}
