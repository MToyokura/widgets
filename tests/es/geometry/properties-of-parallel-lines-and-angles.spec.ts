import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/es/geometry/properties-of-parallel-lines-and-angles/";

test.describe("Propiedades de líneas paralelas y ángulos (es)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("debe tener el título correcto", async ({ page }) => {
    await expect(page).toHaveTitle(/Propiedades de líneas paralelas y ángulos/);
    await expect(
      page.getByRole("heading", {
        name: "Propiedades de líneas paralelas y ángulos",
        level: 1,
      }),
    ).toBeVisible();
  });

  test("debe tener el widget de ángulos correspondientes", async ({ page }) => {
    const svg = page.locator(
      "svg[aria-label='Parallel lines and transversal diagram']",
    );
    await expect(svg).toBeVisible();
  });

  test("debe tener el widget de ángulos alternos", async ({ page }) => {
    const svg = page.locator(
      "svg[aria-label='Parallel lines and alternate interior angles']",
    );
    await expect(svg).toBeVisible();
  });

  test("debe tener controles deslizantes para controlar el ángulo", async ({
    page,
  }) => {
    const sliders = page.getByRole("slider", { name: /Angle/ });
    await expect(sliders).toHaveCount(2);
  });
});
