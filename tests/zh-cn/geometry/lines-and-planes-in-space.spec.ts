import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/zh-cn/geometry/lines-and-planes-in-space/";

test.describe("空间中的直线与平面 (zh-cn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正确的标题显示", async ({ page }) => {
    await expect(page).toHaveTitle(/空间中的直线与平面/);
    await expect(
      page.getByRole("heading", { name: "空间中的直线与平面", level: 1 }),
    ).toBeVisible();
  });

  test("Three.js 可视化显示", async ({ page }) => {
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
