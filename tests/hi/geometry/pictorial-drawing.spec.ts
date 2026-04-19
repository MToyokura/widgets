import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/hi/geometry/pictorial-drawing/";

test.describe("आरेखीय चित्र (hi)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("सही शीर्षक दिखता है", async ({ page }) => {
    await expect(page).toHaveTitle(/आरेखीय चित्र/);
    await expect(
      page.getByRole("heading", { name: "आरेखीय चित्र", level: 1 }),
    ).toBeVisible();
  });

  test("घनाभ का आरेखीय चित्र दिखता है", async ({ page }) => {
    const svg = page.locator("svg[aria-labelledby*='cube-pictorial']");
    await expect(svg).toBeVisible();
  });

  test("माप नियंत्रित करने के लिए स्लाइडर दिखते हैं", async ({ page }) => {
    const xSlider = page.getByRole("slider", { name: /X अक्ष/ });
    const ySlider = page.getByRole("slider", { name: /Y अक्ष/ });
    const zSlider = page.getByRole("slider", { name: /Z अक्ष/ });

    await expect(xSlider).toBeVisible();
    await expect(ySlider).toBeVisible();
    await expect(zSlider).toBeVisible();
  });
});
