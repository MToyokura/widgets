import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/zh-cn/geometry/properties-of-lines-and-planes-in-space/";

test.describe("空间中直线与平面的性质 (zh-cn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正确的标题显示", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("Three.js 可视化显示", async ({ page }) => {
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
