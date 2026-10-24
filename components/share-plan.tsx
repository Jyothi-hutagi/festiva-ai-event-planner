"use client";

import { useState } from "react";
import { ExternalLink } from "@/components/external-link";
import { Button } from "@/components/ui/button";

function copyWithFallback(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
}

export async function copyPlainText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // The clipboard API can reject without a fallback write.
  }
  return copyWithFallback(text);
}

export function CopyTextButton({ text }: { text: string }) {
  const [message, setMessage] = useState("");

  async function copy() {
    const copied = await copyPlainText(text);
    setMessage(copied ? "Copied" : "Could not copy the plan.");
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => void copy()}>
        Copy text
      </Button>
      <p aria-live="polite" className="sr-only">
        {message}
      </p>
    </>
  );
}

export function WhatsAppShare({ text }: { text: string }) {
  return (
    <ExternalLink
      href={`https://wa.me/?text=${encodeURIComponent(text)}`}
      nowrap
      showDomain={false}
      className="inline-flex min-h-11 items-center rounded-[4px] border border-border bg-background px-4 text-base font-semibold whitespace-nowrap print:hidden"
    >
      Share on WhatsApp
    </ExternalLink>
  );
}
