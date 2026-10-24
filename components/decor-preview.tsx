"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { readApiError } from "@/lib/read-api-error";
import type { EventInput, Plan } from "@/lib/schema";

const safeMime = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const DecorResponseSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  images: z
    .array(
      z.object({
        mimeType: z.string().trim().min(1).max(80),
        data: z.string().min(1).max(8_000_000),
      }),
    )
    .max(2),
});

type Status = "idle" | "loading" | "error" | "empty" | "stored" | "ready";

function imageSrc(mimeType: string, data: string) {
  if (!safeMime.has(mimeType) || !/^[A-Za-z0-9+/=\r\n]+$/.test(data)) {
    return null;
  }
  return `data:${mimeType};base64,${data.replace(/\s/g, "")}`;
}

export function DecorPreview({
  input,
  plan,
  savedPrompt,
  onPrompt,
}: {
  input: EventInput;
  plan: Plan;
  savedPrompt: string;
  onPrompt: (prompt: string) => void;
}) {
  const [status, setStatus] = useState<Status>(savedPrompt ? "stored" : "idle");
  const [message, setMessage] = useState("");
  const [prompt, setPrompt] = useState(savedPrompt);
  const [src, setSrc] = useState<string | null>(null);

  async function generate() {
    setStatus("loading");
    setMessage("");
    setSrc(null);
    try {
      const response = await fetch("/api/decor-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, plan }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(readApiError(body));
      }
      const parsed = DecorResponseSchema.safeParse(body);
      if (!parsed.success) {
        throw new Error("Could not generate a plan. Please try again.");
      }
      onPrompt(parsed.data.prompt);
      setPrompt(parsed.data.prompt);
      const next = parsed.data.images
        .map((image) => imageSrc(image.mimeType, image.data))
        .find((value) => value !== null);
      if (!next) {
        setStatus("empty");
        return;
      }
      setSrc(next);
      setStatus("ready");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not generate a plan. Please try again.",
      );
      setStatus("error");
    }
  }

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Decor preview</h2>
        <Button
          type="button"
          variant="outline"
          disabled={status === "loading"}
          onClick={() => void generate()}
        >
          {status === "error" ? "Retry" : "Generate preview"}
        </Button>
      </div>
      <div aria-live="polite" className="grid gap-3">
        {status === "loading" ? <p>Creating a decor preview...</p> : null}
        {status === "error" ? <p>{message}</p> : null}
        {status === "idle" ? (
          <p>Generate a decor preview when you want one.</p>
        ) : null}
        {status === "empty" ? <p>No decor preview was returned.</p> : null}
        {status === "stored" ? (
          <>
            {prompt ? <p>{prompt}</p> : null}
            <p>Preview is not stored. Generate it again.</p>
          </>
        ) : null}
        {status === "ready" && src ? (
          <>
            {prompt ? <p>{prompt}</p> : null}
            {/* eslint-disable-next-line @next/next/no-img-element -- in-memory data URL */}
            <img
              src={src}
              alt="AI concept preview"
              className="max-w-full rounded-lg border border-border"
            />
            <p>AI concept preview</p>
          </>
        ) : null}
      </div>
    </section>
  );
}
