import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/hi/geometry/properties-of-parallel-lines-and-angles/";

test.describe("समानांतर रेखाओं और कोणों के गुणधर्म (hi)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("सही शीर्षक दिखता है", async ({ page }) => {
    await expect(page).toHaveTitle(/समानांतर रेखाओं और कोणों के गुणधर्म/);
    await expect(
      page.getByRole("heading", {
        name: "समानांतर रेखाओं और कोणों के गुणधर्म",
        level: 1,
      }),
    ).toBeVisible();
  });

  test("अनुरूप कोण विजेट दिखता है", async ({ page }) => {
    const svg = page.locator(
      "svg[aria-label='Parallel lines and transversal diagram']",
    );
    await expect(svg).toBeVisible();
  });

  test("वैकल्पिक अंतःकोण विजेट दिखता है", async ({ page }) => {
    const svg = page.locator(
      "svg[aria-label='Parallel lines and alternate interior angles']",
    );
    await expect(svg).toBeVisible();
  });

  test("कोण नियंत्रित करने के लिए स्लाइडर दिखते हैं", async ({ page }) => {
    const sliders = page.getByRole("slider", { name: /Angle/ });
    await expect(sliders).toHaveCount(2);
  });
});
