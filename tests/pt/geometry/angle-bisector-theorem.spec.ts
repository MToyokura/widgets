import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/pt/geometry/angle-bisector-theorem/";

test.describe("Teorema da Bissetriz do Ângulo (pt)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Teorema da Bissetriz do Ângulo/);
    await expect(
      page.getByRole("heading", {
        name: "Teorema da Bissetriz do Ângulo",
        level: 1,
      }),
    ).toBeVisible();
  });

  test("should have the interactive widget", async ({ page }) => {
    const svg = page.locator(
      "svg[aria-label='Diagrama da demonstração do teorema da bissetriz do ângulo']",
    );
    await expect(svg).toBeVisible();
  });

  test("should have interactive points", async ({ page }) => {
    const points = page.locator("circle.cursor-grab");
    await expect(points).toHaveCount(3);
  });

  test("should have a slider to control steps", async ({ page }) => {
    const slider = page.getByRole("slider", { name: /Passo/ });
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue("0");

    await slider.fill("1");
    await expect(slider).toHaveValue("1");
    await expect(page.getByText("Passo 1")).toBeVisible();

    await slider.fill("4");
    await expect(slider).toHaveValue("4");
    await expect(page.getByText("Passo 4")).toBeVisible();
  });

  test("should be able to drag points", async ({ page }) => {
    const pointA = page.locator("circle.cursor-grab").first();
    const box = await pointA.boundingBox();
    if (!box) throw new Error("Could not find point A bounding box");

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await pointA.hover();
    await page.mouse.down();
    await page.mouse.move(startX + 50, startY + 50, { steps: 10 });
    await page.mouse.up();

    const newBox = await pointA.boundingBox();
    if (!newBox)
      throw new Error("Could not find point A bounding box after drag");

    expect(newBox.x).not.toBe(box.x);
    expect(newBox.y).not.toBe(box.y);
  });
});
