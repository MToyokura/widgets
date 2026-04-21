import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/pt/geometry/properties-of-parallel-lines-and-angles/";

test.describe("Propriedades das Retas Paralelas e dos Ângulos (pt)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have the corresponding angles widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(0);
    await expect(svg).toBeVisible();
  });

  test("should have the alternate angles widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(1);
    await expect(svg).toBeVisible();
  });

  test("should have sliders to control the angle", async ({ page }) => {
    const sliders = page.getByRole("slider");
    await expect(sliders).toHaveCount(2);
  });
});
