import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/zh-cn/geometry/angles-of-a-circle/";

test.describe("圆周角与中心角 (zh-cn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正确的标题显示", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("圆周角的窗口部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(0);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("圆心角的窗口部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(1);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("泰勒斯定理的窗口部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(2);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("圆周角定理证明的窗口部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(3);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });
});
