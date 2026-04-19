import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/zh-cn/geometry/transformation-of-figures-in-a-plane/";

test.describe("平面图形的变换 (zh-cn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正确的标题显示", async ({ page }) => {
    await expect(page).toHaveTitle(/平面图形的变换/);
    await expect(
      page.getByRole("heading", { name: "平面图形的变换", level: 1 }),
    ).toBeVisible();
  });

  test("平移的窗口部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Translation diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(1);
  });

  test("旋转的窗口部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Rotation diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(2);
  });

  test("反射的窗口部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Reflection diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(2);
  });
});
