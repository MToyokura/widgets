import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH =
  "/pt/geometry/construction-of-spatial-figures-through-the-motion-of-plane-figures/";

test.describe("Construção de Figuras Espaciais pelo Movimento de Figuras Planas (pt)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have Three.js visualizations", async ({ page }) => {
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
