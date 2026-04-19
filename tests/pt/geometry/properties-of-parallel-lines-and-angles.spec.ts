import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/pt/geometry/properties-of-parallel-lines-and-angles/";

test.describe("Propriedades das Retas Paralelas e dos Ângulos (pt)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page).toHaveTitle(
      /Propriedades das Retas Paralelas e dos Ângulos/,
    );
    await expect(
      page.getByRole("heading", {
        name: "Propriedades das Retas Paralelas e dos Ângulos",
        level: 1,
      }),
    ).toBeVisible();
  });

  test("should have the corresponding angles widget", async ({ page }) => {
    const svg = page.locator(
      "svg[aria-label='Parallel lines and transversal diagram']",
    );
    await expect(svg).toBeVisible();
  });

  test("should have the alternate angles widget", async ({ page }) => {
    const svg = page.locator(
      "svg[aria-label='Parallel lines and alternate interior angles']",
    );
    await expect(svg).toBeVisible();
  });

  test("should have sliders to control the angle", async ({ page }) => {
    const sliders = page.getByRole("slider", { name: /Angle/ });
    await expect(sliders).toHaveCount(2);
  });
});
