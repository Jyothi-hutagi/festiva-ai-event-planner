# Festiva: AI Celebration & Event Planner 🪔✨

An end-to-end GenAI planning assistant tailored specifically for Indian celebrations (weddings, milestone birthdays, Diwali parties, workshops, and community events) with budget allocation, countdown timelines, tickable vendor checklists, decor shopping lists, local venue discovery, and AI concept visual previews.

**Live demo:** [https://festiva-ai-event-planner.vercel.app](https://festiva-ai-event-planner.vercel.app) · **Repository:** [https://github.com/Jyothi-hutagi/festiva-ai-event-planner](https://github.com/Jyothi-hutagi/festiva-ai-event-planner)

---

## 📌 Submission Overview

### 1. Chosen Vertical
* **Event Planning & Management (Cultural & Celebrations)**
* **Persona:** Individuals, families, and community organizers planning Indian celebrations (weddings, milestone birthdays, Diwali parties, workshops) who face chaotic coordination across spreadsheets, fragmented vendor chats, and unbalanced budgets.

### 2. Approach & Logic
* **Context-Driven Synthesis:** Rather than generic checklist generation, Festiva takes cultural nuances, guest counts, target cities, and INR budgets into account to produce mathematically validated allocations.
* **Resilient Multi-Tier AI:** 
  - Uses Google Gemini 2.5 Flash for structured plan generation with strict runtime Zod validation.
  - Demand-driven lazy loading for Venues and Shopping to respect free-tier rate limits (15 RPM).
  - Multi-tier visual generation: Gemini Image model ➔ Pollinations AI free tier ➔ Curated high-resolution thematic visuals so the user experience never breaks.
* **Actionable Next Steps:** Outputs aren't just text; they are interactive (tickable vendor checklists, live budget charts, itemized shopping links, one-click WhatsApp sharing).

### 3. How the Solution Works
1. **Intake / Preset:** The user selects a 1-click cultural preset or enters event parameters (type, guest count, city, budget, vibe).
2. **AI Generation (`/api/plan`):** Gemini creates an end-to-end plan with budget math guaranteed within 2% of the total budget.
3. **Interactive Workspace:** The user navigates between 8 dedicated tabs (Budget, Timeline, Vendors, Ideas, Decor Preview, Shop Decor, Venues & Stay).
4. **Conversational Refinement (`/api/refine`):** Live chat allows instant plan updates ("make it cheaper", "pure vegetarian menu") with undo capability.
5. **Execution & Social Export:** 1-click WhatsApp text generation, Google Calendar milestone sync, and printable PDF run-of-show.

### 4. Assumptions Made
* **Currency & Geography:** Primary target is India (budgets in INR, cities like Mumbai, Delhi, Bengaluru, Udaipur).
* **Vendor Pricing Standards:** Catering typically constitutes 35–50% of an Indian celebration budget, while venue fees vary based on per-person or hall-rental models.
* **Connectivity & API Limits:** Assumes the user may run on a free Google AI Studio key; hence, graceful fallbacks and rate-limiting safeguards are active by default.

---

## 🌟 Key Features

- **⚡ 1-Click Quick-Start Presets:** Jump straight into planning with pre-configured templates (Birthday Party, Small Wedding, Community Diwali Meetup, Boho Painting Workshop) with auto-filled guest counts, budgets in INR, and target cities.
- **📊 Balanced Budget Allocation & Chart:** Automatically allocates total funds across Indian event categories (Catering, Decor, Entertainment, Venue) with mathematical guarantees that category shares match your total within 2%.
- **⏳ Countdown Timeline:** Phased milestones from 12 weeks out to the day-of, with specific action items.
- **✅ Interactive Vendor Checklist:** Live-updating checklist categorized by vendor type (Decorator, Caterer, Sound/DJ, Photographer) with essential questions to ask and real-time completion progress tracking.
- **🎨 AI Decor Preview (Free Tier Compatible):** Generates custom visual concept mood boards (floral arches, drapes, lighting themes) with multi-tier fallback support (Gemini image synthesis, Pollinations AI, and curated high-resolution cultural celebration visuals).
- **🛍️ Shop Decor with Real Pricing:** Itemized decor shopping lists with realistic prices in INR, recommended store links, and 1-click text copy.
- **🏨 Local Venues & Stay Matching:** Recommends verified venues in target Indian cities (e.g., Mumbai, Bengaluru, Udaipur, Delhi) matched to your guest count and budget share.
- **💬 Chat Refinements:** Make conversational adjustments ("make it cheaper", "add a vegetarian menu", "focus on eco-friendly decor") with full undo support.
- **📲 Social Collaboration & Exports:** 1-click WhatsApp message formatting for family & co-hosts, Google Calendar event sync, and print/PDF ready styling.

---

## 🏗️ Architecture & Flow

```
User Input / Preset
       │
       ▼
[Next.js App Router Client]
       │
       ├──► POST /api/plan ────────► Gemini 2.5 Flash ──► Zod Schema Validation ──► Interactive Dashboard
       │                                                                                  │
       ├──► POST /api/refine ──────► Gemini (History + Instruction) ──────────────► Updated Plan
       │                                                                                  │
       ├──► POST /api/decor-image ─► Gemini Image / Pollinations.ai / Curated ───► Base64 Visual Preview
       │                                                                                  │
       ├──► POST /api/shop ────────► Grounded Web Search & Pricing ──────────────► Shopping Items List
       │                                                                                  │
       └──► POST /api/venues ──────► Local City Venue Recommendation ────────────► Venues & Stay List
```

---

## 🛠️ Tech Stack & Tools

| Tool / Library | Role & Rationale |
|---|---|
| **Next.js 16 (App Router)** | Server routes keep API keys private; optimized Turbopack build |
| **React 19 & TypeScript** | Component-driven UI with strict end-to-end type safety |
| **Google Gemini API** | Structured JSON outputs for plan logic and contextual generation |
| **Pollinations.ai** | Free, zero-setup AI image synthesis fallback for decor previews |
| **Zod** | Guarantees strict runtime schema validation across all AI payloads |
| **Tailwind CSS & Lucide Icons** | Responsive, modern Indian festive aesthetic with Toran accents |
| **Next-Themes** | Clean dark/light theme support |

---

## 🔒 Security & Quality Standards

- **Server-Side API Keys:** The `GEMINI_API_KEY` is strictly server-side and never exposed to the client bundle (`NEXT_PUBLIC_` is prohibited).
- **In-Memory Rate Limiting:** Built-in rate limiting across all API endpoints (`/api/plan`, `/api/decor-image`, etc.) to prevent abuse.
- **Runtime Schema Validation:** All model outputs pass through strict Zod schemas with fallback error states before reaching the UI.
- **Hydration Safe:** Robust SSR/CSR boundary handling with `suppressHydrationWarning` and `useSyncExternalStore` for dates.
- **Accessibility:** Semantic HTML5 landmarks, ARIA labels, live announcement regions, and full keyboard navigation.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.17+ or Node.js 20+
- A Google AI Studio API key (free tier available at [aistudio.google.com](https://aistudio.google.com))

### 2. Installation
```bash
git clone https://github.com/Jyothi-hutagi/festiva-ai-event-planner.git
cd festiva-ai-event-planner
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Populate the keys in `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

> **Note:** Image generation in the **Decor Preview** tab works out-of-the-box even on free-tier Gemini keys using our integrated multi-tier fallback.

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start planning!

---

## 🧪 Testing & Verification

- **End-to-End Browser Testing:** Full test suite executed across all 8 dashboard tabs (Plan, Budget, Timeline, Vendors, Ideas, Decor Preview, Shop Decor, Venues & Stay).
- **Run Unit & Schema Tests:**
  ```bash
  npm test
  ```
- **Production Build:**
  ```bash
  npm run build
  ```

---

## 📄 License

MIT © [Jyothi-hutagi](https://github.com/Jyothi-hutagi)
