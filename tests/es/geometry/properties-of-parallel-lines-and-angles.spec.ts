import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/es/geometry/properties-of-parallel-lines-and-angles/";

test.describe("Propiedades de líneas paralelas y ángulos (es)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("debe tener el título correcto", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("debe tener el widget de ángulos correspondientes", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(0);
    await expect(svg).toBeVisible();
  });

  test("debe tener el widget de ángulos alternos", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(1);
    await expect(svg).toBeVisible();
  });

  test("debe tener controles deslizantes para controlar el ángulo", async ({
    page,
  }) => {
    const sliders = page.getByRole("slider");
    await expect(sliders).toHaveCount(2);
  });
});
