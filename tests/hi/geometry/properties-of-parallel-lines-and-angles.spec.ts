import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/hi/geometry/properties-of-parallel-lines-and-angles/";

test.describe("समानांतर रेखाओं और कोणों के गुणधर्म (hi)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("सही शीर्षक दिखता है", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("अनुरूप कोण विजेट दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(0);
    await expect(svg).toBeVisible();
  });

  test("वैकल्पिक अंतःकोण विजेट दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-label]").nth(1);
    await expect(svg).toBeVisible();
  });

  test("कोण नियंत्रित करने के लिए स्लाइडर दिखते हैं", async ({ page }) => {
    const sliders = page.getByRole("slider");
    await expect(sliders).toHaveCount(2);
  });
});
