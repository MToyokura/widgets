import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/bn/geometry/transformation-of-figures-in-a-plane/";

test.describe("সমতলে আকারের রূপান্তর (bn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/সমতলে আকারের রূপান্তর/);
    await expect(
      page.getByRole("heading", { name: "সমতলে আকারের রূপান্তর", level: 1 }),
    ).toBeVisible();
  });

  test("should have the translation widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Translation diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(1);
  });

  test("should have the rotation widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Rotation diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(2);
  });

  test("should have the reflection widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Reflection diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(2);
  });
});
