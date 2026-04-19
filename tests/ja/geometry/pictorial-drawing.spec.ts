import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/ja/geometry/pictorial-drawing/";

test.describe("見取図 (ja)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正しいタイトルが表示されること", async ({ page }) => {
    await expect(page).toHaveTitle(/見取図/);
    await expect(
      page.getByRole("heading", { name: "見取図", level: 1 }),
    ).toBeVisible();
  });

  test("直方体の見取図が表示されること", async ({ page }) => {
    const svg = page.locator("svg[aria-labelledby*='cube-pictorial']");
    await expect(svg).toBeVisible();
  });

  test("スケールを制御するスライダーがあること", async ({ page }) => {
    const xSlider = page.getByRole("slider", { name: /X 方向/ });
    const ySlider = page.getByRole("slider", { name: /Y 方向/ });
    const zSlider = page.getByRole("slider", { name: /Z 方向/ });

    await expect(xSlider).toBeVisible();
    await expect(ySlider).toBeVisible();
    await expect(zSlider).toBeVisible();
  });
});
