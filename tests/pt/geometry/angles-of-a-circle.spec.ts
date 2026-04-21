import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/pt/geometry/angles-of-a-circle/";

test.describe("Ângulos de uma Circunferência (pt)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have the inscribed angle widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(0);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("should have the central angle widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(1);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("should have the Thales theorem widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(2);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("should have the inscribed angle proof widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(3);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });
});
