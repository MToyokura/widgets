import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/pt/geometry/lines-and-planes-in-space/";

test.describe("Retas e Planos no Espaço (pt)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have Three.js visualizations", async ({ page }) => {
    const wrappers = [
      "#three-points-not-collinear-wrapper",
      "#line-and-point-not-on-line-wrapper",
      "#intersecting-lines-wrapper",
      "#intersecting-lines-above-wrapper",
      "#parallel-lines-wrapper",
      "#skew-position-wrapper",
    ];

    for (const id of wrappers) {
      const wrapper = page.locator(id);
      await wrapper.scrollIntoViewIfNeeded();
      await expect(wrapper).toBeVisible();
      await expect(wrapper.locator("canvas")).toBeVisible();
    }
  });
});
