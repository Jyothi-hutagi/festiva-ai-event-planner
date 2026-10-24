import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const plan = JSON.parse(
  readFileSync(path.join(process.cwd(), "e2e/fixtures/plan.json"), "utf8"),
);

test("retry stays a single line and the toolbar keeps the domain with the link", async ({
  page,
}) => {
  await page.route("**/api/plan", async (route) => {
    await route.fulfill({ json: plan });
  });
  await page.route("**/api/shopping", async (route) => {
    await route.fulfill({ json: { items: [] } });
  });
  await page.route("**/api/venues", async (route) => {
    await route.fulfill({ json: { venues: [] } });
  });
  await page.route("**/api/refine", async (route) => {
    await route.fulfill({
      status: 502,
      json: { error: "Could not generate a plan. Please try again." },
    });
  });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.locator("#event-date").fill("2026-12-04");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.locator("#guest-count").fill("40");
  await page.locator("#budget").fill("80000");
  await page.locator("#city").fill("Pune");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.locator("#preferences").fill("garden party");
  await page.getByRole("button", { name: "Create my plan" }).click();
  const line = page.getByRole("listitem").filter({
    hasText: "Add more activities for kids",
  });
  await page.getByRole("button", { name: "Add more activities for kids" }).click();
  await expect(line).toHaveCount(1);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(line).toHaveCount(1);
  const retry = page.getByRole("button", { name: "Try again" });
  const width = await retry.evaluate((node) => node.getBoundingClientRect().width);
  expect(width).toBeLessThan(240);

  await page.evaluate(() => {
    const invite = [...document.querySelectorAll("[aria-label='Invitation preview']")].find(
      (el) => !el.closest("[hidden]"),
    );
    if (!invite) return;
    const past = invite.getBoundingClientRect().bottom + window.scrollY + 8;
    (document.scrollingElement ?? document.documentElement).scrollTo(0, past);
  });
  const share = page.getByRole("link", { name: "Share on WhatsApp" });
  await expect(share).toBeVisible();
  await expect(page.getByText("wa.me")).toHaveCount(0);
});
