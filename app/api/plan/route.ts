import { NextResponse } from "next/server";
import { EventInputSchema } from "@/lib/schema";
import { generatePlan } from "@/lib/gemini";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

export async function POST(req: Request) {
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
    console.error("plan generation failed", err);
    return NextResponse.json(
      { error: "Could not generate a plan. Please try again." },
      { status: 502 },
    );
  }
}
