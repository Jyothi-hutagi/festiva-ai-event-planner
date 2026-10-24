# Festiva visual design

Revised plan for the redesign. No application code in this step. D1–D6 implement this file one step at a time.

The page should feel like an invitation on a table, with the planner written on the same sheet. Light is the default. A dark theme is a manual "Dark room" control, not a neon invert.

## Critique and what changed

A straight restyle of the current page in these colors would still look like a template:

- A three-step wizard with equal fields and a progress bar is a signup flow with a new palette.
- A left rail of matching pills is the current tab row turned sideways.
- Four idea lists in a 2×2 grid are the identical card grid this plan forbids.
- A sticky bar of icon buttons is an app toolbar.
- A pink gradient behind the event name, plus petals on every view, is a wedding template.
- `#D6336C` on `#FBF7FF` is 4.36:1. It fails WCAG AA for body text. The same pink on night plum `#1A1024` is 3.44:1, so dark mode cannot use it for text either.
- White text on marigold `#FFB627` is 1.75:1. Marigold cannot be a text color or a button fill with white type.
- A teal focus ring on a pink button is 1.12:1. The ring has to be plum in the light theme and lilac in the dark theme.
- Progress rings on the budget, the timeline, and the vendors would repeat one dashboard motif. The ring belongs only on a vendor, where it is a real count.

Revisions, now the spec below:

- The event name is plum ink. Pink is the primary button fill and a 3px underline on the selected tab.
- Marigold is a 2px hairline, the completed part of the step thread, and the timeline's current dot. It also colors flags in the toran. It is never a background wash.
- The form, the timeline, and the activities list share one motif: a thread with dots. Everything else uses a different shape.
- The single memorable element is the live invitation. The toran only frames the page.
- Idea groups are four different treatments. The decor list links to the Decor Preview tab, which is the only place the preview is generated.
- The sticky bar is text actions in Hind. It appears only after the invitation scrolls away. On a phone, extra actions sit inside More.
- Petals play once, when a new plan arrives.
- Dark mode keeps the brand pink for the button only. Text pink on the dark background is `#FFB3C9`.

## Assumptions to confirm

- Chrome (buttons, steps, tabs, errors) stays English. Hindi applies to the generated plan, which is why both fonts include Devanagari.
- One page, one route. The intro, with the form and the live invitation, is replaced by the result. "Edit details" returns to the form with the values kept. Saved plans stay on the intro. The Save button is on the result, not the intro.
- The dark theme starts in light. A blocking script in `<head>` sets `data-theme` on `<html>` before first paint. "Dark room" only toggles that attribute and writes `festiva-theme`.

## Theme before paint

`<html>` has `suppressHydrationWarning`. The server renders `data-theme="light"`. A blocking script is the first thing in `<head>`, before the stylesheet:

```html
<script>
  try {
    var saved = localStorage.getItem("festiva-theme");
    document.documentElement.setAttribute(
      "data-theme",
      saved === "dark" ? "dark" : "light",
    );
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
</script>
```

Dark tokens apply from `html[data-theme="dark"]`. There is no second class. "Dark room" sets the attribute to `dark` or `light` and writes `festiva-theme` inside `try/catch`. It does not read storage. A blocked `localStorage` leaves the attribute at `light` and the control still toggles the attribute for the current view.

## Color

Measured with the WCAG relative-luminance formula. Body text needs 4.5:1. Large text (24px, or 18.7px bold) and button labels at 16px need 4.5:1 as well, because 16px is below the large-text threshold. Non-text boundaries and the focus ring need 3:1 against the adjacent color.

### Light (default)

| Role           | Hex       | Used for                                    |
| -------------- | --------- | ------------------------------------------- |
| Lilac table    | `#FBF7FF` | Page background                             |
| Paper          | `#FFFFFF` | Invitation sheet and budget panel           |
| Plum ink       | `#2A1B3D` | Body, headings, focus ring                  |
| Ink soft       | `#5C4D73` | Secondary text, hints, placeholders         |
| Bougainvillea  | `#D6336C` | Primary button fill, selected-tab underline |
| Deep pink      | `#9E1D4E` | Error text                                  |
| Marigold       | `#FFB627` | Hairline, completed step segments, timeline dot, toran |
| Peacock        | `#0B7A75` | Progress arc, success text                  |
| Control border | `#9A86B0` | Input and button outlines                   |
| Sheet edge     | `#7D6894` | The invitation's outer rule                 |

Tints, not additional hues: paper white, pale fill `#F3E6FF` for a quiet block that contains no inputs, and the night colors in the dark theme. Form fields sit on paper white `#FFFFFF`. They are never placed on the pale fill `#F3E6FF`, and they are not placed on the lilac table. The control border `#9A86B0` on paper white is 3.28:1. No gradient.

### Dark

| Role          | Hex       | Used for                                                          |
| ------------- | --------- | ----------------------------------------------------------------- |
| Night         | `#1A1024` | Page background                                                   |
| Night paper   | `#241533` | Form sheet and invitation. Fields sit on this, not on a pale fill |
| Lilac text    | `#FBF7FF` | Body and headings                                                 |
| Lilac soft    | `#C9B8DC` | Secondary text                                                    |
| Text pink     | `#FFB3C9` | Large accent only, when a pink word is required                   |
| Button pink   | `#D6336C` | Primary button fill, white label                                  |
| Marigold      | `#FFB627` | Hairline and current dot, with night text if any label sits on it |
| Peacock light | `#5ED1C6` | Progress arc and success text                                     |
| Border        | `#A894BC` | Inputs and the sheet edge                                         |
| Focus         | `#FBF7FF` | Focus ring                                                        |

### Contrast ratios

| Pair                   | Ratio   | Verdict                                                 |
| ---------------------- | ------- | ------------------------------------------------------- |
| `#2A1B3D` on `#FBF7FF` | 15.01:1 | Body and headings, light                                |
| `#2A1B3D` on `#FFFFFF` | 15.88:1 | Text on the paper sheet                                 |
| `#2A1B3D` on `#F3E6FF` | 13.29:1 | Text on the pale fill                                   |
| `#5C4D73` on `#FBF7FF` | 7.18:1  | Secondary text, light                                   |
| `#FFFFFF` on `#D6336C` | 4.62:1  | Primary button label                                    |
| `#D6336C` on `#FBF7FF` | 4.36:1  | Fails body text. Allowed as a 3px underline (above 3:1) |
| `#9E1D4E` on `#FBF7FF` | 7.25:1  | Error text, light                                       |
| `#2A1B3D` on `#FFB627` | 9.05:1  | The only legal text on marigold                         |
| `#FFFFFF` on `#FFB627` | 1.75:1  | Do not use                                              |
| `#0B7A75` on `#FBF7FF` | 4.90:1  | Success text, light                                     |
| `#FFFFFF` on `#0B7A75` | 5.18:1  | A teal button, if one is ever needed                    |
| `#9A86B0` on `#FBF7FF` | 3.10:1  | Border on the lilac table. Fields do not sit here       |
| `#9A86B0` on `#FFFFFF` | 3.28:1  | Input border on the paper sheet                         |
| `#7D6894` on `#FBF7FF` | 4.64:1  | Invitation rule                                         |
| `#2A1B3D` on `#D6336C` | 3.44:1  | Plum focus ring where it touches the pink button        |
| `#FBF7FF` on `#1A1024` | 17.36:1 | Body, dark                                              |
| `#FBF7FF` on `#241533` | 16.14:1 | Text on night paper                                     |
| `#C9B8DC` on `#1A1024` | 9.95:1  | Secondary text, dark                                    |
| `#FFB3C9` on `#1A1024` | 10.97:1 | Accent text, dark                                       |
| `#D6336C` on `#1A1024` | 3.44:1  | Fails as text. Button fill only                         |
| `#FFB627` on `#1A1024` | 10.47:1 | Marigold mark on night                                  |
| `#1A1024` on `#FFB627` | 10.47:1 | Text sitting on a marigold mark                         |
| `#5ED1C6` on `#1A1024` | 9.98:1  | Success and progress, dark                              |
| `#A894BC` on `#1A1024` | 6.67:1  | Input border, dark                                      |
| `#FFB3C9` on `#1A1024` | 10.97:1 | Error text, dark                                        |

Pressed primary button: `#BE275C` with white text at 5.78:1. The hover state uses that darker fill. Do not lighten the pink.

Chart fills, in order, repeated only after the sixth category. Names live in the legend and the table. No label is drawn inside a slice. Every bar has a 1px outline so the bar meets 3:1 against the paper behind it: plum `#2A1B3D` in light (15.88:1 on `#FFFFFF`) and lilac `#FBF7FF` in dark (16.14:1 on `#241533`). The category fill can stay below 3:1. The outline is the boundary.

Light fills: `#D6336C`, `#0B7A75`, `#FFB627`, `#2A1B3D`, `#7D6894`, `#9E1D4E`.

Dark fills: `#FF8AAB`, `#5ED1C6`, `#FFB627`, `#E7D8F5`, `#A894BC`, `#FFB3C9`.

## Type

Load with `next/font/google`. Drop Geist from the layout when D1 lands.

- Baloo 2, weights 600 and 700, subsets `latin` and `devanagari`, variable `--font-baloo`. Headings and the big numbers only.
- Hind, weights 400, 500, and 600, subsets `latin` and `devanagari`, variable `--font-hind`. Body, labels, buttons, tabs, and tables.

| Style           | Font    | Size                   | Weight | Line height | Measure                     |
| --------------- | ------- | ---------------------- | ------ | ----------- | --------------------------- |
| Hero            | Baloo 2 | 56px, 34px at 375px    | 700    | 1.15        | 14ch, then wrap             |
| Invitation name | Baloo 2 | 40px, 28px under 768px | 700    | 1.15        | 18ch, then wrap             |
| Section title   | Baloo 2 | 24px                   | 600    | 1.25        | the column                  |
| Step title      | Baloo 2 | 22px                   | 600    | 1.3         | the form                    |
| Big number      | Baloo 2 | 32px                   | 700    | 1.1         | the figure                  |
| Body            | Hind    | 17px                   | 400    | 1.6         | 60ch                        |
| UI label        | Hind    | 16px                   | 500    | 1.4         | the control                 |
| Button          | Hind    | 16px                   | 600    | 1.2         | the button, min-height 44px |
| Note            | Hind    | 14px                   | 400    | 1.45        | 60ch                        |

60ch stays under 70 characters. Paragraphs use that measure. The invitation name wraps inside 18ch so a long Hindi title does not form one line across the sheet.

Buttons and tabs are Hind. Baloo 2 at button size looks like a display face pretending to be a control.

## Layout

Still one route. The intro and the result are two views of `app/page.tsx`. The result view keeps the plan, the refine chat, saved-plan actions, and the Phase 2 tabs that already exist: Decor Preview, Shop Decor, Venues & Stay. Budget, Timeline, Vendors, and Ideas leave the single Plan panel and become their own tabs. "Plan" keeps the summary and the refine chat.

Print hides the form, the tab rail, the sticky bar, the petals, the chat, and the "Generate preview" button. It shows the invitation and every section on white, with plum text, whichever tab is active: summary, budget, timeline, vendors, ideas, shop, and venues. Each of those panels carries `data-print-section`, including the ones hidden on screen. The decor image stays out of print.

### 1. Intro v2

The single memorable element is the live invitation: the result header, empty, then filling in as the person types. The toran frames the page and plays once. It does not compete with the sheet.

Desktop, 1280px. A toran runs across the full width: nine small triangular flags on a thin string, in pink `#D6336C`, marigold `#FFB627`, teal `#0B7A75`, and plum `#2A1B3D`. It is one inline SVG, under 2KB, `aria-hidden`. On first load the flags drop in over 0.6s, staggered, once. They do not replay.

```
v v v v v v v v v          (toran, full width)

Festiva (wordmark)                              Dark room

Plan the celebration,
not the spreadsheet.
Budget, timeline, vendors, decor ideas and where to
buy, built for your date and city.

+-- form, paper sheet ----------------------+  +-- live invitation --+
| Start from an example                     |  | Your event name      |
| [ Trinket tray painting workshop ]        |  | Pick a date          |
|   12 guests, ₹15,000                      |  | Your city            |
| [ Birthday party ]                        |  +----------------------+
|   30 guests, ₹40,000                      |  Your invitation fills
| [ Small wedding ]                         |  in as you type.
|   100 guests, ₹3,00,000                   |
| [ Community diwali meetup ]               |
|   80 guests, ₹50,000                      |
|                                           |
|  ●———○———○                                |
|  What    Who and where    Vibe            |
|                                           |
|  What                                     |
|  Event type   [ Wedding              v ]  |
|  Date         [ 2026-12-04             ]  |
|                         Back        Next  |
+-------------------------------------------+

Your saved plans
  Wedding in Pune
  or, when empty: Nothing saved yet. Create a plan
  and it will be kept on this device.
```

The wordmark is "Festiva" in Baloo 2. It is not a heading. "Dark room" stays at the right of that row.

The page `h1` is the hero, "Plan the celebration, not the spreadsheet.", Baloo 2, 56px on desktop and 34px at 375px, at most 14ch per line. Under it, one Hind sentence at 17px: "Budget, timeline, vendors, decor ideas and where to buy, built for your date and city."

Below the hero, two columns. The left column is the form on a paper sheet: 12px radius, the one shadow, and a 2px marigold hairline along the top edge. Inside it, "Start from an example", then four chips. Each chip is two lines: the title, then the guests and the budget from `formatINR` (`12 guests, ₹15,000` and the same pattern for the other three). Then the step thread: a line connecting three dots. The current step is a filled dot. The others are rings. A segment already completed is marigold. Then the step itself.

The right column is the live invitation, the same component as the result header, in its empty state. Placeholders are ink-soft: "Your event name", "Pick a date", "Your city". It fills as the person types: the event name, or "<Type> in <City>" when the name is still empty, then the date, the guest count, the countdown, and the budget from `formatINR`. When a value changes, that value cross-fades over 150ms. The caption under the sheet is "Your invitation fills in as you type."

Under both columns, "Your saved plans" is a list, or the sentence "Nothing saved yet. Create a plan and it will be kept on this device." The Save button is not on the intro.

At 375px the order is one column: the hero, then the live invitation in a compact sheet, then the form, then saved plans. The toran and the wordmark row stay above the hero.

```
v v v v v v v v v

Festiva (wordmark)           Dark room

Plan the
celebration,
not the
spreadsheet.
Budget, timeline, vendors,
decor ideas and where to buy,
built for your date and city.

+---------------------------+
| Your event name           |
| Pick a date               |
| Your city                 |
+---------------------------+
Your invitation fills in as you type.

+---------------------------+
| Start from an example     |
| [ chip, two lines ]       |
| ●———○———○                 |
| What                      |
+---------------------------+

Your saved plans
Nothing saved yet. Create a plan and it will
be kept on this device.
```

Step 1 is What: event type, event name when the type is workshop or other, date. Step 2 is Who and where: guest count, budget, city. Step 3 is Vibe: decor style, preferences, language, then the button "Create my plan". Back is hidden on step 1. Next does not submit. Each step validates only its own fields with the existing schema. The last step runs the full schema.

The step title is an `h2`. Visually hidden text before the visible title reads "Step 1 of 3:", "Step 2 of 3:", or "Step 3 of 3:", so the heading's accessible name is "Step 1 of 3: What" (and the same pattern for the other steps). On a step change, focus moves to that heading (`tabIndex={-1}`) so a screen reader announces it. That heading uses `outline: none`, so the programmatic focus draws no ring. The thread of three dots is `aria-hidden`.

A quick-start chip fills every field and keeps a city and date already typed. It then jumps to the first step that still has a missing or invalid required field, or to Vibe when every required field is valid. It never submits.

### 2. Result, desktop (1280px)

```
Festiva (wordmark)                               Dark room

+------------------------------------------------+
|  Trinket tray painting workshop                |
|  4 Dec 2026  ·  Pune  ·  12 guests  ·  English |
|  41 days                                       |
|  ₹15,000                          ___________  |
|  (marigold hairline under the name)            |
+------------------------------------------------+

(after this sheet scrolls away, two lines)

41 days · 2 of 8 done
[ Edit details ] [ Save this plan ] [ Copy text ] [ Share on WhatsApp ] [ Add to calendar ] [ Print plan ]

Plan            |  summary, then the refine chat
Budget          |
Timeline        |
Vendors         |
Ideas           |
Decor Preview   |
Shop Decor      |
Venues & Stay   |
```

The rail is a column of Hind text, 44px tall, with a plum dot on the selected row and a pink underline. Arrow keys move the tab, the same roving tabindex the page uses now. The rail sticks under the summary bar. There is no icon in the rail.

The summary bar is `position: sticky` and is hidden until the invitation has scrolled out. On desktop every action is visible, and the closed bar is at most two lines. Actions are real buttons with those labels. The WhatsApp action stays an anchor with `rel="noopener noreferrer"`.

### 3. Result, 375px

```
Festiva (wordmark)               Dark room

+---------------------------+
| Trinket tray painting     |
| workshop                  |
| 4 Dec 2026 · Pune         |
| 12 guests · English       |
| 41 days          ₹15,000  |
+---------------------------+

(sticky, two lines, after scroll)
41 days · 2 of 8 done
[ Save this plan ] [ Print plan ] [ More ]

< Plan  Budget  Timeline  Vendors  Ideas  Decor  Shop  Venues >
(horizontal scroll, no page-level horizontal scroll)
```

The page itself does not scroll sideways. The tab list is the only horizontal scroller, with `overflow-x: auto` on that element. Tap targets are at least 44px. The closed sticky bar is two lines: the countdown with "N of M done", then "Save this plan", "Print plan", and a native `<details>` whose summary is "More". Inside More: "Edit details", "Copy text", "Share on WhatsApp", and "Add to calendar". The main column has padding equal to the closed bar so the last section is not covered.

## Tests that change when the tabs split

Vitest does not query tabs. The updates are in `e2e/plan-flow.spec.ts`.

`creates, refines, undoes, and restores a saved plan`:

- ArrowRight from Plan currently expects Decor Preview. The rail order is Plan, Budget, Timeline, Vendors, Ideas, Decor Preview, Shop Decor, Venues & Stay, so ArrowRight selects Budget and ArrowLeft returns to Plan. Reaching Decor Preview takes further arrows or a click.
- The budget table, "Book the venue", "Confirm the menu", "Welcome guests", and the Caterer, Photographer, and Decorator headings are read while Plan is selected. Select Budget, Timeline, and Vendors first.
- Themes, Menu, Activities, and Decor are clicked as tabs with `exact: true`, and the text is read from that tabpanel. Those four are not tabs. Open Ideas and read "Garden evening", "Thali", "Lawn games", and "Marigolds" there. "Open decor preview" selects Decor Preview. Do not match a tab named Decor.
- "Generate preview", the image "AI concept preview", and "Preview is not stored. Generate it again." stay on Decor Preview. The Ideas decor block has no generate button.
- Print is entered from Plan. Enter it from Shop Decor or Decor Preview instead, and still expect the Shop decor and Venues & Stay headings, the budget table, the timeline tasks, and the vendor names. "Generate preview" stays hidden. After returning to screen, "Marigold garland" stays hidden until Shop Decor is selected.
- D6 check: select each tab, open print preview, and confirm the summary, budget, timeline, vendors, ideas, shop, and venues all print.
- "Make it cheaper" and Undo expect the budget table and the tasting checkbox without selecting a tab. Select Budget and Vendors for those checks. The invitation stays visible on every tab. Plan-only text, including the summary, is hidden on Shop Decor.

`a venue failure leaves the shopping list in place`:

- It expects the heading "Your plan", then opens Venues & Stay and Shop Decor, then expects "Your plan" to be hidden. Expect the invitation to stay visible, and expect the summary (the plan-only text) to be hidden on Shop Decor. The venue error and "Marigold garland" stay on their own tabs.

## Components

### Invitation header

The same component on the intro and on the result. Paper sheet, radius 12px, one shadow: `0 12px 32px rgb(42 27 61 / 0.08)`. A 1px sheet-edge border and, 8px inside it, a 2px marigold hairline under the name only. On the intro, while a field is still empty, the sheet shows ink-soft placeholders: "Your event name", "Pick a date", "Your city". As the person types, those become the event name, or "<Type> in <City>" when the name is empty, then the date, the guest count, the countdown, and the budget from `formatINR`. A changed value cross-fades over 150ms. The caption "Your invitation fills in as you type." sits under the intro sheet only.

On the result the contents are, in order: event name (or "<Type> in <City>" when the name is empty), date, city, guest count, language word ("English" or "हिन्दी"), countdown, budget total. The countdown uses the existing local-date helper. The name is an `h2`. The page `h1` is the hero on the intro. "Festiva" is the wordmark, not a heading, on the intro and on the result.

### Budget

One wide panel, radius 12px, on the paper color. A bar chart, not a donut, so category length is visible without a legend color key being the only cue. Each bar is one chart color, and the category name is printed at the start of the row in plum. The table underneath repeats name, amount, percent, and notes. The footer has Total and "₹X per guest" from `perGuest` and `formatINR`. The chart is `aria-hidden` because the table is the text.

Y-axis labels stay inside the plot so they do not clip at 375px. That replaces the current clipping.

### Timeline

A vertical thread, 2px, in the control-border color. Each phase is a row: a dot, the phase text, the tasks. Dots and the numbers of the order are the sequence, so they are warranted. The nearest upcoming phase uses a marigold dot plus the Hind sentence "Next". Upcoming means the phase start (event date minus `daysBefore`) is the soonest date that is still today or later. Phases with no `daysBefore` are drawn and are never the highlighted one. If the event date is in the past, no phase is marked Next.

### Vendors

One block per vendor, stacked, with a hairline between them. No shared card chrome. A ring shows ticked ÷ total, with the text "2 of 5 done" beside it. The checklist and the questions follow. The ring track is the border color. The arc is peacock. The checkbox state is also the text, so the teal arc is not the only signal.

The overall "N of M done" count moves to the sticky bar. It is not repeated as a second bar inside the vendor tab.

### Ideas

Four treatments on one tab:

- Themes. The first theme in Baloo 2 at the section size, then the rest as a Hind list. A marigold hairline under the first line.
- Menu. A Hind list. Each item begins with the word, and a teal square sits beside it as a portion mark.
- Activities. The same dot thread as the timeline, at a smaller size, numbered.
- Decor. A plain Hind list, then a link "Open decor preview" that selects the Decor Preview tab. "Generate preview", the image, and the caption "AI concept preview" live only in that tab.

### Shop and venues

These tabs already exist. Restyle the type, color, and focus only. Keep the honesty lines "approx., check on site" and "Check availability and prices directly with the venue". Links stay "Open store" and "Open website". Do not draw them as a new card grid. A shop row is a name, a store, a price, and the link on one band separated by a hairline.

### Loading, empty, error

Loading is a static skeleton of the invitation (three plum bars on a paper sheet) and two section bars. No pulse. An `aria-live="polite"` region rotates, every 4 seconds, through "Planning your budget...", "Building your timeline...", and "Choosing vendors...". The region uses `aria-atomic="true"`.

Empty: "Nothing saved yet. Create a plan and it will be kept on this device." Shop and venues keep their current empty sentences.

Error: the existing fixed API sentences, plus a "Try again" button when the action can be repeated. The live region is `assertive` for the error.

## Motion

Three motions, and nothing else. `prefers-reduced-motion: reduce` skips all three.

1. The toran, on first load. The nine flags drop in over 0.6s, staggered, once. Reduced motion shows them already in place.
2. The invitation unfold and the petals, when a newly generated plan is shown. A refine does not replay this. Opening a saved plan does not replay it. The sheet starts at `scaleY(0.96)` with `opacity: 0` and origin at the top, then settles in 400ms. Twelve petal elements, `span`s with a border radius, in marigold and pink, fall about 120px and fade. They are `aria-hidden` and `pointer-events: none`. No image file. The toran is inline SVG in the component, not a file added to the repo. Reduced motion shows the sheet in its final state and does not render the petals.
3. The live invitation. When a value changes, that value cross-fades over 150ms. Reduced motion swaps the value with no fade.

No hover lift, no arrow, no shimmer, no animated chart.

## Rules

- No all-caps eyebrow labels. Step names are "What", "Who and where", and "Vibe".
- No arrows on buttons. The label says what happens: "Create my plan", "Back", "Next", "Edit details", "Save this plan", "Copy text", "Share on WhatsApp", "Add to calendar", "Print plan", "Try again".
- No identical card grids. The budget panel is the only large panel. Vendors are a stack. Ideas are four treatments.
- No gradient washes, no full-bleed marigold, no pattern image.
- The page `h1` is the hero, "Plan the celebration, not the spreadsheet." "Festiva" is the wordmark, not an `h1`.
- Radius scale, used by purpose: 0 for tables, chart rows, and the thread; 4px for inputs and buttons; 12px for the form sheet, the invitation, and the budget panel. No pill radius.
- One shadow, shared by the form sheet and the invitation. The dark theme drops it.
- Form fields sit on paper white in the light theme, and on night paper `#241533` in the dark theme. They are never placed on the pale fill `#F3E6FF`.
- Focus is a 2px solid ring, 2px offset, on every real control: plum `#2A1B3D` in light, lilac `#FBF7FF` in dark. It is visible on the pink button. A step heading that receives programmatic focus uses `outline: none` on `[tabindex="-1"]`, so that move draws no ring.
- Tap targets are at least 44px.
- AI text is React text. No `dangerouslySetInnerHTML`.
- No new dependencies. The budget chart stays on the Recharts wrapper already in the repo. No images added to the repo. Petals are CSS.
- Components stay under about 150 lines. The toran, the invitation, the petal moment, each tab's panel, and each form step are separate components.
