import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/ru/geometry/pictorial-drawing/";

test.describe("Пикториальное изображение (ru)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("правильный заголовок отображается", async ({ page }) => {
    await expect(page).toHaveTitle(/Пикториальное изображение/);
    await expect(
      page.getByRole("heading", {
        name: "Пикториальное изображение",
        level: 1,
      }),
    ).toBeVisible();
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
    const xSlider = page.getByRole("slider", { name: /Ось X/ });
    const ySlider = page.getByRole("slider", { name: /Ось Y/ });
    const zSlider = page.getByRole("slider", { name: /Ось Z/ });

    await expect(xSlider).toBeVisible();
    await expect(ySlider).toBeVisible();
    await expect(zSlider).toBeVisible();
  });
});
