import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/pt/geometry/angles-of-a-circle/";

test.describe("Ângulos de uma Circunferência (pt)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("should have the correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Ângulos de uma Circunferência/);
    await expect(
      page.getByRole("heading", {
        name: "Ângulos de uma Circunferência",
        level: 1,
      }),
    ).toBeVisible();
  });

  test("should have the inscribed angle widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Inscribed angle diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(3);
  });

  test("should have the central angle widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Central angle diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(3);
  });

  test("should have the Thales theorem widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Thales diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(3);
  });

  test("should have the inscribed angle proof widget", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Inscribed angle proof diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(3);
  });
});
