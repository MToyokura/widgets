import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/hi/geometry/angles-of-a-circle/";

test.describe("वृत्त के कोण (hi)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("सही शीर्षक दिखता है", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("अंतर्लिखित कोण विजेट दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(0);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("केंद्रीय कोण विजेट दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(1);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("थेल्स का प्रमेय विजेट दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(2);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });

  test("अंतर्लिखित कोण प्रमाण विजेट दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(3);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle[style*='touch-action']")).toHaveCount(3);
  });
});
