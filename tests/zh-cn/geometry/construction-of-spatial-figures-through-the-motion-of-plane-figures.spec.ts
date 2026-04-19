import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH =
  "/zh-cn/geometry/construction-of-spatial-figures-through-the-motion-of-plane-figures/";

test.describe("通过平面图形的运动构造空间图形 (zh-cn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正确的标题显示", async ({ page }) => {
    await expect(page).toHaveTitle(/通过平面图形的运动构造空间图形/);
    await expect(
      page.getByRole("heading", {
        name: "通过平面图形的运动构造空间图形",
        level: 1,
      }),
    ).toBeVisible();
  });

  test("Three.js 可视化显示", async ({ page }) => {
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
