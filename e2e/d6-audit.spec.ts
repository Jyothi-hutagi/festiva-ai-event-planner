import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import type { Plan } from "../lib/schema";

function fixture(name: string) {
  return JSON.parse(
    readFileSync(path.join(process.cwd(), "e2e/fixtures", name), "utf8"),
  ) as unknown;
}

const plan = fixture("plan.json") as Plan;
const shopping = fixture("shopping.json");
const venues = fixture("venues.json");

async function openPlan(page: Page) {
  await page.route("**/api/plan", async (route) => {
    await route.fulfill({ json: plan });
  });
  await page.route("**/api/refine", async (route) => {
    await route.fulfill({ json: plan });
  });
  await page.route("**/api/shopping", async (route) => {
    await route.fulfill({ json: shopping });
  });
  await page.route("**/api/venues", async (route) => {
    await route.fulfill({ json: venues });
  });
  await page.route("**/api/decor-image", async (route) => {
    await route.fulfill({
      json: { prompt: "A garden evening.", images: [] },
    });
  });
  await page.goto("/");
  await page.locator("#event-date").fill("2026-12-04");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.locator("#guest-count").fill("40");
  await page.locator("#budget").fill("80000");
  await page.locator("#city").fill("Pune");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.locator("#preferences").fill("garden party");
  await page.getByRole("button", { name: "Create my plan" }).click();
  await expect(
    page.getByRole("tab", { name: "Plan", exact: true }),
  ).toBeVisible();
}

async function scrollPastInvitation(page: Page) {
  await page.evaluate(() => {
    const invite = [
      ...document.querySelectorAll("[aria-label='Invitation preview']"),
    ].find((el) => !el.closest("[hidden]"));
    if (!invite) return;
    const past = invite.getBoundingClientRect().bottom + window.scrollY + 8;
    (document.scrollingElement ?? document.documentElement).scrollTo(0, past);
  });
}

async function setTheme(page: Page, theme: "light" | "dark") {
  const current = await page.evaluate(() =>
    document.documentElement.getAttribute("data-theme"),
  );
  if (current === theme) return;
  await page
    .getByRole("button", {
      name: theme === "dark" ? "Dark room" : "Light room",
    })
    .click();
}

async function layoutFacts(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const bar = document.querySelector("div.fixed.bottom-0");
    const barBox = bar?.getBoundingClientRect();
    const covered: string[] = [];
    if (barBox && barBox.height > 0) {
      for (const node of document.querySelectorAll(
        "main h2, main h3, main p, main li, main label",
      )) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.closest("div.fixed.bottom-0")) continue;
        const box = node.getBoundingClientRect();
        if (box.height < 8 || box.width < 8) continue;
        const overlaps =
          box.bottom > barBox.top + 1 && box.top < barBox.bottom - 1;
        const onScreen = box.bottom > 0 && box.top < window.innerHeight;
        if (overlaps && onScreen) {
          covered.push((node.textContent ?? "").trim().slice(0, 60));
        }
      }
    }
    const small: string[] = [];
    for (const node of document.querySelectorAll(
      "a, button, input, select, textarea, summary, [role='tab']",
    )) {
      if (!(node instanceof HTMLElement)) continue;
      const box = node.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (box.width < 44 || box.height < 44) {
        const name =
          node.getAttribute("aria-label") ||
          node.getAttribute("name") ||
          (node.textContent ?? "").trim().slice(0, 40);
        small.push(
          `${node.tagName} ${name} ${Math.round(box.width)}x${Math.round(box.height)}`,
        );
      }
    }
    return {
      overflow: root.scrollWidth - root.clientWidth,
      small,
      covered: covered.slice(0, 8),
      barHeight: barBox?.height ?? 0,
    };
  });
}

test("intro and plan stay inside the viewport in both themes", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const widths = [375, 768, 1280];
  for (const width of widths) {
    for (const theme of ["light", "dark"] as const) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      await setTheme(page, theme);
      const intro = await layoutFacts(page);
      expect(intro.overflow, `intro ${width} ${theme}`).toBeLessThanOrEqual(1);
      expect(intro.small, `intro targets ${width} ${theme}`).toEqual([]);
    }
  }

  await page.setViewportSize({ width: 1280, height: 800 });
  await openPlan(page);
  for (const width of widths) {
    for (const theme of ["light", "dark"] as const) {
      await page.setViewportSize({ width, height: 800 });
      await setTheme(page, theme);
      await scrollPastInvitation(page);
      await expect(page.locator("div.fixed.bottom-0")).toBeVisible();
      const facts = await layoutFacts(page);
      expect(facts.overflow, `plan ${width} ${theme}`).toBeLessThanOrEqual(1);
      expect(facts.small, `plan targets ${width} ${theme}`).toEqual([]);
      expect(facts.covered, `sticky ${width} ${theme}`).toEqual([]);
      expect(facts.barHeight, `bar ${width} ${theme}`).toBeGreaterThan(44);
      await page.getByRole("tab", { name: "Vendors", exact: true }).click();
      const vendors = await layoutFacts(page);
      expect(vendors.overflow, `vendors ${width} ${theme}`).toBeLessThanOrEqual(
        1,
      );
      expect(vendors.small, `vendor targets ${width} ${theme}`).toEqual([]);
      await page.getByRole("tab", { name: "Plan", exact: true }).click();
    }
  }
});

test("text, buttons, chart outline, and focus meet the contrast ratios", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await openPlan(page);
  for (const theme of ["light", "dark"] as const) {
    await setTheme(page, theme);
    await page.getByRole("tab", { name: "Budget", exact: true }).click();
    const failures = await page.evaluate(() => {
      function channel(value: number) {
        const c = value / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      }
      function lum(r: number, g: number, b: number) {
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      }
      function ratio(
        a: { r: number; g: number; b: number },
        b: { r: number; g: number; b: number },
      ) {
        const hi = Math.max(lum(a.r, a.g, a.b), lum(b.r, b.g, b.b));
        const lo = Math.min(lum(a.r, a.g, a.b), lum(b.r, b.g, b.b));
        return (hi + 0.05) / (lo + 0.05);
      }
      function parsed(value: string) {
        const match = value.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
        );
        if (!match) return null;
        return {
          r: Number(match[1]),
          g: Number(match[2]),
          b: Number(match[3]),
          a: match[4] === undefined ? 1 : Number(match[4]),
        };
      }
      function backdrop(node: Element | null) {
        let current = node;
        while (current) {
          const color = parsed(getComputedStyle(current).backgroundColor);
          if (color && color.a > 0.99) return color;
          current = current.parentElement;
        }
        return { r: 255, g: 255, b: 255, a: 1 };
      }
      const found: string[] = [];
      for (const node of document.querySelectorAll(
        "h1, h2, h3, p, a, button, label, td, th, li, span",
      )) {
        if (!(node instanceof HTMLElement)) continue;
        const box = node.getBoundingClientRect();
        if (box.width < 2 || box.height < 2) continue;
        if (!(node.textContent ?? "").trim()) continue;
        if (node.closest("[aria-hidden='true']")) continue;
        if (
          node.childElementCount > 0 &&
          node.tagName !== "BUTTON" &&
          node.tagName !== "A"
        ) {
          continue;
        }
        const style = getComputedStyle(node);
        const fg = parsed(style.color);
        const bg = backdrop(node);
        if (!fg) continue;
        const size = Number.parseFloat(style.fontSize);
        const weight = Number.parseInt(style.fontWeight, 10);
        const large = size >= 24 || (size >= 18.7 && weight >= 700);
        const needed = large ? 3 : 4.5;
        const score = ratio(fg, bg);
        if (score + 0.05 < needed) {
          found.push(
            `${node.tagName} "${(node.textContent ?? "").trim().slice(0, 32)}" ${score.toFixed(2)} need ${needed}`,
          );
        }
      }
      const stroke = document.querySelector("[data-slot='chart'] rect[stroke]");
      if (stroke) {
        const color = parsed(getComputedStyle(stroke).stroke);
        const paper = backdrop(stroke.parentElement);
        if (color) {
          const score = ratio(color, paper);
          if (score < 3) found.push(`chart outline ${score.toFixed(2)}`);
        }
      }
      return found.slice(0, 20);
    });
    const selected = page.getByRole("tab", { selected: true });
    await selected.focus();
    await page.keyboard.press("ArrowRight");
    const ring = await page.evaluate(() => {
      const node = document.activeElement;
      if (!(node instanceof HTMLElement)) return null;
      const style = getComputedStyle(node);
      return {
        outline: style.outlineStyle,
        width: style.outlineWidth,
        color: style.outlineColor,
      };
    });
    expect(failures, theme).toEqual([]);
    expect(ring, theme).toEqual({
      outline: "solid",
      width: "2px",
      color: theme === "light" ? "rgb(42, 27, 61)" : "rgb(251, 247, 255)",
    });
  }
});

test("keyboard reaches the form, tabs, ticks, chat, save, and print", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await openPlan(page);
  const planTab = page.getByRole("tab", { name: "Plan", exact: true });
  await planTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Budget", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(planTab).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("tab", { name: "Budget", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(planTab).toBeFocused();

  await page.getByRole("tab", { name: "Vendors", exact: true }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("checkbox", { name: "Schedule a tasting" }).focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("checkbox", { name: "Schedule a tasting" }),
  ).toBeChecked();

  await page.getByRole("tab", { name: "Plan", exact: true }).click();
  const chat = page.getByRole("textbox", { name: "Instruction" });
  await chat.focus();
  await expect(chat).toBeFocused();
  const chatRing = await chat.evaluate((node) => {
    const style = getComputedStyle(node);
    return { outline: style.outlineStyle, width: style.outlineWidth };
  });
  expect(chatRing.outline).toBe("solid");
  expect(chatRing.width).toBe("2px");
  await scrollPastInvitation(page);
  const print = page.getByRole("button", { name: "Print plan" });
  await expect(print).toBeVisible();
  await page.getByRole("button", { name: "Save this plan" }).first().focus();
  await expect(
    page.getByRole("button", { name: "Save this plan" }).first(),
  ).toBeFocused();
  await print.focus();
  await expect(page.getByRole("button", { name: "Print plan" })).toBeFocused();
});

test("print shows every section in plum on white and hides controls", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await openPlan(page);
  await page.emulateMedia({ media: "print" });
  const printed = await page.evaluate(() => {
    function shown(selector: string) {
      const node = document.querySelector(selector);
      if (!(node instanceof HTMLElement)) return false;
      const style = getComputedStyle(node);
      return style.display !== "none" && style.visibility !== "hidden";
    }
    const sample = document.querySelector("#plan-panel-timeline p");
    const style = sample ? getComputedStyle(sample) : null;
    return {
      invitation: shown("[aria-label='Invitation preview'], [role='region']"),
      timeline: shown("#plan-panel-timeline"),
      vendors: shown("#plan-panel-vendors"),
      ideas: shown("#plan-panel-ideas"),
      shop: shown("#plan-panel-shop"),
      venues: shown("#plan-panel-venues"),
      budget: shown("#plan-panel-budget"),
      summary: shown("#plan-panel-plan"),
      decor: shown("#plan-panel-decor"),
      chart: shown("[data-slot='chart']"),
      petal: shown(".petal"),
      button: shown("button"),
      color: style?.color ?? "",
      background: getComputedStyle(document.body).backgroundColor,
    };
  });
  expect(printed.timeline).toBe(true);
  expect(printed.vendors).toBe(true);
  expect(printed.ideas).toBe(true);
  expect(printed.shop).toBe(true);
  expect(printed.venues).toBe(true);
  expect(printed.budget).toBe(true);
  expect(printed.summary).toBe(true);
  expect(printed.decor).toBe(false);
  expect(printed.chart).toBe(false);
  expect(printed.petal).toBe(false);
  expect(printed.button).toBe(false);
  expect(printed.color).toBe("rgb(42, 27, 61)");
  expect(printed.background).toBe("rgb(255, 255, 255)");
  expect(printed.invitation).toBe(true);
});
