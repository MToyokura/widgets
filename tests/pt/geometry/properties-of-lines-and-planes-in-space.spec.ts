import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/pt/geometry/properties-of-lines-and-planes-in-space/";

test.describe("Propriedades de Retas e Planos no Espaço (pt)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have Three.js visualizations", async ({ page }) => {
    const wrappers = [
      "#perpendicular-line-and-plane-wrapper",
      "#two-lines-parallel-to-same-line-wrapper",
      "#two-lines-perpendicular-to-same-line-wrapper",
    ];

    for (const id of wrappers) {
      const wrapper = page.locator(id);
      await wrapper.scrollIntoViewIfNeeded();
      await expect(wrapper).toBeVisible();
      await expect(wrapper.locator("canvas")).toBeVisible();
    }
  });
});
