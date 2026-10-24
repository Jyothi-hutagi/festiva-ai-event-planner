import { NextResponse } from "next/server";

export const QUOTA_IMAGE_MESSAGE =
  "This Gemini key cannot generate images on the free tier.";
export const QUOTA_DAILY_MESSAGE =
  "The Gemini free quota for today is used up. Try again tomorrow.";
export const PLAN_FAILED_MESSAGE =
  "Could not generate a plan. Please try again.";

export function geminiQuotaMessage(err: unknown) {
  const message = err instanceof Error ? err.message : "";
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? (err as { status?: unknown }).status
      : undefined;
  const quota =
    status === 429 ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.toLowerCase().includes("quota");
  if (!quota) return null;
  if (/limit:\s*0/.test(message)) return QUOTA_IMAGE_MESSAGE;
  return QUOTA_DAILY_MESSAGE;
}

export function geminiFailureResponse(err: unknown, log: string) {
  console.error(log, err);
  const quota = geminiQuotaMessage(err);
  return NextResponse.json(
    { error: quota ?? PLAN_FAILED_MESSAGE },
    { status: quota ? 429 : 502 },
  );
}
