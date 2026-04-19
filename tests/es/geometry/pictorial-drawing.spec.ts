import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/es/geometry/pictorial-drawing/";

test.describe("Dibujo pictórico (es)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("debe tener el título correcto", async ({ page }) => {
    await expect(page).toHaveTitle(/Dibujo pictórico/);
    await expect(
      page.getByRole("heading", { name: "Dibujo pictórico", level: 1 }),
    ).toBeVisible();
  });

  test("debe tener el dibujo pictórico del cuboide", async ({ page }) => {
    const svg = page.locator("svg[aria-labelledby*='cube-pictorial']");
    await expect(svg).toBeVisible();
  });

  test("debe tener controles deslizantes para controlar las escalas", async ({
    page,
  }) => {
    const xSlider = page.getByRole("slider", { name: /Eje X/ });
    const ySlider = page.getByRole("slider", { name: /Eje Y/ });
    const zSlider = page.getByRole("slider", { name: /Eje Z/ });

    await expect(xSlider).toBeVisible();
    await expect(ySlider).toBeVisible();
    await expect(zSlider).toBeVisible();
  });
});
