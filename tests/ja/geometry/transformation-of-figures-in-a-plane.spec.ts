import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/ja/geometry/transformation-of-figures-in-a-plane/";

test.describe("平面における図形の移動 (ja)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("正しいタイトルが表示されること", async ({ page }) => {
    await expect(page).toHaveTitle(/平面における図形の移動/);
    await expect(
      page.getByRole("heading", { name: "平面における図形の移動", level: 1 }),
    ).toBeVisible();
  });

  test("平行移動のウィジェットが表示されること", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Translation diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(1);
  });

  test("回転移動のウィジェットが表示されること", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Rotation diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(2);
  });

  test("対称移動のウィジェットが表示されること", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Reflection diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(2);
  });
});
