Just built Toran, an AI event planner, for #PromptWars Virtual by Hack2skill x Google for Developers.

Tell it your event type, guest count, budget and city, and it generates:

- a category-wise budget
- a countdown timeline
- vendor checklists with questions to ask
- personalized themes, menus and decor
  ...then refine it by chatting: "make it cheaper", "add a vegetarian menu".

How it works:
Next.js + Gemini API. Every AI response is validated with Zod before it reaches the UI, so it never breaks on bad output.

Tools: Cursor (agent mode + project rules), Gemini, Next.js, Vercel.
Why: structured JSON output, a server-side key for security, and fast iteration.

What changed in my prompts: started with free-form text, moved to strict JSON with a budget-must-sum rule, then added injection-safe delimiters for user preferences.

GenAI wrote the scaffolding and drafts. I designed the schema, security model and UX.

Repo: <github link> | Demo: <live link>

#BuildWithAI #PromptWars #Gemini #GenAI #Hack2skill
