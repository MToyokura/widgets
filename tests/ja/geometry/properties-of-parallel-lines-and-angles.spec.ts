import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/ja/geometry/properties-of-parallel-lines-and-angles/";

test.describe("線と角の性質 (ja)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正しいタイトルが表示されること", async ({ page }) => {
    await expect(page).toHaveTitle(/線と角の性質/);
    await expect(
      page.getByRole("heading", { name: "線と角の性質", level: 1 }),
    ).toBeVisible();
  });

  test("同位角のウィジェットが表示されること", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Parallel lines and transversal diagram']");
    await expect(svg).toBeVisible();
  });

  test("錯角のウィジェットが表示されること", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Parallel lines and alternate interior angles']");
    await expect(svg).toBeVisible();
  });

  test("角度を制御するスライダーがあること", async ({ page }) => {
    const sliders = page.getByRole("slider", { name: /Angle/ });
    await expect(sliders).toHaveCount(2);
  });
});
