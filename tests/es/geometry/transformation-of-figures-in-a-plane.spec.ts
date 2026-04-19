import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/es/geometry/transformation-of-figures-in-a-plane/";

test.describe("Transformación de figuras en un plano (es)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("debe tener el título correcto", async ({ page }) => {
    await expect(page).toHaveTitle(/Transformación de figuras en un plano/);
    await expect(
      page.getByRole("heading", {
        name: "Transformación de figuras en un plano",
        level: 1,
      }),
    ).toBeVisible();
  });

  test("debe tener el widget de traslación", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Translation diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(1);
  });

  test("debe tener el widget de rotación", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Rotation diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(2);
  });

  test("debe tener el widget de reflexión", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Reflection diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(2);
  });
});
