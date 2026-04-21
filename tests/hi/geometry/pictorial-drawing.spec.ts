import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/hi/geometry/pictorial-drawing/";

test.describe("आरेखीय चित्र (hi)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("सही शीर्षक दिखता है", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("घनाभ का आरेखीय चित्र दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-labelledby*='cube-pictorial']");
    await expect(svg).toBeVisible();
  });

  test("माप नियंत्रित करने के लिए स्लाइडर दिखते हैं", async ({ page }) => {
    const sliders = page.getByRole("slider");
    await expect(sliders).toHaveCount(3);
  });
});
