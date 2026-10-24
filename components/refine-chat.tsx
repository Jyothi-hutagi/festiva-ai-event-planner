"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { readApiError } from "@/lib/read-api-error";
import { queueRefine, type RefineMessage } from "@/lib/refine-messages";
import { PlanSchema, type EventInput, type Plan } from "@/lib/schema";

const suggestions = [
  "Make it cheaper",
  "Add a vegetarian menu",
  "Shift the date by 2 weeks",
  "Add more activities for kids",
];

type ChatMessage = RefineMessage;

function RefineStatus({
  messages,
  busy,
}: {
  messages: ChatMessage[];
  busy: boolean;
}) {
  const spoken = messages.filter((message) => message.role !== "error");
  return (
    <div aria-live="polite" className="grid gap-1">
      {spoken.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ask for a change to this plan.
        </p>
      ) : (
        <ul className="grid gap-1 text-sm">
          {spoken.map((message, index) => (
            <li key={`${message.role}-${index}`}>{message.text}</li>
          ))}
        </ul>
      )}
      {busy ? <p className="text-sm">Updating your plan...</p> : null}
    </div>
  );
}

function RefineError({
  messages,
  busy,
  onRetry,
}: {
  messages: ChatMessage[];
  busy: boolean;
  onRetry: () => void;
}) {
  const errorText = messages.find((message) => message.role === "error")?.text;
  if (!errorText) {
    return null;
  }
  return (
    <div className="grid gap-3">
      <p aria-live="assertive" aria-atomic="true" className="text-destructive">
        {errorText}
      </p>
      <Button
        type="button"
        variant="outline"
        className="w-fit"
        disabled={busy}
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}

export function RefineChat({
  plan,
  language,
  canUndo,
  onRefined,
  onUndo,
}: {
  plan: Plan;
  language: EventInput["language"];
  canUndo: boolean;
  onRefined: (plan: Plan) => void;
  onUndo: () => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const pending = useRef(false);
  const failedInstruction = useRef("");

  async function send(text: string, retry = false) {
    const nextInstruction = text.trim();
    if (!nextInstruction || nextInstruction.length > 300 || pending.current) {
      return;
    }
    pending.current = true;
    failedInstruction.current = nextInstruction;
    setBusy(true);
    setMessages((current) => queueRefine(current, nextInstruction, retry));
    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          instruction: nextInstruction,
          language,
        }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        setMessages((current) => [
          ...current,
          { role: "error", text: readApiError(body) },
        ]);
        return;
      }
      const parsed = PlanSchema.safeParse(body);
      if (!parsed.success) {
        setMessages((current) => [
          ...current,
          {
            role: "error",
            text: "Could not generate a plan. Please try again.",
          },
        ]);
        return;
      }
      onRefined(parsed.data);
      setInstruction("");
      failedInstruction.current = "";
      setMessages((current) => [
        ...current.filter((message) => message.role !== "error"),
        { role: "status", text: "Plan updated." },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "error", text: "Could not generate a plan. Please try again." },
      ]);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void send(instruction);
      }}
    >
      <h2 className="font-medium">Refine this plan</h2>
      <RefineStatus messages={messages} busy={busy} />
      <RefineError
        messages={messages}
        busy={busy}
        onRetry={() => void send(failedInstruction.current, true)}
      />
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => void send(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
      <label htmlFor="refine-instruction" className="text-sm">
        Instruction
      </label>
      <textarea
        id="refine-instruction"
        maxLength={300}
        rows={3}
        value={instruction}
        disabled={busy}
        onChange={(event) => setInstruction(event.target.value)}
        className="w-full min-h-11 rounded-[4px] border border-input bg-card px-3 py-2 text-base"
      />
      <p className="text-sm text-muted-foreground">{instruction.length}/300</p>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={busy || instruction.trim().length === 0}
        >
          Send
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy || !canUndo}
          onClick={() => {
            onUndo();
            setMessages((current) => [
              ...current,
              { role: "status", text: "Reverted to the previous plan" },
            ]);
          }}
        >
          Undo
        </Button>
      </div>
    </form>
  );
}
