import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/es/geometry/pictorial-drawing/";

test.describe("Dibujo pictórico (es)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("debe tener el título correcto", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("debe tener el dibujo pictórico del cuboide", async ({ page }) => {
    const svg = page.locator("svg[aria-labelledby*='cube-pictorial']");
    await expect(svg).toBeVisible();
  });

  test("debe tener controles deslizantes para controlar las escalas", async ({
    page,
  }) => {
    const sliders = page.getByRole("slider");
    await expect(sliders).toHaveCount(3);
  });
});
