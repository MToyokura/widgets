import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/ru/geometry/transformation-of-figures-in-a-plane/";

test.describe("Преобразования фигур в плоскости (ru)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("правильный заголовок отображается", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("должен иметь виджет параллельного переноса", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(0);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(1);
  });

  test("должен иметь виджет вращения", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(1);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(2);
  });

  test("должен иметь виджет отражения", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(2);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(2);
  });
});
