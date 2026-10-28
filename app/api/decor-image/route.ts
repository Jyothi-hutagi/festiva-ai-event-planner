import { NextResponse } from "next/server";
import { z } from "zod";
import { geminiFailureResponse } from "@/lib/gemini-error";
import { geminiUnavailableResponse } from "@/lib/gemini-key";
import { generateDecorImages, MAX_DECOR_IMAGE_CHARS } from "@/lib/gemini";
import { rateLimit } from "@/lib/rate-limit";
import { EventInputSchema, PlanSchema } from "@/lib/schema";

export const maxDuration = 60;

const DecorImageBodySchema = z.object({
  input: EventInputSchema,
  plan: PlanSchema,
});

const DecorImageResponseSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  images: z
    .array(
      z.object({
        mimeType: z.string().trim().min(1).max(80),
        data: z.string().min(1).max(MAX_DECOR_IMAGE_CHARS),
      }),
    )
    .min(1)
    .max(2),
});

/** Vercel rejects a function response above 4.5 MB. */
const MAX_RESPONSE_BYTES = 4_500_000;

export async function POST(req: Request) {
  const unavailable = geminiUnavailableResponse();
  if (unavailable) {
    return unavailable;
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`decor-image:${ip}`, 10)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute." },
      { status: 429 },
    );
  }

  const parsed = DecorImageBodySchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const rawResult = await generateDecorImages(parsed.data.input, parsed.data.plan);
    const result = DecorImageResponseSchema.parse(rawResult);
    if (Buffer.byteLength(JSON.stringify(result)) > MAX_RESPONSE_BYTES) {
      throw new Error("decor image response too large");
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("DECOR_IMAGE_ERROR_DETAILED:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
