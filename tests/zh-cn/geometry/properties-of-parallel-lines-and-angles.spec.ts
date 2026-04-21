import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/zh-cn/geometry/properties-of-parallel-lines-and-angles/";

test.describe("平行线与角的性质 (zh-cn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正确的标题显示", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("同位角的窗口部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(0);
    await expect(svg).toBeVisible();
  });

  test("错角的窗口部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(1);
    await expect(svg).toBeVisible();
  });

  test("角度控制的滑块存在", async ({ page }) => {
    const sliders = page.getByRole("slider");
    await expect(sliders).toHaveCount(2);
  });
});
