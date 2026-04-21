import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/en/geometry/pictorial-drawing/";

test.describe("Pictorial Drawing (en)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Pictorial Drawing/);
    await expect(
      page.getByRole("heading", { name: "Pictorial Drawing", level: 1 }),
    ).toBeVisible();
  });

  test("should have the cuboid pictorial drawing", async ({ page }) => {
    const svg = page.locator("svg[aria-labelledby*='cube-pictorial']");
    await expect(svg).toBeVisible();
  });

  test("should have sliders to control scales", async ({ page }) => {
    const xSlider = page.getByRole("slider", { name: /X axis/ });
    const ySlider = page.getByRole("slider", { name: /Y axis/ });
    const zSlider = page.getByRole("slider", { name: /Z axis/ });

    await expect(xSlider).toBeVisible();
    await expect(ySlider).toBeVisible();
    await expect(zSlider).toBeVisible();
  });
});
