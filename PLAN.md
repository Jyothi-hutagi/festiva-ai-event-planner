# Toran — GenAI Celebration & Event Planner

Plan only. No application code in this step.

Toran plans weddings, birthdays, and community events. A person enters the event, date, guest count, budget (INR), city, and optional preferences. The app returns a validated plan: summary, budget breakdown, timeline, vendor checklists with questions, and ideas for themes, menu, activities, and decor. They can refine it in chat, print it, and save plans in the browser.

The sections through “Out of scope for this plan” are Phase 1, and those steps are already built. Phase 2, live recommendations, is specified at the end of this file.

## Current state

`lib/` and `app/api/plan/` are not in the repo yet. The reference sources are in `files/` and match `.cursorrules`:

| Reference file        | Intended location       | Role                             |
| --------------------- | ----------------------- | -------------------------------- |
| `files/.cursorrules`  | project rules           | Stack and standards              |
| `files/schema.ts`     | `lib/schema.ts`         | `EventInputSchema`, `PlanSchema` |
| `files/gemini.ts`     | `lib/gemini.ts`         | `generatePlan`, `refinePlan`     |
| `files/rate-limit.ts` | `lib/rate-limit.ts`     | 10 requests / minute / IP        |
| `files/route.ts`      | `app/api/plan/route.ts` | `POST /api/plan`                 |
| `files/.env.example`  | `.env.example`          | `GEMINI_API_KEY`, `GEMINI_MODEL` |

`refinePlan` already exists in `files/gemini.ts`. `app/api/refine/route.ts` does not. The hint in `files/refine-route-hint.md` is the contract for that route.

## Stack

From `files/.cursorrules`:

- Next.js App Router, TypeScript strict, Tailwind, shadcn/ui
- Zod for every request body and every Gemini response
- Vitest for unit tests, Playwright for one end-to-end flow
- Gemini via `@google/genai`, called only from `app/api/*`
- Default model: `GEMINI_MODEL` or `gemini-2.5-flash`
- API key: `GEMINI_API_KEY`, server-only. No `NEXT_PUBLIC_` secret.

## Decisions

1. **Saved plans** live in `localStorage` only. No accounts and no database. Each save stores the form input, the validated plan, checklist ticks, and a timestamp.
2. **Print** uses `window.print()` and a print stylesheet. No PDF library and no new dependency. The plan is not sent to a server route.
3. **Countdown** uses the user's local timezone. Parse a `YYYY-MM-DD` value by splitting it and constructing `new Date(year, monthIndex, day)` so the calendar day stays local. A bare `new Date("YYYY-MM-DD")` is UTC and can land on the previous day. Days remaining are whole local calendar days. Today is 0. A past date is clamped to 0.
4. **Timeline** stays the phased task list from `PlanSchema` (`phase` + `tasks`). It is separate from the numeric countdown.
5. **Vendor ticks** are UI state. `PlanSchema` vendors are `{ type, checklist: string[], questionsToAsk: string[] }`. Ticks are not sent to Gemini.
6. **One page** for the planner. Saved plans open on that same page.
7. **Budget chart** uses the shadcn chart (Recharts): category name, amount, and percent. The table remains the text alternative.

## Features

1. **Event form.** Event type (`wedding` | `birthday` | `community`), date, guest count (1–5000), budget in INR (positive, max 100,000,000), city (1–80 chars), preferences (max 500, optional).
2. **Budget breakdown and chart.** Categories of at least 3. Each has name, amount, percent, and optional notes. Category amounts must match `budget.total` within 2% (`PlanSchema` refine rule). Show a chart and a table.
3. **Countdown and timeline.** Days until the event date in the user's local timezone, clamped at 0 when the date is today or in the past, plus the phased timeline (at least 3 phases, earliest planning through day-of).
4. **Tickable vendor checklists.** At least 3 vendor types. Each has a checklist and questions to ask. Items can be checked off. Ticks persist with the saved plan.
5. **Personalized ideas.** Themes, menu, activities, and decor. At least one item in each list. Rendered as plain text.
6. **Chat refinement.** Instruction 1–300 characters. Examples: “make it cheaper”, “add a vegetarian menu”. `POST /api/refine` returns a full updated plan in the same shape.
7. **Print.** A print button calls `window.print()`. A print stylesheet shows the current plan (summary, budget, timeline, vendors, questions, and ideas) and hides the form, chat, and saved-plan controls. No PDF library.
8. **Saved plans.** Name, date, and event type in a list. Open, delete, and replace the plan currently on screen. Empty state when nothing is saved.

Every screen that waits on the network has loading, error, and empty states.

## Folder structure

```
app/
  layout.tsx
  page.tsx                      # form, plan, chat, saved plans
  globals.css
  api/
    plan/route.ts               # from files/route.ts
    refine/route.ts             # new, same pattern as plan
components/
  event-form.tsx
  plan-view.tsx
  budget-chart.tsx
  budget-table.tsx
  countdown.tsx
  timeline.tsx
  vendor-list.tsx
  ideas-panel.tsx
  refine-chat.tsx
  saved-plans.tsx
  print-button.tsx              # calls window.print()
  status-message.tsx            # loading, error, empty
lib/
  schema.ts
  gemini.ts
  rate-limit.ts
  budget.ts                     # display helpers; schema already checks the 2% sum
  countdown.ts                  # local YYYY-MM-DD parse, clamp at 0
  saved-plans.ts                # localStorage read/write
components/ui/                  # shadcn primitives actually used
tests/
  schema.test.ts
  budget.test.ts
  countdown.test.ts
  rate-limit.test.ts
  saved-plans.test.ts
e2e/
  plan-flow.spec.ts
```

Components stay under about 150 lines. `plan-view.tsx` only composes the sections above.

## Data flow

### Generate

```
EventForm
  -> POST /api/plan
    -> rateLimit(ip)                         # 429 if over 10 / minute
    -> EventInputSchema.safeParse(body)      # 400 if invalid
    -> generatePlan(input)
         -> Gemini (system prompt + event fields)
         -> JSON.parse
         -> PlanSchema.parse                 # retry once if invalid
    -> 200 plan JSON                         # 502 if Gemini or Zod still fails
  -> PlanView
```

User preferences are wrapped in `<preferences>` in `lib/gemini.ts` and treated as data, not instructions.

`POST /api/plan` already does this in `files/route.ts`: it reads `x-forwarded-for`, returns `{ error, details }` on bad input, and returns the plan object on success.

### Refine

```
RefineChat (current plan + instruction)
  -> POST /api/refine
    -> rateLimit(ip)
    -> body schema:
         plan: PlanSchema
         instruction: z.string().trim().min(1).max(300)
    -> refinePlan(plan, instruction)
         -> Gemini, instruction wrapped in <instruction>
         -> PlanSchema.parse, one retry
    -> 200 updated plan
  -> replace the plan on screen
```

The refine route follows `files/route.ts`: same status codes (429, 400, 502), same error messages, `refinePlan` instead of `generatePlan`.

Checklist ticks are kept locally. After a refine, ticks are reapplied when the vendor type and checklist text still match. New or rewritten items start unchecked.

### Save and export

Both use the plan already validated by Zod. They do not call Gemini.

```
Save     -> localStorage (input + plan + ticks + id + savedAt)
Open     -> hydrate form, plan, and ticks
Print    -> window.print() with a print stylesheet; no server call and no PDF library
```

## API contracts

**`POST /api/plan`**

Request: `EventInputSchema` from `files/schema.ts`.

Response: `Plan` (`summary`, `budget`, `timeline`, `vendors`, `ideas`).

**`POST /api/refine`**

Request:

```ts
{
  plan: PlanSchema,
  instruction: z.string().trim().min(1).max(300)
}
```

Response: a full `Plan`. The model is told to apply the instruction and keep the same JSON shape.

## Test plan

Run `npm run lint && npm run test` before finishing each feature. Add or update tests with the feature.

| Test                    | What it proves                                                                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema.test.ts`        | Valid wedding input passes. Guest count `0`, budget `0`, empty city, and a 501-character preference fail. A plan whose categories miss the total by more than 2% fails. A plan inside 2% passes. Missing vendors or an empty ideas list fails. |
| `budget.test.ts`        | Percent and total helpers used by the chart match the category amounts.                                                                                                                                                                        |
| `countdown.test.ts`     | `YYYY-MM-DD` is read as a local calendar date. Today is 0. A past date stays 0. A future date counts whole local days.                                                                                                                         |
| `rate-limit.test.ts`    | 10 calls succeed, the 11th returns false, and an old timestamp outside the window is allowed again.                                                                                                                                            |
| `saved-plans.test.ts`   | Save, list, load, and delete round-trip. Corrupt JSON in storage returns an empty list instead of throwing.                                                                                                                                    |
| `e2e/plan-flow.spec.ts` | Fill the form, mock `/api/plan`, see budget, timeline, vendors, and ideas. Check a vendor item. Send a refine instruction against a mocked `/api/refine`. Save, reload, and see the plan again.                                                |

Playwright mocks Gemini. Unit tests do not call the network. One manual check against a real key before deploy: a small birthday in one city, then “make it cheaper”.

## Accessibility plan

From `.cursorrules`, applied to this UI:

- Every input has a visible label. Event type, date, guests, budget, city, preferences, and the chat box are labelled. Errors are tied to the field with `aria-describedby`.
- Keyboard: the form, vendor checkboxes, chat, save, open, delete, and print controls are reachable and operable without a pointer. Visible focus rings.
- Contrast meets WCAG AA for text, chart labels, and checkbox states. Do not rely on color alone for budget categories; the table repeats the name and amount.
- `aria-live="polite"` on the plan region when a plan or refine result arrives, and on the loading status.
- Loading uses a text status (“Creating your plan…” / “Updating your plan…”), not a spinner alone.
- Charts have a text alternative (the budget table) and a short `aria-label`.
- Vendor questions are in a list, not only inside a tooltip.
- The printed page has the same information as the screen, in a heading outline (summary, budget, timeline, vendors, ideas). The print stylesheet hides controls that are not part of the plan.

## Security plan

- `GEMINI_API_KEY` is read only in `lib/gemini.ts` on the server. It is never prefixed with `NEXT_PUBLIC_` and never sent to the client.
- Gemini is called only from `app/api/plan` and `app/api/refine`.
- Both routes validate the body with Zod before calling Gemini. Both rate limit by `x-forwarded-for` (fallback `"local"`).
- The limiter in `lib/rate-limit.ts` keeps hits in an in-memory `Map`. Counts are per server instance: a restart clears them, and two instances do not share one limit. That matches the hackathon note in `files/rate-limit.ts`. It is not a global cap across a multi-instance deploy.
- Model output is parsed as JSON and must pass `PlanSchema` before it is returned. A failed parse retries once, then the route returns 502 with a generic message. Details stay in server logs.
- User text is delimited: preferences in `<preferences>`, refine text in `<instruction>`. The system prompt says that text is data, not instructions.
- The UI renders AI strings as React text. No `dangerouslySetInnerHTML`.
- Request size is bounded by the schema (preference length, instruction length, guest and budget caps, array minimums).
- Saved plans stay in the browser. Nothing in localStorage is sent except the current plan when the user explicitly refines.
- Errors returned to the client are the fixed strings already in `files/route.ts` (“Too many requests…”, “Invalid input”, “Could not generate a plan…”). Stack traces are not included.

## Build order

Each step is one reviewable change. Stop after each step.

1. **App shell.** Next.js, TypeScript strict, Tailwind, shadcn, Vitest, Playwright. Scripts: `dev`, `lint`, `test`, `test:e2e`. Copy `files/.cursorrules` and `files/.env.example` to the repo root. Do not call Gemini yet.
2. **Move schema and rate limit.** Place `files/schema.ts` and `files/rate-limit.ts` in `lib/`. Add schema and rate-limit tests.
3. **Move Gemini helper.** Place `files/gemini.ts` in `lib/`. Keep the key server-only. No route yet.
4. **`POST /api/plan`.** Place `files/route.ts` at `app/api/plan/route.ts`. Confirm 400, 429, and 502 behavior against the existing handler.
5. **`POST /api/refine`.** New route, same control flow as plan. Body is `{ plan: PlanSchema, instruction }` with instruction trimmed, min 1, max 300. Call `refinePlan(plan, instruction)`.
6. **Remove `files/`.** Move `files/README.md`, `files/PROMPTS.md`, and `files/LINKEDIN_POST.md` to the repo root (`README.md` replaces the one-line root file). `.cursorrules`, `.env.example`, `lib/schema.ts`, `lib/gemini.ts`, `lib/rate-limit.ts`, and `app/api/plan/route.ts` are already in place from earlier steps, and the refine hint has been used. Then delete the `files/` folder.
7. **Event form.** Controlled fields matching `EventInputSchema`. Date input is `YYYY-MM-DD`. Client-side validation with the same schema. Loading and error states. Submit calls `/api/plan`.
8. **Plan layout.** Summary plus empty states for a missing plan. Compose child sections without putting all markup in one file.
9. **Budget table and chart.** Read `plan.budget`. Table is the accessible source; chart mirrors it.
10. **Countdown and timeline.** `lib/countdown.ts` parses `YYYY-MM-DD` as a local date and clamps at 0. Cover that in `countdown.test.ts`. Timeline comes from `plan.timeline`.
11. **Vendors.** Checklist checkboxes and questions. Tick state in React.
12. **Ideas.** Four lists: themes, menu, activities, decor.
13. **Chat.** Instruction field, submit to `/api/refine`, replace the plan, keep matching ticks, show loading and error in a live region.
14. **Saved plans.** `localStorage` helper plus list, open, and delete. Persist ticks. No database.
15. **Print.** Print stylesheet and a button that calls `window.print()`. No PDF library.
16. **Playwright.** One mocked flow: generate, check a vendor, refine, save, reload.
17. **Prompt log.** Update `PROMPTS.md` when a prompt in `lib/gemini.ts` changes.

## Out of scope for this plan

Accounts, a database, a PDF library, payments, real vendor booking, email, and multi-user sharing. Phase 2 adds previews and sourced links. It does not add booking or checkout.

## Phase 2: live recommendations

Checked on 24 Oct 2026 against `@google/genai` 2.31.0 (`node_modules/@google/genai/dist/genai.d.ts`) and the Gemini API docs.

The SDK puts `tools` (including `googleSearch`) and `responseMimeType` / `responseJsonSchema` on the same `GenerateContentConfig`. A grounded reply exposes sources on `candidates[].groundingMetadata.groundingChunks[].web` (`uri`, `title`). `GroundingChunkWeb.domain` is marked unsupported on the Gemini API, so the visible domain is parsed from the URI. `searchEntryPoint.renderedContent` is HTML and is never rendered.

Google’s structured-output guide says combining JSON mode with built-in tools, including Google Search, is a preview and only for Gemini 3 and Gemini 4 models. This app’s text model is `gemini-2.5-flash`. An earlier silent failure (grounding dropped whenever JSON was requested, with no error) was reported fixed in October 2026, but that does not cover `gemini-2.5-flash`. Phase 2 therefore keeps two calls. The second call also cannot be trusted to write URLs: requirement 3 says links come only from grounding metadata.

Image generation uses `models.generateContent`, not `generateImages`. `GenerateContentConfig.responseModalities` and `imageConfig` are on the installed types, and image bytes come back as `Part.inlineData` (base64 `data` plus `mimeType`). Default image model is `GEMINI_IMAGE_MODEL` or `gemini-2.5-flash-image`, which the Gemini API model page still lists and which matches this app’s 2.5 family. The image guide recommends newer Nano Banana models for new work. If that default is rejected by the key, change the env var. Do not hard-code a second model in the route.

### Decisions

1. **New event fields** extend `EventInputSchema`. `eventType` gains `workshop`, `corporate`, and `other`. `eventName` is optional, trimmed, max 80 (`"Trinket tray painting workshop"`). `decorStyle` is optional, trimmed, max 60 (`"pastel boho"`). Both default to `""` so saved plans from Phase 1 still parse. The system prompt names all six event types and treats `<eventName>` and `<decorStyle>` as data, the same way it treats `<preferences>`. Update `PROMPTS.md` when that prompt changes.
2. **Decor images** are `POST /api/decor-image`. The server builds the image prompt from event type, event name, decor style, and `plan.ideas.decor`. The client does not send a free-form prompt. The route calls the image model with `responseModalities: ["IMAGE"]` and `imageConfig.aspectRatio: "1:1"`. Body field `count` is an integer from 1 to 2 and defaults to 1. The UI asks for one image. A second image is a separate user action, still inside that max. Calls for the two images run in parallel. One success is a 200 with the images that came back. Zero images is 502. Response: `{ prompt, images: [{ mimeType, data }] }`. The picture is labelled **AI concept preview**, including the image `alt`.
3. **Decor image rate limit** is tighter than plan and refine: `rateLimit(\`${ip}:decor-image\`, 2)`so it is 2 requests per minute per IP and does not share the counter with the other routes.`rateLimit` already accepts a limit. Shopping and venues stay on the existing 10 per minute, with their own key suffixes so one feature cannot lock out the others.
4. **Shopping** is `POST /api/shopping`. Input is the city and the decor ideas. The grounded call asks where to buy those items in that city or online in India. **Venues** is `POST /api/venues`. Input is city, event type, guest count, and budget. The grounded call asks for venues, halls, studios, and hotels in that city.
5. **Two steps for shopping and venues.** Step 1: `generateContent` with `tools: [{ googleSearch: {} }]`, no `responseMimeType`, prose only. Read `response.candidates[0].groundingMetadata`. Keep `web.uri` values that parse as `http:` or `https:`. Ignore `searchEntryPoint`. If that list is empty, return 200 with an empty list (the tab shows its empty state), not a model-written link. Step 2: a second `generateContent` with no tools, `responseMimeType: "application/json"`, and a Zod schema passed through `responseJsonSchema`. The prompt contains the prose and the allowed URLs as a numbered list inside `<sources>`. The model returns a `sourceIndex` into that list. It does not return a URL. The server maps the index to the grounding URI. An index that is missing or out of range drops that item. Then Zod parses the server-built object. One retry on invalid JSON, then 502.
6. **Shopping item:** `name` (max 120), `store` (max 120), `priceInr` (positive number, INR), `sourceIndex`. At most 8 items. **Venue:** `name` (max 120), `whyItFits` (max 300), `priceRange` (max 80, a short range such as “₹40,000–₹80,000”), `address` (max 200), `sourceIndex`. At most 8 venues.
7. **Links.** A shared helper accepts only `http:` and `https:` URLs that are in the grounding set for that response. It rejects `javascript:`, `data:`, and any URL the model wrote that is not in that set. The UI renders the name as React text, the anchor with `target="_blank"` and `rel="noopener noreferrer"`, and the hostname from `new URL(uri).hostname` beside the link. No `dangerouslySetInnerHTML`. The redirect hosts Google returns inside `groundingChunks` (often `vertexaisearch.cloud.google.com`) are the link. Do not rewrite them into a publisher URL the metadata did not give us. The chunk `title` can be shown as the source name when it is present.
8. **Honesty copy, exact:** prices and price ranges are followed by “approx., check on site”. The image caption is “AI concept preview”. Each shopping row and venue shows its source hostname.
9. **UI.** After a new plan or a successful refine, the page calls the three routes in parallel. Tabs: Plan, Decor Preview, Shop Decor, Venues & Stay. Use a `tablist` with roving tabindex, the same pattern as the ideas tabs. One `h1` remains “Toran”. Tab buttons are not headings. The plan’s existing `h2` stays inside the Plan tab. Each tab owns its loading text, error text, and empty text, in its own `aria-live="polite"` region. A failure or empty list in one tab leaves the others in place.
10. **Saved plans** gain optional `imagePrompt` (the server prompt, max 2000) and optional `recommendations` (`shopping` and `venues` results, links included, images excluded). Phase 1 saves without those fields still load. localStorage never stores the base64 image. Opening a save restores shopping and venues and shows the prompt. Decor Preview shows “Preview is not stored. Generate it again.” and does not call the image route until the person asks. A new generate, or a refine that replaces the plan, clears recommendations and fetches all three routes again.
11. **Route shape** matches plan and refine: Zod on the body, rate limit, 400 “Invalid input”, 429 “Too many requests. Please wait a minute.”, 502 “Could not generate a plan. Please try again.”, `export const maxDuration = 60`, and `console.error` only on the server. The key stays in `lib/gemini.ts`. New Gemini calls live in that file and are invoked only from the three new routes.

### API contracts

**`POST /api/decor-image`**

```ts
{
  eventType: EventInputSchema.shape.eventType,
  eventName: z.string().trim().max(80).default(""),
  decorStyle: z.string().trim().max(60).default(""),
  decor: z.array(z.string().trim().min(1).max(200)).min(1).max(12),
  count: z.number().int().min(1).max(2).default(1),
}
```

Response: `{ prompt: string, images: { mimeType: string, data: string }[] }`. `images.length` is 1 or 2.

**`POST /api/shopping`**

```ts
{
  city: z.string().trim().min(1).max(80),
  decor: z.array(z.string().trim().min(1).max(200)).min(1).max(12),
}
```

Response: `{ items: { name, store, priceInr, link, source }[] }`. `link` is the grounding URI. `source` is the hostname.

**`POST /api/venues`**

```ts
{
  city: z.string().trim().min(1).max(80),
  eventType: EventInputSchema.shape.eventType,
  guestCount: z.number().int().min(1).max(5000),
  budget: z.number().positive().max(100_000_000),
}
```

Response: `{ venues: { name, whyItFits, priceRange, address, link, source }[] }`.

### Tests

| Test                    | What it proves                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema.test.ts`        | `workshop`, `corporate`, and `other` pass. A wedding body with no `eventName` or `decorStyle` still passes. `eventName` of 81 characters fails. `decorStyle` of 61 characters fails.                                                                                                                                                                                                   |
| `links.test.ts`         | `https` in the grounding set is kept. `http` in the set is kept. `javascript:`, `data:`, and an `https` URL that is not in the set are dropped. The displayed domain is the URI hostname.                                                                                                                                                                                              |
| `e2e/plan-flow.spec.ts` | After the mocked plan, the three new routes are mocked. Plan, Decor Preview, Shop Decor, and Venues & Stay each render. The preview caption is “AI concept preview”. A price row includes “approx., check on site”. A row whose link was not in the fixture sources is absent. One mocked route returns 502 and that tab shows its error while the other two still show their results. |

Playwright keeps mocking Gemini. Unit tests do not call the network.

### Phase 2 build order

Each step is one reviewable change. Stop after each step. Phase 1 steps 1–17 stay as they are.

18. **Event fields.** Extend `EventInputSchema`, the form (labelled optional event name and decor style), the system prompt, and `PROMPTS.md`. Schema tests for the new enum values and the two length caps. No new routes.
19. **Link helper.** `lib/links.ts` plus `tests/links.test.ts`. No route yet.
20. **`POST /api/decor-image`.** Prompt builder and image call in `lib/gemini.ts`. Route validates the body, uses the 2/minute key, and returns prompt plus base64 images. `GEMINI_IMAGE_MODEL` in `.env.example`. `maxDuration = 60`.
21. **`POST /api/shopping`.** Two-step grounded call, index-to-URI mapping, Zod, existing 10/minute limit on its own key.
22. **`POST /api/venues`.** Same two-step pattern as shopping.
23. **Tabs.** After a new plan or refine, call the three routes in parallel. Independent loading, error, and empty states. Honesty copy and safe anchors.
24. **Saved recommendations.** Persist `imagePrompt` and `recommendations`, never the image bytes. Opening a save restores lists and leaves the preview empty until the person generates it again. Update `saved-plans.test.ts`.
25. **Playwright.** Extend the mocked flow for the three tabs, the honesty lines, a rejected link, and one isolated 502.
26. **Prompt log.** `PROMPTS.md` entries for the image prompt and the two-step shopping and venue prompts, including why links are indexes into grounding metadata.
