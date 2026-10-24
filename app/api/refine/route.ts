import { NextResponse } from "next/server";
import { z } from "zod";
import { EventInputSchema, PlanSchema } from "@/lib/schema";
import { refinePlan } from "@/lib/gemini";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

const RefineBodySchema = z.object({
  plan: PlanSchema,
  instruction: z.string().trim().min(1).max(300),
  language: EventInputSchema.shape.language,
});

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute." },
      { status: 429 },
    );
  }

  const parsed = RefineBodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const plan = await refinePlan(
      parsed.data.plan,
      parsed.data.instruction,
      parsed.data.language,
    );
    return NextResponse.json(plan);
  } catch (err) {
    console.error("plan refinement failed", err);
    return NextResponse.json(
      { error: "Could not generate a plan. Please try again." },
      { status: 502 },
    );
  }
}
