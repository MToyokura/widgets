import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/ru/geometry/properties-of-parallel-lines-and-angles/";

test.describe("Параллельные прямые и свойства углов (ru)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("правильный заголовок отображается", async ({ page }) => {
    await expect(page).toHaveTitle(/Параллельные прямые и свойства углов/);
    await expect(
      page.getByRole("heading", {
        name: "Параллельные прямые и свойства углов",
        level: 1,
      }),
    ).toBeVisible();
  });

  test("должен быть виджет соответственных углов", async ({ page }) => {
    const svg = page.locator(
      "svg[aria-label='Parallel lines and transversal diagram']",
    );
    await expect(svg).toBeVisible();
  });

  test("должен быть виджет внутренних накрест лежащих углов", async ({
    page,
  }) => {
    const svg = page.locator(
      "svg[aria-label='Parallel lines and alternate interior angles']",
    );
    await expect(svg).toBeVisible();
  });

  test("должны быть ползунки для управления углом", async ({ page }) => {
    const sliders = page.getByRole("slider", { name: /Angle/ });
    await expect(sliders).toHaveCount(2);
  });
});
