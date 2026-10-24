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
  await page.getByRole("button", { name: "Next" }).click();
  await page.locator("#guest-count").fill("40");
  await page.locator("#budget").fill("80000");
  await page.locator("#city").fill("Pune");
  await page.getByRole("button", { name: "Next" }).click();
  await page.locator("#preferences").fill("garden party");
}

test("creates, refines, undoes, and restores a saved plan", async ({
  page,
}) => {
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
    page.getByRole("tab", { name: "Decor Preview", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(planTab).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("table", { name: "Budget by category" }),
  ).toContainText(formatINR(80000));
  await expect(page.getByText("Book the venue")).toBeVisible();
  await expect(page.getByText("Confirm the menu")).toBeVisible();
  await expect(page.getByText("Welcome guests")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Caterer" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Photographer" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Decorator" })).toBeVisible();

  for (const [tab, idea] of [
    ["Themes", "Garden evening"],
    ["Menu", "Thali"],
    ["Activities", "Lawn games"],
    ["Decor", "Marigolds"],
  ] as const) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    await expect(
      page.getByRole("tabpanel", { name: tab, exact: true }).getByText(idea),
    ).toBeVisible();
  }

  const tasting = page.getByRole("checkbox", { name: "Schedule a tasting" });
  const rain = page.getByRole("checkbox", { name: "Rain contingency plan" });
  await tasting.check();
  await rain.check();

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
  await planTab.click();
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

  await page.getByRole("button", { name: "Make it cheaper" }).click();
  await expect(
    page.getByText(
      `Budget changed from ${formatINR(80000)} to ${formatINR(64000)}`,
    ),
  ).toBeVisible();
  await expect(tasting).toBeChecked();
  await expect(rain).toBeChecked();

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(
    page.getByRole("table", { name: "Budget by category" }),
  ).toContainText(formatINR(80000));
  await expect(page.getByText("Budget changed from")).toHaveCount(0);
  await expect(tasting).toBeChecked();

  await page.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByText("Wedding in Pune", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await expect(page.locator("#city")).toHaveValue("Pune");
  await expect(page.locator("#event-date")).toHaveValue("2026-12-04");
  await expect(page.getByText(plan.summary)).toBeVisible();
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
    localStorage.getItem("festiva-saved-plans"),
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
  await expect(page.getByRole("heading", { name: "Your plan" })).toBeVisible();
  await page.getByRole("tab", { name: "Venues & Stay", exact: true }).click();
  await expect(
    page.getByText("Could not generate a plan. Please try again."),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Shop Decor", exact: true }).click();
  await expect(page.getByText("Marigold garland")).toBeVisible();
  await expect(page.getByText("approx., check on site")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your plan" })).toBeHidden();
});
