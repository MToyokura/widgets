import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/en/geometry/properties-of-parallel-lines-and-angles/";

test.describe("Parallel Lines and Angle Properties (en)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Parallel Lines and Angle Properties/);
    await expect(
      page.getByRole("heading", { name: "Parallel Lines and Angle Properties", level: 1 }),
    ).toBeVisible();
  });

  test("should have the corresponding angles widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Parallel lines and transversal diagram']");
    await expect(svg).toBeVisible();
  });

  test("should have the alternate angles widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Parallel lines and alternate interior angles']");
    await expect(svg).toBeVisible();
  });

  test("should have sliders to control the angle", async ({ page }) => {
    const sliders = page.getByRole("slider", { name: /Angle/ });
    await expect(sliders).toHaveCount(2);
  });
});
