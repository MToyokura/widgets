import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH =
  "/es/geometry/construction-of-spatial-figures-through-the-motion-of-plane-figures/";

test.describe("Construcción de figuras espaciales mediante el movimiento de figuras planas (es)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("debe tener el título correcto", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("debe tener visualizaciones Three.js", async ({ page }) => {
    const wrappers = [
      "#moving-line-creates-flat-plane-wrapper",
      "#moving-line-creates-cylindrical-surface-wrapper",
      "#moving-line-creates-conical-surface-wrapper",
      "#moving-triangle-creates-triangular-prism-wrapper",
      "#rotating-square-creates-cylinder-wrapper",
      "#rotating-triangle-creates-cone-wrapper",
    ];

    for (const id of wrappers) {
      const wrapper = page.locator(id);
      await wrapper.scrollIntoViewIfNeeded();
      await expect(wrapper).toBeVisible();
      await expect(wrapper.locator("canvas")).toBeVisible();
    }
  });
});
