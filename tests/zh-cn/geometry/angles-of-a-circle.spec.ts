import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/zh-cn/geometry/angles-of-a-circle/";

test.describe("圆周角与中心角 (zh-cn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正确的标题显示", async ({ page }) => {
    await expect(page).toHaveTitle(/圆周角与中心角/);
    await expect(
      page.getByRole("heading", { name: "圆周角与中心角", level: 1 }),
    ).toBeVisible();
  });

  test("圆周角的窗口部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Inscribed angle diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(3);
  });

  test("圆心角的窗口部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Central angle diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(3);
  });

  test("泰勒斯定理的窗口部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Thales diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(3);
  });

  test("圆周角定理证明的窗口部件显示", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Inscribed angle proof diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(3);
  });
});
