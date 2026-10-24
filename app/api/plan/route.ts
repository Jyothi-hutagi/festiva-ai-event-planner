import { NextResponse } from "next/server";
import { geminiFailureResponse } from "@/lib/gemini-error";
import { geminiUnavailableResponse } from "@/lib/gemini-key";
import { EventInputSchema } from "@/lib/schema";
import { generatePlan } from "@/lib/gemini";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

export async function POST(req: Request) {
  const unavailable = geminiUnavailableResponse();
  if (unavailable) {
    return unavailable;
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute." },
      { status: 429 },
    );
  }

  const parsed = EventInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const plan = await generatePlan(parsed.data);
    return NextResponse.json(plan);
  } catch (err) {
    return geminiFailureResponse(err, "plan generation failed");
  }
}
