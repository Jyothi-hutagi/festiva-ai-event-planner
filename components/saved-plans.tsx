"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { deletePlan, listPlans, type SavedPlan } from "@/lib/saved-plans";
import { eventTypeLabel } from "@/lib/invitation-copy";

export function SavedPlans({
  savedVersion,
  onOpen,
  onDeleted,
}: {
  savedVersion: number;
  onOpen: (entry: SavedPlan) => void;
  onDeleted: (id: string) => void;
}) {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [pendingDelete, setPendingDelete] = useState<SavedPlan | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        setPlans(listPlans());
      }
    });
    return () => {
      active = false;
    };
  }, [savedVersion]);

  function refresh() {
    setPlans(listPlans());
  }

  function askDelete(entry: SavedPlan) {
    setPendingDelete(entry);
    dialogRef.current?.showModal();
  }

  function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    deletePlan(pendingDelete.id);
    onDeleted(pendingDelete.id);
    setPendingDelete(null);
    dialogRef.current?.close();
    refresh();
  }

  return (
    <section aria-labelledby="saved-plans-heading" className="grid gap-3">
      <h2 id="saved-plans-heading" className="text-2xl">
        Your saved plans
      </h2>
      {plans.length === 0 ? (
        <p className="max-w-[60ch] text-muted-foreground">
          Nothing saved yet. Create a plan and it will be kept on this device.
        </p>
      ) : (
        <ul className="grid gap-3">
          {plans.map((entry) => (
            <li
              key={entry.id}
              className="grid gap-2 border-t border-border pt-3"
            >
              <p className="font-medium">{entry.name}</p>
              <p className="text-muted-foreground">
                {eventTypeLabel(entry.input.eventType)} · {entry.input.date}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpen(entry)}
                >
                  Open
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => askDelete(entry)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-lg border border-border bg-background p-4 text-foreground backdrop:bg-black/40"
      >
        <h2 id={titleId} className="font-medium">
          Delete this saved plan?
        </h2>
        <p className="mt-2 text-sm">{pendingDelete?.name}</p>
        <div className="mt-4 flex gap-2">
          <Button type="button" onClick={confirmDelete}>
            Delete
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => dialogRef.current?.close()}
          >
            Cancel
          </Button>
        </div>
      </dialog>
    </section>
  );
}
