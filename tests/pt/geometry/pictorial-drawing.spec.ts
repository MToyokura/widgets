import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/pt/geometry/pictorial-drawing/";

test.describe("Desenho em Perspectiva (pt)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have the cuboid pictorial drawing", async ({ page }) => {
    const svg = page.locator("svg[aria-labelledby*='cube-pictorial']");
    await expect(svg).toBeVisible();
  });

  test("should have sliders to control scales", async ({ page }) => {
    const sliders = page.getByRole("slider");
    await expect(sliders).toHaveCount(3);
  });
});
