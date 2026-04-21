import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/ru/geometry/properties-of-parallel-lines-and-angles/";

test.describe("Параллельные прямые и свойства углов (ru)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("правильный заголовок отображается", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("должен быть виджет соответственных углов", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(0);
    await expect(svg).toBeVisible();
  });

  test("должен быть виджет внутренних накрест лежащих углов", async ({
    page,
  }) => {
    const svg = page.locator("svg[aria-label]").nth(1);
    await expect(svg).toBeVisible();
  });

  test("должны быть ползунки для управления углом", async ({ page }) => {
    const sliders = page.getByRole("slider");
    await expect(sliders).toHaveCount(2);
  });
});
