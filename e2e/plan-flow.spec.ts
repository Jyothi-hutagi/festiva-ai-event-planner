import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { formatINR } from "../lib/budget";
import type { Plan } from "../lib/schema";

function fixture(name: string) {
  return JSON.parse(
    readFileSync(path.join(process.cwd(), "e2e/fixtures", name), "utf8"),
  ) as unknown;
}

const plan = fixture("plan.json") as Plan;
const shopping = fixture("shopping.json");
const venues = fixture("venues.json");
const decorImage = fixture("decor-image.json") as {
  prompt: string;
  images: { data: string }[];
};

const cheaper: Plan = {
  ...plan,
  summary: "A smaller Pune wedding for 40 guests.",
  budget: {
    total: 64000,
    categories: [
      { name: "Venue", amount: 32000, percent: 50, notes: "Garden hall" },
      { name: "Food", amount: 19200, percent: 30, notes: "Meals" },
      { name: "Decor", amount: 12800, percent: 20, notes: "Flowers" },
    ],
  },
};

async function showLoadingPlan(page: Page) {
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/plan", async (route) => {
    await gate;
    await route.fulfill({ json: plan });
  });
  await page.route("**/api/refine", async (route) => {
    await route.fulfill({ json: cheaper });
  });
  await page.route("**/api/shopping", async (route) => {
    await route.fulfill({ json: shopping });
  });
  await page.route("**/api/venues", async (route) => {
    await route.fulfill({ json: venues });
  });
  await page.route("**/api/decor-image", async (route) => {
    decorCalls += 1;
    await route.fulfill({ json: decorImage });
  });
  return release;
}

let decorCalls = 0;

async function fillWedding(page: Page) {
  await page.goto("/");
  await page.locator("#event-date").fill("2026-12-04");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.locator("#guest-count").fill("40");
  await page.locator("#budget").fill("80000");
  await page.locator("#city").fill("Pune");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.locator("#preferences").fill("garden party");
}

test("creates, refines, undoes, and restores a saved plan", async ({
  page,
}) => {
  test.setTimeout(60_000);
  decorCalls = 0;
  const releasePlan = await showLoadingPlan(page);
  await fillWedding(page);

  const loading = page
    .getByRole("button", { name: "Creating your plan..." })
    .waitFor();
  const submitted = page
    .getByRole("button", { name: "Create my plan" })
    .click();
  await loading;
  releasePlan();
  await submitted;

  await expect(page.getByRole("heading", { name: "Your plan" })).toBeVisible();
  await expect(page.getByText(plan.summary)).toBeVisible();
  const planTab = page.getByRole("tab", { name: "Plan", exact: true });
  await planTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Budget", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(planTab).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Budget", exact: true }).click();
  await expect(
    page.getByRole("table", { name: "Budget by category" }),
  ).toContainText(formatINR(80000));
  await page.getByRole("tab", { name: "Timeline", exact: true }).click();
  await expect(page.getByText("Book the venue")).toBeVisible();
  await expect(page.getByText("Confirm the menu")).toBeVisible();
  await expect(page.getByText("Welcome guests")).toBeVisible();
  await page.getByRole("tab", { name: "Vendors", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Caterer" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Photographer" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Decorator" })).toBeVisible();

  const tasting = page.getByRole("checkbox", { name: "Schedule a tasting" });
  const rain = page.getByRole("checkbox", { name: "Rain contingency plan" });
  await tasting.check();
  await rain.check();

  await page.getByRole("tab", { name: "Ideas", exact: true }).click();
  const ideas = page.getByRole("tabpanel", { name: "Ideas", exact: true });
  await expect(ideas.getByText("Garden evening")).toBeVisible();
  await expect(ideas.getByText("Thali")).toBeVisible();
  await expect(ideas.getByText("Lawn games")).toBeVisible();
  await expect(ideas.getByText("Marigolds")).toBeVisible();

  await page.getByRole("tab", { name: "Shop Decor", exact: true }).click();
  await expect(page.getByText("Marigold garland")).toBeVisible();
  await expect(page.getByText("approx., check on site")).toBeVisible();
  await expect(page.getByText("not-a-source.example")).toHaveCount(0);
  await page.getByRole("tab", { name: "Venues & Stay", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Garden Hall", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Check availability and prices directly with the venue"),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Decor Preview", exact: true }).click();
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("heading", { name: "Shop decor" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Venues & Stay" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Generate preview" }),
  ).toBeHidden();
  await page.emulateMedia({ media: "screen" });
  await expect(page.getByText("Marigold garland")).toBeHidden();

  expect(decorCalls).toBe(0);
  await page.getByRole("tab", { name: "Decor Preview", exact: true }).click();
  await page.getByRole("button", { name: "Generate preview" }).click();
  await expect(
    page.getByRole("img", { name: "AI concept preview" }),
  ).toBeVisible();
  await expect(page.getByText("AI concept preview")).toBeVisible();
  expect(decorCalls).toBe(1);

  await planTab.click();
  await page.getByRole("button", { name: "Make it cheaper" }).click();
  await expect(
    page.getByText(
      `Budget changed from ${formatINR(80000)} to ${formatINR(64000)}`,
    ),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Budget", exact: true }).click();
  await expect(
    page.getByRole("table", { name: "Budget by category" }),
  ).toContainText(formatINR(64000));
  await page.getByRole("tab", { name: "Vendors", exact: true }).click();
  await expect(tasting).toBeChecked();
  await expect(rain).toBeChecked();

  await planTab.click();
  await page.getByRole("button", { name: "Undo" }).click();
  await page.getByRole("tab", { name: "Budget", exact: true }).click();
  await expect(
    page.getByRole("table", { name: "Budget by category" }),
  ).toContainText(formatINR(80000));
  await expect(page.getByText("Budget changed from")).toHaveCount(0);
  await page.getByRole("tab", { name: "Vendors", exact: true }).click();
  await expect(tasting).toBeChecked();

  await planTab.click();
  await page
    .getByRole("tabpanel", { name: "Plan", exact: true })
    .getByRole("button", { name: "Save this plan" })
    .click();
  await expect(
    page.locator("section", { has: page.locator("#saved-plans-heading") }),
  ).toContainText("Wedding in Pune");
  await page.reload();
  await page
    .getByRole("button", { name: "Open", exact: true })
    .evaluate((element) => (element as HTMLButtonElement).click());
  await expect(page.locator("#city")).toHaveValue("Pune");
  await expect(page.locator("#event-date")).toHaveValue("2026-12-04");
  await expect(page.getByText(plan.summary)).toBeVisible();
  await page.getByRole("tab", { name: "Vendors", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Schedule a tasting" }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Rain contingency plan" }),
  ).toBeChecked();
  await page.getByRole("tab", { name: "Shop Decor", exact: true }).click();
  await expect(page.getByText("Marigold garland")).toBeVisible();
  await page.getByRole("tab", { name: "Decor Preview", exact: true }).click();
  await expect(
    page.getByText("Preview is not stored. Generate it again."),
  ).toBeVisible();
  await expect(page.getByText(decorImage.prompt)).toBeVisible();
  const stored = await page.evaluate(() =>
    localStorage.getItem("toran-saved-plans"),
  );
  expect(stored).toContain(decorImage.prompt);
  expect(stored).not.toContain(decorImage.images[0]?.data);
});

test("a venue failure leaves the shopping list in place", async ({ page }) => {
  await page.route("**/api/plan", async (route) => {
    await route.fulfill({ json: plan });
  });
  await page.route("**/api/shopping", async (route) => {
    await route.fulfill({ json: shopping });
  });
  await page.route("**/api/venues", async (route) => {
    await route.fulfill({
      status: 502,
      json: { error: "Could not generate a plan. Please try again." },
    });
  });
  await page.route("**/api/decor-image", async (route) => {
    await route.fulfill({ json: decorImage });
  });
  await fillWedding(page);
  await page.getByRole("button", { name: "Create my plan" }).click();
  await expect(
    page.getByRole("region", { name: "Invitation preview" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your plan" })).toBeVisible();
  await page.getByRole("tab", { name: "Venues & Stay", exact: true }).click();
  await expect(
    page.getByText("Could not generate a plan. Please try again."),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Shop Decor", exact: true }).click();
  await expect(page.getByText("Marigold garland")).toBeVisible();
  await expect(page.getByText("approx., check on site")).toBeVisible();
  await expect(page.getByText(plan.summary)).toBeHidden();
  await expect(
    page.getByRole("region", { name: "Invitation preview" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your plan" })).toBeHidden();
});

const hindiNames = [
  "शादी का स्थान और फूलों का मंडप",
  "भोजन मिठाई और पेय",
  "फूलों की सजावट और माला",
  "फोटो और वीडियो",
  "संगीत और डीजे",
  "कपड़े गहने और मेहंदी",
  "यात्रा और ठहरना",
  "अतिथि उपहार और कार्ड",
];

const hindiPlan: Plan = {
  summary: "पुणे में चालीस मेहमानों की शादी की योजना।",
  budget: {
    total: 80000,
    categories: hindiNames.map((name) => ({
      name,
      amount: 10000,
      percent: 12.5,
      notes: "यह नोट छोटी स्क्रीन पर अगली पंक्ति में जाता है और कटता नहीं।",
    })),
  },
  timeline: [
    {
      phase: "दो महीने पहले",
      daysBefore: 60,
      tasks: ["स्थल बुक करें"],
    },
    { phase: "बिना तारीख", tasks: ["यह चरण सामान्य रहता है"] },
    { phase: "एक हफ्ता पहले", daysBefore: 7, tasks: ["मेनू पक्का करें"] },
    { phase: "समारोह का दिन", daysBefore: 0, tasks: ["मेहमानों का स्वागत"] },
  ],
  vendors: [
    {
      type: "कैटरर",
      checklist: ["चखने का समय", "बारिश की योजना", "मेनू", "स्टाफ", "बिल"],
      questionsToAsk: ["क्या खाना शाकाहारी है?"],
    },
    {
      type: "फोटोग्राफर",
      checklist: ["तारीख पक्की करें"],
      questionsToAsk: ["कितने घंटे शामिल हैं?"],
    },
    {
      type: "डेकोरेटर",
      checklist: ["रंग चुनें"],
      questionsToAsk: ["कौन से फूल मौसम में हैं?"],
    },
  ],
  ideas: {
    themes: ["गेंदे की शाम", "आंगन की रात", "घर का भोज"],
    menu: ["थाली", "मिठाई"],
    activities: ["लॉन के खेल", "संगीत"],
    decor: ["गेंदे की माला"],
  },
};

test("a Hindi plan with eight budget rows stays inside 375px", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route("**/api/plan", async (route) => {
    await route.fulfill({ json: hindiPlan });
  });
  await page.route("**/api/shopping", async (route) => {
    await route.fulfill({ json: shopping });
  });
  await page.route("**/api/venues", async (route) => {
    await route.fulfill({ json: venues });
  });
  await fillWedding(page);
  await page.locator("#language").selectOption("hi");
  await page.getByRole("button", { name: "Create my plan" }).click();

  await page.getByRole("tab", { name: "Budget", exact: true }).click();
  const table = page.getByRole("table", { name: "Budget by category" });
  for (const name of hindiNames) {
    await expect(table.getByRole("rowheader", { name })).toBeVisible();
  }
  await expect(table).toContainText(`${formatINR(2000)} per guest`);
  await expect(page.locator("[data-slot='chart']")).toHaveAttribute(
    "aria-hidden",
    "true",
  );

  const fit = await page.evaluate(() => {
    const root = document.documentElement;
    const chart = document.querySelector("[data-slot='chart']");
    const svg = chart?.querySelector("svg");
    const plot = svg?.getBoundingClientRect();
    const labels = [...(chart?.querySelectorAll("foreignObject") ?? [])];
    const labelFit = labels.map((node) => {
      const box = node.getBoundingClientRect();
      const inner = node.querySelector("div");
      return {
        inside:
          plot != null &&
          box.width > 0 &&
          box.left >= plot.left - 1 &&
          box.right <= plot.right + 1,
        full: inner != null && inner.scrollHeight <= box.height + 2,
      };
    });
    const clipped = [...document.querySelectorAll("th, td, h3, p, li, span")]
      .filter((node) => node instanceof HTMLElement)
      .filter((node) => {
        const style = getComputedStyle(node);
        return (
          style.textOverflow === "ellipsis" || style.webkitLineClamp !== "none"
        );
      }).length;
    return {
      page: root.scrollWidth - root.clientWidth,
      labels: labelFit,
      clipped,
    };
  });
  expect(fit.page).toBeLessThanOrEqual(1);
  expect(fit.labels).toHaveLength(8);
  expect(fit.labels.every((label) => label.inside && label.full)).toBe(true);
  expect(fit.clipped).toBe(0);

  async function staysInside(panelId: string) {
    const overflow = await page.evaluate((id) => {
      const root = document.documentElement;
      const panel = document.getElementById(id);
      const wide = panel
        ? [...panel.querySelectorAll("p, li, h3, span")].filter(
            (node) =>
              node instanceof HTMLElement &&
              node.clientWidth > 0 &&
              node.scrollWidth > node.clientWidth + 1,
          ).length
        : 0;
      return { page: root.scrollWidth - root.clientWidth, wide };
    }, panelId);
    expect(overflow.page).toBeLessThanOrEqual(1);
    expect(overflow.wide).toBe(0);
  }

  await page.getByRole("tab", { name: "Timeline", exact: true }).click();
  await expect(page.getByText("Next", { exact: true })).toHaveCount(1);
  await staysInside("plan-panel-timeline");
  await page.getByRole("tab", { name: "Vendors", exact: true }).click();
  await expect(page.getByText("0 of 5 done")).toBeVisible();
  await page.getByRole("checkbox", { name: "चखने का समय" }).check();
  await page.getByRole("checkbox", { name: "बारिश की योजना" }).check();
  await expect(page.getByText("2 of 5 done")).toBeVisible();
  await staysInside("plan-panel-vendors");
  await page.getByRole("tab", { name: "Ideas", exact: true }).click();
  await staysInside("plan-panel-ideas");
  await page.getByRole("link", { name: "Open decor preview" }).click();
  await expect(
    page.getByRole("tab", { name: "Decor Preview", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Shop Decor", exact: true }).click();
  await expect(page.getByText("approx., check on site")).toBeVisible();
  await page.getByRole("tab", { name: "Venues & Stay", exact: true }).click();
  await expect(
    page.getByText("Check availability and prices directly with the venue"),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Budget", exact: true }).click();
  const lightBar = await page.evaluate(() => {
    const rect = document.querySelector("[data-slot='chart'] rect[stroke]");
    return rect ? getComputedStyle(rect).stroke : "";
  });
  expect(lightBar).toBe("rgb(42, 27, 61)");
  await page.getByRole("button", { name: "Dark room" }).click();
  const darkBar = await page.evaluate(() => {
    const rect = document.querySelector("[data-slot='chart'] rect[stroke]");
    const arc = document.querySelector("article svg circle:nth-child(2)");
    return {
      stroke: rect ? getComputedStyle(rect).stroke : "",
      arc: arc ? getComputedStyle(arc).stroke : "",
    };
  });
  expect(darkBar.stroke).toBe("rgb(251, 247, 255)");
  expect(darkBar.arc).toBe("rgb(94, 209, 198)");
});
