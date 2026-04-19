import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/ja/geometry/construction-of-spatial-figures-through-the-motion-of-plane-figures/";

test.describe("平面図形の運動による空間図形の構成 (ja)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正しいタイトルが表示されること", async ({ page }) => {
    await expect(page).toHaveTitle(/平面図形の運動による空間図形の構成/);
    await expect(
      page.getByRole("heading", { name: "平面図形の運動による空間図形の構成", level: 1 }),
    ).toBeVisible();
  });

  test("Three.jsのビジュアライゼーションが表示されること", async ({ page }) => {
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
