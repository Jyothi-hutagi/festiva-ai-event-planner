# Toran: AI Celebration & Event Planner

GenAI planning assistant that helps organize weddings, birthdays and community events with
budgets, timelines, vendor checklists and personalized ideas.

**Live demo:** <your-vercel-url> · **Demo video:** <link>

## Features

- Budget breakdown by category, with chart
- Countdown timeline from planning start to day-of
- Tickable vendor checklists with questions to ask each vendor
- Personalized themes, menus, activities and decor
- Chat refinement ("make it cheaper", "add a vegetarian menu")
- PDF export and saved plans

## Architecture

Form -> `POST /api/plan` -> Gemini (system prompt + inputs) -> JSON -> Zod validation -> UI
Chat -> `POST /api/refine` (current plan + instruction) -> validated updated plan

## Tools used and why

| Tool             | Why                                                      |
| ---------------- | -------------------------------------------------------- |
| Cursor           | Agent-driven development with project rules              |
| Gemini API       | Structured JSON output, free tier, fits the Google theme |
| Next.js + Vercel | Server routes keep the API key private; easy deploy      |
| Zod              | Guarantees AI output is safe for the UI                  |

## What GenAI handled vs. what I designed

- **GenAI:** plan content, scaffolding, boilerplate, test drafts
- **Me:** product scope, schema design, security decisions, UX, prompt iteration (see PROMPTS.md)

## Security and quality

- API key server-side only; inputs and outputs validated with Zod
- Rate limiting on API routes; AI text rendered as plain text
- Unit tests (budget math, schema), one Playwright e2e flow
- Accessibility: labels, keyboard navigation, aria-live regions

## Setup

1. Install dependencies with `npm install`.
2. Copy the example env file and add a key from [Google AI Studio](https://aistudio.google.com):

```bash
cp .env.example .env.local
```

Set `GEMINI_API_KEY` in `.env.local`. The key stays on the server. Do not prefix it with `NEXT_PUBLIC_`.

3. Start the app with `npm run dev`.

If `GEMINI_API_KEY` is missing, every API route responds with HTTP 503 and `Server is missing GEMINI_API_KEY. See README.` The page shows that sentence in the error state.

`npm run build` downloads Baloo 2 and Hind through `next/font`. That build needs internet access. The font files are fetched at build time and are not added to the project zip.
