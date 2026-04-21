import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/ru/geometry/lines-and-planes-in-space/";

test.describe("Прямые и плоскости в пространстве (ru)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("правильный заголовок отображается", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("должны отображаться Three.js визуализации", async ({ page }) => {
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
