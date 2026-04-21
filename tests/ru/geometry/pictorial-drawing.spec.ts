import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/ru/geometry/pictorial-drawing/";

test.describe("Пикториальное изображение (ru)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("правильный заголовок отображается", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("должно отображаться пикториальное изображение кубоида", async ({
    page,
  }) => {
    const svg = page.locator("svg[aria-labelledby*='cube-pictorial']");
    await expect(svg).toBeVisible();
  });

  test("должны быть ползунки для контролирования масштабов", async ({
    page,
  }) => {
    const sliders = page.getByRole("slider");
    await expect(sliders).toHaveCount(3);
  });
});
