import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/hi/geometry/angles-of-a-circle/";

test.describe("वृत्त के कोण (hi)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("सही शीर्षक दिखता है", async ({ page }) => {
    await expect(page).toHaveTitle(/वृत्त के कोण/);
    await expect(
      page.getByRole("heading", { name: "वृत्त के कोण", level: 1 }),
    ).toBeVisible();
  });

  test("अंतर्लिखित कोण विजेट दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Inscribed angle diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(3);
  });

  test("केंद्रीय कोण विजेट दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Central angle diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(3);
  });

  test("थेल्स का प्रमेय विजेट दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Thales diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(3);
  });

  test("अंतर्लिखित कोण प्रमाण विजेट दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-label='Inscribed angle proof diagram']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(3);
  });
});
