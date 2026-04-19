import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/zh-cn/geometry/properties-of-parallel-lines-and-angles/";

test.describe("平行线与角的性质 (zh-cn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正确的标题显示", async ({ page }) => {
    await expect(page).toHaveTitle(/平行线与角的性质/);
    await expect(
      page.getByRole("heading", { name: "平行线与角的性质", level: 1 }),
    ).toBeVisible();
  });

  test("同位角的窗口部件显示", async ({ page }) => {
    const svg = page.locator(
      "svg[aria-label='Parallel lines and transversal diagram']",
    );
    await expect(svg).toBeVisible();
  });

  test("错角的窗口部件显示", async ({ page }) => {
    const svg = page.locator(
      "svg[aria-label='Parallel lines and alternate interior angles']",
    );
    await expect(svg).toBeVisible();
  });

  test("角度控制的滑块存在", async ({ page }) => {
    const sliders = page.getByRole("slider", { name: /Angle/ });
    await expect(sliders).toHaveCount(2);
  });
});
