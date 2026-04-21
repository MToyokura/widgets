import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PATH = "/hi/geometry/lines-and-planes-in-space/";

test.describe("अंतरिक्ष में रेखाएँ और समतल (hi)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${PATH}`);
  });

  test("सही शीर्षक दिखता है", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("Three.js दृश्य दिखते हैं", async ({ page }) => {
    const wrappers = [
      "#three-points-not-collinear-wrapper",
      "#line-and-point-not-on-line-wrapper",
      "#intersecting-lines-wrapper",
      "#intersecting-lines-above-wrapper",
      "#parallel-lines-wrapper",
      "#skew-position-wrapper",
    ];

    for (const id of wrappers) {
      const wrapper = page.locator(id);
      await wrapper.scrollIntoViewIfNeeded();
      await expect(wrapper).toBeVisible();
      await expect(wrapper.locator("canvas")).toBeVisible();
    }
  });
});
