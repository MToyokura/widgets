import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/widgets";
const PATH = "/hi/geometry/transformation-of-figures-in-a-plane/";

test.describe("समतल में आकृतियों का रूपांतरण (hi)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("सही शीर्षक दिखता है", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("स्थानांतरण विजेट दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(0);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(1);
  });

  test("घूर्णन विजेट दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(1);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(2);
  });

  test("प्रतिबिंब विजेट दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(2);
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle.cursor-grab")).toHaveCount(2);
  });
});
