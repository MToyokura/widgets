import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/es/geometry/angles-of-a-circle/";

test.describe("Ángulos de un círculo (es)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("debe tener el título correcto", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("debe mostrar el widget de ángulo inscrito", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(0);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("debe mostrar el widget de ángulo central", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(1);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("debe mostrar el widget del teorema de Thales", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(2);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("debe mostrar el widget de demostración del ángulo inscrito", async ({
    page,
  }) => {
    const svg = page.locator("svg[aria-label]").nth(3);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });
});
