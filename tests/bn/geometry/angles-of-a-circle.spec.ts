import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/bn/geometry/angles-of-a-circle/";

test.describe("বৃত্তের কোণ (bn)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/বৃত্তের কোণ/);
    await expect(
      page.getByRole("heading", { name: "বৃত্তের কোণ", level: 1 }),
    ).toBeVisible();
  });

  test("should show the inscribed angle widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Inscribed angle diagram']");
    await expect(svg).toBeVisible();
  });

  test("should show the central angle widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Central angle diagram']");
    await expect(svg).toBeVisible();
  });

  test("should show Thales theorem widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Thales diagram']");
    await expect(svg).toBeVisible();
  });
});
