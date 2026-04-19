import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/zh-cn/geometry/pictorial-drawing/";

test.describe("见取图 (zh-cn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正确的标题显示", async ({ page }) => {
    await expect(page).toHaveTitle(/见取图/);
    await expect(
      page.getByRole("heading", { name: "见取图", level: 1 }),
    ).toBeVisible();
  });

  test("长方体的见取图显示", async ({ page }) => {
    const svg = page.locator("svg[aria-labelledby*='cube-pictorial']");
    await expect(svg).toBeVisible();
  });

  test("控制缩放的滑块存在", async ({ page }) => {
    const xSlider = page.getByRole("slider", { name: /X 方向/ });
    const ySlider = page.getByRole("slider", { name: /Y 方向/ });
    const zSlider = page.getByRole("slider", { name: /Z 方向/ });

    await expect(xSlider).toBeVisible();
    await expect(ySlider).toBeVisible();
    await expect(zSlider).toBeVisible();
  });
});
