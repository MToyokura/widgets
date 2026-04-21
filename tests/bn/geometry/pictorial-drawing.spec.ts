import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/bn/geometry/pictorial-drawing/";

test.describe("চিত্রাঙ্কন (bn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should show cuboid pictorial drawing", async ({ page }) => {
    const svg = page.locator("svg[aria-labelledby*='cube-pictorial']");
    await expect(svg).toBeVisible();
  });
});
