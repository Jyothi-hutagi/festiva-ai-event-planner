import { NextResponse } from "next/server";

export const MISSING_GEMINI_KEY_MESSAGE =
  "Server is missing GEMINI_API_KEY. See README.";

export function geminiKey() {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key ? key : null;
}

/** 503 when the server has no key. Null when the route can continue. */
export function geminiUnavailableResponse() {
  if (geminiKey()) {
    return null;
  }
  return NextResponse.json(
    { error: MISSING_GEMINI_KEY_MESSAGE },
    { status: 503 },
  );
}
